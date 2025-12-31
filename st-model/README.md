# STModel Microservice

## Description
This microservice is responsible for **Spatio-Temporal Prediction** of water quality parameters. It uses a **ConvLSTM** model implemented in PyTorch to forecast future states (e.g., +24h) based on historical data.

## Features
- **Model**: PyTorch ConvLSTM (Convolutional LSTM) for learning spatial and temporal dependencies.
- **Input**: Multi-source data (Sentinel-2 satellite imagery + IoT Sensor data) from TimescaleDB.
- **Output**: Predicted grids of water quality indices (e.g., Turbidity, Chlorophyll-a).
- **Automation**: scheduled to run predictions periodically (default: every hour).

## MODÈLES IMPLÉMENTÉS

### 1. Random Forest Regressor (Prévision de la Turbidité)
- **Description** : Utilisé pour prédire l'évolution de la turbidité à court terme en se basant sur les données historiques et spatiales d'AquaWatch.
- **Performance** : Le modèle actuel montre une bonne capacité d'apprentissage (R² Train : **0.79**) mais nécessite une optimisation pour la généralisation (R² Test : < 0). Des travaux sont en cours pour enrichir le jeu de données historique.
- **Pourquoi ce choix ?** : Ce modèle permet de capturer les tendances non-linéaires complexes. Bien que sensible au volume de données restreint actuel, il reste l'approche la plus prometteuse pour la prédiction spatio-temporelle à court terme.

### 2. Gradient Boosting Classifier (Évaluation de la Potabilité)
- **Description** : Modèle de classification binaire optimisé pour évaluer la potabilité de l'eau en fonction de ses caractéristiques physico-chimiques.
- **Performance** : Atteint une précision de **79.08%** sur le jeu de test, confirmant sa fiabilité pour la détection des risques sanitaires.
- **Pourquoi ce choix ?** : Le Gradient Boosting (GBC) a été identifié comme le modèle le plus performant lors de la recherche hyperparamétrique. Sa méthode d'apprentissage séquentielle permet de capturer des interactions complexes entre les caractéristiques de l'eau.

## Structure
```
st-model/
├── src/
│   ├── model.py        # PyTorch ConvLSTM architecture
│   ├── data_loader.py  # Fetches training/inference data from DB
│   ├── predict.py      # Inference logic and alert generation
│   └── main.py         # Service entry point & scheduler
├── Dockerfile          # Container definition
├── requirements.txt    # Python dependencies
└── README.md           # This file
```

## Setup & Run

### Prerequisites
- Docker & Docker Compose
- AquaWatch infrastructure (TimescaleDB) running.

### Run with Docker Compose
The service is part of the main `docker-compose.yml`.

```bash
# Build and start
docker-compose up -d --build st-model
```

### Logs
To check if the model is producing predictions:

```bash
docker logs -f aquawatch_stmodel
```

## Configuration
Environment variables (set in `docker-compose.yml`):
- `PG_HOST`: Database host (default: `aquawatch_db`)
- `PG_PORT`: Database port (default: `5432`)
- `PG_DB`: Database name (default: `aquawatch`)
