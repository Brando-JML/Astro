import torch
import torch.nn as nn 
from transformers import AutoModel

class ExamModel(nn.Module):
    def __init__(self, model_name="distilbert-base-uncased", num_universidades=10):
        super().__init__()
        
        self.bert = AutoModel.from_pretrained(model_name)
        hidden_size = self.bert.config.hidden_size
        
        # Cabezas
        self.dificultad = nn.Linear(hidden_size, 1)
        self.universidad = nn.Linear(hidden_size, num_universidades)
        self.probabilidad = nn.Linear(hidden_size, 1)
        
        self.sigmoid = nn.Sigmoid()

    def forward(self, input_ids, attention_mask):
        outputs = self.bert(
            input_ids=input_ids,
            attention_mask=attention_mask
        )
        
        cls_output = outputs.last_hidden_state[:, 0]
        
        dificultad = self.dificultad(cls_output)
        universidad = self.universidad(cls_output)
        probabilidad = self.sigmoid(self.probabilidad(cls_output))
        
        return dificultad, universidad, probabilidad

        loss = (
    mse(dificultad_pred, dificultad_real) +
    cross_entropy(universidad_pred, universidad_real) +
    bce(prob_pred, prob_real)
)