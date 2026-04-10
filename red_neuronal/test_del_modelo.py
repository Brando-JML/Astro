import torch
import joblib
from transformers import AutoTokenizer
from entrenamiento import ExamModel

# =========================
# CONFIG
# =========================
MODEL_PATH = "modelo.pth"
ENCODER_PATH = "label_encoder.pkl"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# =========================
# CARGA GLOBAL (SOLO UNA VEZ)
# =========================
print("Cargando modelo...")

# Cargar encoder
le = joblib.load(ENCODER_PATH)
num_universidades = len(le.classes_)

# Tokenizer
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")

# Modelo
model = ExamModel(num_universidades=num_universidades).to(device)
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.eval()

print("Modelo listo 🚀")

# =========================
# FUNCIÓN DE PREDICCIÓN
# =========================
def predecir(texto):
    encoding = tokenizer(
        texto,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128
    )

    input_ids = encoding["input_ids"].to(device)
    attention_mask = encoding["attention_mask"].to(device)

    with torch.no_grad():
        dificultad, universidad_logits = model(input_ids, attention_mask)

    # Convertir resultados
    dificultad = dificultad.item()

    probs = torch.softmax(universidad_logits, dim=1)
    universidad_idx = torch.argmax(probs).item()
    confianza = probs[0][universidad_idx].item()

    nombre_universidad = le.inverse_transform([universidad_idx])[0]

    print("\n=== RESULTADO ===")
    print("Texto:", texto)
    print(f"Dificultad: {dificultad:.3f}")
    print(f"Universidad: {nombre_universidad}")
    print(f"Confianza: {confianza:.2%}")

    return {
        "dificultad": dificultad,
        "universidad": nombre_universidad,
        "confianza": confianza
    }

# =========================
# TEST INTERACTIVO
# =========================
if __name__ == "__main__":
    while True:
        texto = input("\nEscribe una pregunta (o 'salir'): ")

        if texto.lower() == "salir":
            break

        predecir(texto)