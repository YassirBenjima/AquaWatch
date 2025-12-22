# STModel Microservice

## Description
This microservice is responsible for **Spatio-Temporal Prediction** of water quality parameters. It uses a **ConvLSTM** model implemented in PyTorch to forecast future states (e.g., +24h) based on historical data.

## Features
- **Model**: PyTorch ConvLSTM (Convolutional LSTM) for learning spatial and temporal dependencies.
- **Input**: Multi-source data (Sentinel-2 satellite imagery + IoT Sensor data) from TimescaleDB.
- **Output**: Predicted grids of water quality indices (e.g., Turbidity, Chlorophyll-a).
- **Automation**: scheduled to run predictions periodically (default: every hour).

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
