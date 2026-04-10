import pandas as pd
import joblib
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import AutoTokenizer, AutoModel, get_linear_schedule_with_warmup
import torch.nn as nn
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

# =========================
# Dataset personalizado
# =========================
class ExamDataset(Dataset):
    def __init__(self, df, tokenizer):
        self.df = df.reset_index(drop=True)
        self.tokenizer = tokenizer

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        texto = self.df.iloc[idx]["texto"]

        encoding = self.tokenizer(
            texto,
            truncation=True,
            padding='max_length',
            max_length=128,
            return_tensors="pt"
        )

        return {
            "input_ids": encoding["input_ids"].squeeze(),
            "attention_mask": encoding["attention_mask"].squeeze(),
            "dificultad": torch.tensor(self.df.iloc[idx]["dificultad"], dtype=torch.float),
            "universidad": torch.tensor(self.df.iloc[idx]["universidad_label"], dtype=torch.long),
        }

# =========================
# Modelo
# =========================
class ExamModel(nn.Module):
    def __init__(self, num_universidades):
        super().__init__()

        self.bert = AutoModel.from_pretrained("dccuchile/bert-base-spanish-wwm-uncased")
        hidden = self.bert.config.hidden_size

        self.shared = nn.Sequential(
            nn.Linear(hidden, 256),
            nn.ReLU(),
            nn.Dropout(0.3)
        )

        self.dificultad = nn.Linear(256, 1)
        self.universidad = nn.Linear(256, num_universidades)

    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        cls = outputs.last_hidden_state[:, 0]

        x = self.shared(cls)

        # 🔥 FIX IMPORTANTE
        dificultad = self.dificultad(x).view(-1)
        universidad = self.universidad(x)

        return dificultad, universidad

# =========================
# FUNCIÓN DE ENTRENAMIENTO
# =========================
def entrenar():
    # =========================
    # Cargar dataset
    # =========================
    df = pd.read_csv("dataset/dataset.csv")

    # Preprocesamiento
    df["texto"] = df["pregunta"] + " " + df["opciones"]

    # Normalizar dificultad
    df["dificultad"] = df["dificultad"].clip(0, 1)

    # Encode universidad
    le = LabelEncoder()
    df["universidad_label"] = le.fit_transform(df["universidad"])
    
    print(df["universidad"].value_counts())

    # Split train/val
    train_df, val_df = train_test_split(df, test_size=0.2, random_state=42)

    # =========================
    # Tokenizer
    # =========================
    tokenizer = AutoTokenizer.from_pretrained("dccuchile/bert-base-spanish-wwm-uncased")

    train_dataset = ExamDataset(train_df, tokenizer)
    val_dataset = ExamDataset(val_df, tokenizer)

    train_loader = DataLoader(train_dataset, batch_size=8, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=8)

    # =========================
    # Setup
    # =========================
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model = ExamModel(num_universidades=len(le.classes_)).to(device)

    # 🔥 Freeze BERT (inicio)
    for param in model.bert.parameters():
        param.requires_grad = False

    optimizer = torch.optim.AdamW(model.parameters(), lr=2e-5)

    EPOCHS = 5
    total_steps = len(train_loader) * EPOCHS

    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=0,
        num_training_steps=total_steps
    )

    loss_mse = nn.MSELoss()
    loss_ce = nn.CrossEntropyLoss()

    # =========================
    # ENTRENAMIENTO
    # =========================
    for epoch in range(EPOCHS):
        model.train()
        total_loss = 0

        for batch in train_loader:
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            dificultad_real = batch["dificultad"].to(device)
            universidad_real = batch["universidad"].to(device)

            optimizer.zero_grad()

            dificultad_pred, universidad_pred = model(input_ids, attention_mask)

            loss = (
                0.3 * loss_mse(dificultad_pred, dificultad_real) +
                0.7 * loss_ce(universidad_pred, universidad_real)
            )

            loss.backward()
            optimizer.step()
            scheduler.step()

            total_loss += loss.item()

        # Promedio train loss
        total_loss /= len(train_loader)
        print(f"\nEpoch {epoch+1} Train Loss: {total_loss:.4f}")

        # =========================
        # VALIDACIÓN
        # =========================
        model.eval()
        val_loss = 0

        correct = 0
        total = 0

        with torch.no_grad():
            for batch in val_loader:
                input_ids = batch["input_ids"].to(device)
                attention_mask = batch["attention_mask"].to(device)
                dificultad_real = batch["dificultad"].to(device)
                universidad_real = batch["universidad"].to(device)

                dificultad_pred, universidad_pred = model(input_ids, attention_mask)

                loss = (
                    0.3 * loss_mse(dificultad_pred, dificultad_real) +
                    0.7 * loss_ce(universidad_pred, universidad_real)
                )

                val_loss += loss.item()

                # 🔥 Accuracy
                preds = torch.argmax(universidad_pred, dim=1)
                correct += (preds == universidad_real).sum().item()
                total += universidad_real.size(0)

        # Promedio validation loss
        val_loss /= len(val_loader)
        accuracy = correct / total if total > 0 else 0

        print(f"Epoch {epoch+1} Validation Loss: {val_loss:.4f}")
        print(f"Epoch {epoch+1} Accuracy: {accuracy:.2%}")

        model.train()

        # 🔥 Descongelar BERT en epoch 3
        if epoch == 2:
            print("🔓 Descongelando BERT...")
            for param in model.bert.parameters():
                param.requires_grad = True

            optimizer = torch.optim.AdamW(model.parameters(), lr=1e-5)

    # =========================
    # GUARDAR
    # =========================
    torch.save(model.state_dict(), "modelo.pth")
    joblib.dump(le, "label_encoder.pkl")

    print("\nModelo entrenado y guardado 🚀")

# =========================
# ENTRY POINT
# =========================
if __name__ == "__main__":
    entrenar()