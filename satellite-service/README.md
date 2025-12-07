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
conda activate satproc
```

3. Configure environment variables in `.env`

## Configuration

3. Configure environment variables in `.env`:
   - MinIO credentials
   - PostgreSQL credentials
   - Sentinel-Hub credentials (pour `download_bands.py`)

## Téléchargement des bandes Sentinel-2

Via Sentinel-Hub API:

1. Obtenez vos credentials sur [Sentinel-Hub](https://www.sentinel-hub.com/)
2. Ajoutez dans `.env`:
   ```
   SENTINELHUB_CLIENT_ID=your_client_id
   SENTINELHUB_CLIENT_SECRET=your_client_secret
   ```
3. Exécutez:

   ```bash
   python src/download_bands.py [path/to/zone.geojson]
   ```

   **Note:** Si aucun fichier GeoJSON n'est fourni, la zone par défaut est le Maroc.

Les bandes seront téléchargées dans `data/samples/`:

- `B03.tif` (Green)
- `B08.tif` (NIR)
- `B05.tif` (Red Edge 1)
- `B06.tif` (Red Edge 2)
- `B04.tif` (Red)
- `B8A.tif` (Red Edge 4)

## Usage

Exécuter le pipeline de traitement:

```bash
python src/sat_pipeline.py
```

Le pipeline va:

1. Découper les bandes selon la zone définie dans `data/zones/zone1.geojson`
2. Masquer les nuages via la bande SCL (Scene Classification Layer)
3. Calculer les indices (NDWI, Chlorophylle, Turbidité)
4. Sauvegarder les résultats et les **métadonnées** dans `outputs/`
5. Uploader vers MinIO

## Automatisation (Scheduler)

Pour lancer le traitement de manière périodique (ex: toutes les heures) :

```bash
python src/scheduler.py
```

Le scheduler vérifie l'intervalle défini (`CHECK_INTERVAL_MINUTES`) et lance le pipeline automatiquement.

## Métadonnées

Chaque exécution génère un fichier `metadata.json` contenant :
- Date de traitement
- Zone couverte
- Statut du masquage nuageux (activé/désactivé)
- Pourcentage de pixels masqués
