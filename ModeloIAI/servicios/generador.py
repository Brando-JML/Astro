import re
import random
import torch
import csv
import json
import time
import urllib.request
import urllib.error
from collections import defaultdict
from transformers import AutoTokenizer

# =========================
# PROVEEDORES
# =========================
PROVEEDORES = {
    "Groq (Llama 3 - GRATIS)": {
        "url": "https://api.groq.com/openai/v1/chat/completions",
        "modelo": "llama-3.3-70b-versatile",
        "formato": "openai",
        "key_env": "GROQ_API_KEY",
        "key_url": "https://console.groq.com/keys",
        "gratuito": True,
    },
    "Google Gemini (GRATIS)": {
        "url": "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        "modelo": "gemini-2.0-flash",
        "formato": "gemini",
        "key_env": "GEMINI_API_KEY",
        "key_url": "https://aistudio.google.com/app/apikey",
        "gratuito": True,
    },
    "Ollama (Local - GRATIS)": {
        "url": "http://localhost:11434/api/chat",
        "modelo": "llama3",
        "formato": "ollama",
        "key_env": "",
        "key_url": "https://ollama.com/download",
        "gratuito": True,
    },
    "Anthropic Claude": {
        "url": "https://api.anthropic.com/v1/messages",
        "modelo": "claude-sonnet-4-6",
        "formato": "anthropic",
        "key_env": "ANTHROPIC_API_KEY",
        "key_url": "https://console.anthropic.com/settings/keys",
        "gratuito": False,
    },
}


class GeneradorExamen:
    def __init__(self, ruta_dataset, modelo=None, label_encoder=None,
                 proveedor_ia="Ollama (Local - GRATIS)", api_key="",
                 modelo_ollama="llama3"):
        self.ruta_dataset  = ruta_dataset
        self.modelo        = modelo
        self.label_encoder = label_encoder
        self.proveedor_ia  = proveedor_ia
        self.api_key       = api_key
        self.modelo_ollama = modelo_ollama

        self.tokenizer = AutoTokenizer.from_pretrained(
            "dccuchile/bert-base-spanish-wwm-uncased"
        )
        self.data = self.cargar_dataset()

    # ─────────────────────────────────────────
    # Cargar CSV
    # ─────────────────────────────────────────
    def cargar_dataset(self):
        data = []

        def parsear_opciones(texto):
            partes = texto.split(";")
            opciones = []
            for p in partes:
                p = p.strip()
                if ")" in p:
                    p = p.split(")", 1)[1].strip()
                opciones.append(p)
            return opciones

        with open(self.ruta_dataset, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                row["opciones"] = parsear_opciones(row["opciones"])
                try:
                    row["dificultad"] = float(row["dificultad"])
                except (ValueError, KeyError):
                    row["dificultad"] = 0.5
                data.append(row)

        return data

    # ─────────────────────────────────────────
    # Llamada genérica a cualquier proveedor
    # ─────────────────────────────────────────
    def _llamar_ia(self, prompt):
        cfg     = PROVEEDORES[self.proveedor_ia]
        fmt     = cfg["formato"]
        api_key = self.api_key

        if fmt != "ollama" and not api_key:
            raise Exception(
                f"Falta la API Key para {self.proveedor_ia}.\n"
                f"Obtén una en: {cfg['key_url']}"
            )

        # ── OpenAI-compatible (Groq) ──────────────
        if fmt == "openai":
            payload = json.dumps({
                "model": cfg["modelo"],
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2,
                "max_tokens": 8000,
            }).encode("utf-8")
            req = urllib.request.Request(
                cfg["url"], data=payload,
                headers={
                    "Content-Type":  "application/json",
                    "Authorization": f"Bearer {api_key}",
                    "User-Agent":    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Accept":        "application/json",
                    "Origin":        "https://console.groq.com",
                    "Referer":       "https://console.groq.com/",
                },
                method="POST"
            )
            data = self._hacer_peticion(req)
            return data["choices"][0]["message"]["content"]

        # ── Anthropic Claude ──────────────────────
        elif fmt == "anthropic":
            payload = json.dumps({
                "model": cfg["modelo"],
                "max_tokens": 8000,
                "messages": [{"role": "user", "content": prompt}],
            }).encode("utf-8")
            req = urllib.request.Request(
                cfg["url"], data=payload,
                headers={
                    "Content-Type":      "application/json",
                    "anthropic-version": "2023-06-01",
                    "x-api-key":         api_key,
                },
                method="POST"
            )
            data = self._hacer_peticion(req)
            return "".join(
                b.get("text", "") for b in data.get("content", [])
                if b.get("type") == "text"
            )

        # ── Google Gemini ─────────────────────────
        elif fmt == "gemini":
            url = f"{cfg['url']}?key={api_key}"
            payload = json.dumps({
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"maxOutputTokens": 8000, "temperature": 0.2},
            }).encode("utf-8")
            req = urllib.request.Request(
                url, data=payload,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            data = self._hacer_peticion(req)
            return data["candidates"][0]["content"]["parts"][0]["text"]

        # ── Ollama local ──────────────────────────
        elif fmt == "ollama":
            modelo = self.modelo_ollama or cfg["modelo"]
            payload = json.dumps({
                "model":    modelo,
                "messages": [{"role": "user", "content": prompt}],
                "stream":   False,
            }).encode("utf-8")
            req = urllib.request.Request(
                cfg["url"], data=payload,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            data = self._hacer_peticion(req)
            return data["message"]["content"]

        else:
            raise Exception(f"Formato desconocido: {fmt}")

    def _hacer_peticion(self, req):
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8")
            try:
                msg = json.loads(body).get("error", {})
                msg = msg.get("message", body) if isinstance(msg, dict) else str(msg)
            except Exception:
                msg = body
            raise Exception(f"Error HTTP {e.code}: {msg}")
        except urllib.error.URLError as e:
            raise Exception(
                f"No se pudo conectar con {self.proveedor_ia}: {e.reason}\n"
                "Verifica tu conexión o que el servicio esté disponible."
            )

    def _parsear_preguntas_json(self, texto):
        texto = texto.strip()
        if texto.startswith("```"):
            partes = texto.split("```")
            texto  = partes[1] if len(partes) > 1 else texto
            if texto.startswith("json"):
                texto = texto[4:]
        inicio = texto.find("{")
        fin    = texto.rfind("}") + 1
        if inicio != -1 and fin > inicio:
            texto = texto[inicio:fin]
        return json.loads(texto.strip())

    # ─────────────────────────────────────────
    # Filtros
    # ─────────────────────────────────────────
    def filtrar_preguntas(self, institucion, rango_dificultad=None):
        resultado = [
            p for p in self.data
            if p["universidad"].strip().lower() == institucion.strip().lower()
        ]
        if rango_dificultad:
            dmin, dmax = rango_dificultad
            resultado = [
                p for p in resultado
                if dmin <= p["dificultad"] <= dmax
            ]
        return resultado

    def clasificar_por_tema(self, preguntas):
        temas = defaultdict(list)
        for p in preguntas:
            temas[p["tema"].strip().lower()].append(p)
        return temas

    def construir_config(self, temas_disponibles, total_preguntas, temas_dict=None):
        num_temas = len(temas_disponibles)
        if num_temas == 0:
            return {}

        base     = total_preguntas // num_temas
        sobrante = total_preguntas % num_temas
        config   = {}

        for i, tema in enumerate(temas_disponibles):
            cantidad = base + (1 if i < sobrante else 0)
            if temas_dict and tema in temas_dict:
                cantidad = min(cantidad, len(temas_dict[tema]))
            config[tema] = cantidad

        return config

    # ─────────────────────────────────────────
    # NLP (BETO)
    # ─────────────────────────────────────────
    def vectorizar(self, texto):
        return self.tokenizer(
            texto,
            truncation=True,
            padding='max_length',
            max_length=128,
            return_tensors="pt"
        )

    def predecir_dificultad(self, pregunta):
        if not self.modelo:
            return pregunta.get("dificultad", 0.5)

        texto    = pregunta["pregunta"] + " " + str(pregunta["opciones"])
        encoding = self.vectorizar(texto)

        with torch.no_grad():
            dificultad, _ = self.modelo(
                encoding["input_ids"],
                encoding["attention_mask"]
            )
        return dificultad.item()

    # ─────────────────────────────────────────
    # Selección desde dataset
    # ─────────────────────────────────────────
    def seleccionar_preguntas(self, temas, config):
        examen = []

        for tema, cantidad in config.items():
            if tema not in temas:
                print(f"⚠️  Tema '{tema}' no encontrado, se omite.")
                continue

            disponibles = sorted(
                temas[tema],
                key=lambda x: self.predecir_dificultad(x),
                reverse=True
            )

            seleccion = random.sample(
                disponibles,
                min(cantidad, len(disponibles))
            )
            examen.extend(seleccion)

        random.shuffle(examen)
        return examen

    # ─────────────────────────────────────────
    # Generación 100% IA (por chunks + retry)
    # ─────────────────────────────────────────
    def generar_con_ia(self, institucion, total_preguntas, nivel_dificultad):
        preguntas_base = [
            p for p in self.data
            if p["universidad"].strip().lower() == institucion.strip().lower()
        ]

        if not preguntas_base:
            raise ValueError(
                f"No hay preguntas de '{institucion}' en el dataset "
                "para usar como referencia de estilo."
            )

        temas = list({p["tema"].strip().lower() for p in preguntas_base})

        # Ejemplos reales como referencia de estilo
        ejemplos = []
        for tema in temas[:4]:
            muestra = [
                p for p in preguntas_base
                if p["tema"].strip().lower() == tema
            ][:2]
            for p in muestra:
                opciones_str = " ; ".join(
                    p["opciones"] if isinstance(p["opciones"], list)
                    else p["opciones"].split(";")
                )
                ejemplos.append(
                    f'Tema: {tema}\n'
                    f'Pregunta: {p["pregunta"]}\n'
                    f'Opciones: {opciones_str}\n'
                    f'Respuesta: {p.get("respuesta", "A")}'
                )

        nivel_desc = {
            "facil":   "fáciles (conceptos básicos, definiciones directas)",
            "medio":   "de dificultad media (aplicación de fórmulas y conceptos)",
            "dificil": "difíciles (análisis, cálculo avanzado, razonamiento complejo)",
            "mixto":   "variadas (mezcla de fácil, media y difícil)",
        }.get(nivel_dificultad.lower(), "variadas")

        temas_str    = ", ".join(temas)
        ejemplos_str = "\n\n".join(ejemplos[:8])

        # ── Dividir en chunks de 30 preguntas ─────
        CHUNK     = 30
        chunks    = []
        restantes = total_preguntas
        while restantes > 0:
            chunks.append(min(CHUNK, restantes))
            restantes -= CHUNK

        cfg = PROVEEDORES[self.proveedor_ia]
        print(f"🤖 Generando con {self.proveedor_ia} ({cfg['modelo']})...")
        print(f"   ({len(chunks)} llamadas de ~{CHUNK} preguntas c/u)")

        todas_preguntas = []

        for i, cantidad_chunk in enumerate(chunks, 1):
            print(f"   Parte {i}/{len(chunks)} — {cantidad_chunk} preguntas...")

            prompt = f"""Eres un experto creador de exámenes de admisión para {institucion}.

Genera exactamente {cantidad_chunk} preguntas de opción múltiple {nivel_desc}.
Temas disponibles: {temas_str}

Ejemplos del estilo real del examen:
{ejemplos_str}

Devuelve ÚNICAMENTE un JSON válido (sin texto extra, sin backticks, sin comentarios):
{{
  "preguntas": [
    {{
      "pregunta": "Texto completo de la pregunta",
      "opciones": ["opcion A", "opcion B", "opcion C", "opcion D"],
      "respuesta": "A",
      "dificultad": 0.5,
      "universidad": "{institucion}",
      "tema": "nombre del tema"
    }}
  ]
}}

Reglas:
- Exactamente {cantidad_chunk} preguntas ORIGINALES
- NO repitas preguntas anteriores
- Dificultad: 0.0 (fácil) a 1.0 (difícil)
- Respuesta: solo la letra A, B, C o D
- Distribuye entre los temas: {temas_str}
- El JSON debe estar completo y bien cerrado
"""
            MAX_REINTENTOS = 3
            for intento in range(1, MAX_REINTENTOS + 1):
                try:
                    respuesta       = self._llamar_ia(prompt)
                    resultado       = self._parsear_preguntas_json(respuesta)
                    chunk_preguntas = resultado.get("preguntas", [])

                    # Normalizar opciones a lista
                    for p in chunk_preguntas:
                        if isinstance(p["opciones"], str):
                            p["opciones"] = [o.strip() for o in p["opciones"].split(";")]

                    todas_preguntas.extend(chunk_preguntas)
                    print(f"   ✅ Parte {i}: {len(chunk_preguntas)} preguntas obtenidas")
                    break  # éxito — salir del loop de reintentos

                except Exception as e:
                    mensaje = str(e)

                    # ── Rate limit 429: esperar y reintentar ──
                    if "429" in mensaje or "Rate limit" in mensaje:
                        espera = 65  # default seguro
                        try:
                            match = re.search(r"try again in (\d+\.?\d*)s", mensaje)
                            if match:
                                espera = int(float(match.group(1))) + 5  # +5s de margen
                        except Exception:
                            pass

                        print(f"   ⏳ Rate limit. Esperando {espera}s... "
                              f"(intento {intento}/{MAX_REINTENTOS})")
                        time.sleep(espera)

                    else:
                        # Error distinto — no reintentar
                        print(f"   ⚠️  Parte {i} falló: {e}")
                        break

            # Pausa base entre llamadas para no saturar la API
            if i < len(chunks):
                time.sleep(2)

        if not todas_preguntas:
            raise Exception(
                "No se pudo generar ninguna pregunta.\n"
                "Verifica tu API Key y conexión."
            )

        print(f"✅ {len(todas_preguntas)} preguntas generadas por {self.proveedor_ia}")
        return todas_preguntas

    # ─────────────────────────────────────────
    # Generador principal
    # ─────────────────────────────────────────
    def generar_examen(self, institucion, total_preguntas=120,
                       nivel_dificultad="mixto", modo="dataset"):
        RANGOS = {
            "facil":   (0.0,  0.4),
            "medio":   (0.35, 0.65),
            "dificil": (0.6,  1.0),
            "mixto":   None,
        }

        if modo == "ia":
            return self.generar_con_ia(institucion, total_preguntas, nivel_dificultad)

        # ── Modo dataset ──────────────────────────
        rango     = RANGOS.get(nivel_dificultad.lower())
        preguntas = self.filtrar_preguntas(institucion, rango_dificultad=rango)

        if not preguntas:
            raise ValueError(
                f"No hay preguntas para '{institucion}' con nivel '{nivel_dificultad}'.\n"
                "Prueba con nivel 'mixto' o agrega más preguntas al dataset."
            )

        temas  = self.clasificar_por_tema(preguntas)
        config = self.construir_config(
            list(temas.keys()), total_preguntas, temas_dict=temas
        )

        print(f"\n📚 Temas para {institucion} ({nivel_dificultad}):")
        for tema, lista in temas.items():
            print(f"   - {tema}: {len(lista)} preguntas disponibles")

        print(f"\n📝 Distribución ({total_preguntas} preguntas solicitadas):")
        for tema, cantidad in config.items():
            print(f"   - {tema}: {cantidad}")

        examen     = self.seleccionar_preguntas(temas, config)
        total_real = len(examen)

        if total_real < total_preguntas:
            faltantes = total_preguntas - total_real
            print(f"\n⚠️  Se generaron {total_real} preguntas (faltan {faltantes}).")
            print("   Agrega más preguntas al dataset o usa modo 'ia' para completar.")

        return examen

    # ─────────────────────────────────────────
    # Output
    # ─────────────────────────────────────────
    def imprimir_examen(self, examen):
        print(f"\n{'='*50}\nEXAMEN — {len(examen)} preguntas\n{'='*50}")
        for i, p in enumerate(examen, 1):
            print(f"\n{i}. {p['pregunta']}")
            for j, opcion in enumerate(p["opciones"]):
                print(f"   {chr(65+j)}) {opcion}")
            if p.get("imagen") and str(p.get("imagen", "")).strip():
                print(f"   🖼️  Imagen: {p['imagen']}")

    def guardar_examen(self, examen, nombre_archivo="examen.txt"):
        with open(nombre_archivo, "w", encoding="utf-8") as f:
            f.write(f"EXAMEN — {len(examen)} preguntas\n{'='*50}\n")
            for i, p in enumerate(examen, 1):
                f.write(f"\n{i}. {p['pregunta']}\n")
                for j, opcion in enumerate(p["opciones"]):
                    f.write(f"   {chr(65+j)}) {opcion}\n")
        print(f"✅ Guardado en '{nombre_archivo}'")