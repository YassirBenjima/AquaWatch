# Satellite Service

Satellite data processing service for AquaWatch.

## Structure

```
satellite-service/
├── src/
│   ├── sat_pipeline.py
│   └── utils/
│       ├── indices.py
│       ├── clipper.py
│       └── minio_client.py
├── data/
│   ├── samples/     (bandes .tif)
│   └── zones/       (zones GeoJSON)
├── outputs/
├── environment.yml
├── .env
└── README.md
```

## Setup

1. Create conda environment:
```bash
conda env create -f environment.yml
```

2. Activate environment:
```bash
conda activate satellite-service
```

3. Configure environment variables in `.env`

## Usage

TBD

