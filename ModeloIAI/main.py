import os
import torch
import joblib

from servicios.generador import GeneradorExamen, PROVEEDORES
from servicios.exportar_pdf import exportar_pdf
from red_neuronal.entrenamiento import ExamModel


def pedir_opcion(pregunta, opciones):
    print(f"\n{pregunta}")
    for i, op in enumerate(opciones, 1):
        print(f"  {i}. {op}")
    while True:
        try:
            sel = int(input("  → Elige un número: "))
            if 1 <= sel <= len(opciones):
                return opciones[sel - 1]
        except ValueError:
            pass
        print("  ⚠️  Opción inválida, intenta de nuevo.")


def main():
    print("\n" + "="*50)
    print("  CRYSTAL — Sistema Inteligente de Exámenes")
    print("="*50)

    # ── Institución ────────────────────────────────
    instituciones = ["UNAM", "IPN", "CENEVAL"]
    institucion   = pedir_opcion("¿Para qué institución?", instituciones)

    # ── Total de preguntas ─────────────────────────
    while True:
        try:
            total = int(input("\n¿Cuántas preguntas? (ej. 120): "))
            if total > 0:
                break
        except ValueError:
            pass
        print("  ⚠️  Ingresa un número válido.")

    # ── Nivel de dificultad ────────────────────────
    niveles = ["mixto", "facil", "medio", "dificil"]
    nivel   = pedir_opcion("¿Nivel de dificultad?", niveles)

    # ── Modo de generación ─────────────────────────
    modos = [
        "dataset  — Usa el modelo entrenado + preguntas reales del dataset",
        "ia       — Genera preguntas 100% nuevas con IA",
    ]
    modo_sel = pedir_opcion("¿Cómo generar el examen?", modos)
    modo     = "dataset" if modo_sel.startswith("dataset") else "ia"

    # ── Si es modo IA: elegir proveedor ───────────
    proveedor     = "Ollama (Local - GRATIS)"
    api_key       = ""
    modelo_ollama = "llama3"

    if modo == "ia":
        proveedores_lista = list(PROVEEDORES.keys())
        proveedor         = pedir_opcion("¿Qué proveedor de IA usar?", proveedores_lista)
        cfg               = PROVEEDORES[proveedor]

        if cfg["formato"] == "ollama":
            modelo_ollama = input(
                "\nModelo Ollama (Enter para usar 'llama3'): "
            ).strip() or "llama3"
            print("  ℹ️  Asegúrate de que Ollama esté corriendo: ollama serve")

        else:
            # Intentar leer del entorno primero
            env_key = os.environ.get(cfg.get("key_env", ""), "")
            if env_key:
                api_key = env_key
                print(f"\n  ✅ API Key cargada desde variable de entorno ({cfg['key_env']})")
            else:
                api_key = input(f"\nAPI Key para {proveedor}: ").strip()
                if not api_key:
                    print(f"  ⚠️  Sin API Key no se puede usar {proveedor}.")
                    print(f"  ℹ️  Obtén una en: {cfg.get('key_url', '')}")
                    return

    # ── Respuestas en PDF ──────────────────────────
    inc_resp = input("\n¿Incluir hoja de respuestas en el PDF? (s/n): ").strip().lower() == "s"

    # ── Cargar modelo entrenado (solo modo dataset) ─
    modelo_bert = None
    le          = None

    if modo == "dataset":
        try:
            le          = joblib.load("label_encoder.pkl")
            modelo_bert = ExamModel(num_universidades=len(le.classes_))
            modelo_bert.load_state_dict(
                torch.load("modelo.pth", map_location="cpu")
            )
            modelo_bert.eval()
            print("\n✅ Modelo CRYSTAL cargado correctamente.")
        except FileNotFoundError:
            print("\n⚠️  No se encontró modelo entrenado (modelo.pth / label_encoder.pkl).")
            print("   Ejecuta primero: python red_neuronal/entrenamiento.py")
            print("   Continuando sin modelo — se usará la dificultad del CSV...\n")

    # ── Crear generador ────────────────────────────
    generador = GeneradorExamen(
        ruta_dataset="dataset/dataset.csv",
        modelo=modelo_bert,
        label_encoder=le,
        proveedor_ia=proveedor,
        api_key=api_key,
        modelo_ollama=modelo_ollama,
    )

    # ── Resumen antes de generar ───────────────────
    print(f"\n⚙️  Generando examen...")
    print(f"   Institución : {institucion}")
    print(f"   Preguntas   : {total}")
    print(f"   Dificultad  : {nivel}")
    print(f"   Modo        : {modo}")
    if modo == "ia":
        print(f"   Proveedor   : {proveedor}")

    # ── Generar ────────────────────────────────────
    examen = generador.generar_examen(
        institucion=institucion,
        total_preguntas=total,
        nivel_dificultad=nivel,
        modo=modo,
    )

    print(f"\n✅ Examen generado: {len(examen)} preguntas")

    # ── Exportar TXT + PDF ─────────────────────────
    nombre_base = f"examen_{institucion.lower()}_{nivel}"

    generador.guardar_examen(examen, f"{nombre_base}.txt")

    pdf_path = exportar_pdf(
        examen=examen,
        institucion=institucion,
        nombre_archivo=f"{nombre_base}.pdf",
        incluir_respuestas=inc_resp,
        nivel_dificultad=nivel.capitalize(),
    )

    print(f"\n📄 PDF listo: {pdf_path}")

    # ── Mostrar en consola ─────────────────────────
    ver = input("\n¿Mostrar el examen en consola? (s/n): ").strip().lower()
    if ver == "s":
        generador.imprimir_examen(examen)


if __name__ == "__main__":
    main()