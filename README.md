# 💧🌊 AquaWatch — Surveillance de la Qualité de l'Eau en Temps Réel

AquaWatch est une plateforme modulaire de surveillance de la qualité de l'eau qui agrège, normalise, analyse et diffuse en temps réel des signaux multi-sources (IoT + télédétection satellitaire). Elle combine des données de capteurs au sol, des images Sentinel-2, et des modèles ML pour détecter proactivement les anomalies et générer des alertes automatisées selon les normes OMS.

---

## Contents

- [💧🌊 AquaWatch — Surveillance de la Qualité de l'Eau en Temps Réel](#-aquawatch--surveillance-de-la-qualité-de-leau-en-temps-réel)
  - [Contents](#contents)
  - [Overview](#overview)
  - [Features](#features)
  - [Monorepo Layout](#monorepo-layout)
  - [Architecture](#architecture)
  - [APIs](#apis)
    - [Alert Service](#alert-service)
    - [MQTT Gateway](#mqtt-gateway)
    - [Satellite Service](#satellite-service)
    - [ST-Model](#st-model)
  - [Metrics (Model Quality)](#metrics-model-quality)
  - [Quick Start (Docker)](#quick-start-docker)
  - [Local Dev (Per Service)](#local-dev-per-service)
    - [MQTT Gateway](#mqtt-gateway-1)
    - [Alert Service](#alert-service-1)
    - [Satellite Service](#satellite-service-1)
    - [ST-Model](#st-model-1)
    - [Frontend](#frontend)
  - [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
  - [Testing \& QA](#testing--qa)
  - [Troubleshooting](#troubleshooting)
  - [Roadmap](#roadmap)
  - [Contributing](#contributing)

---

## Overview

- **Goal:** Détecter proactivement les anomalies de qualité de l'eau (potable, fluviale, côtière) en combinant données IoT, télédétection satellitaire et intelligence artificielle pour une alerte rapide et une prise de décision éclairée.
- **How:** Collecte continue via MQTT → stockage séries temporelles (TimescaleDB) → enrichissement satellite (Sentinel-2) → prédictions ML (ConvLSTM/Random Forest/Gradient Boosting) → règles d'alerte (normes OMS) → notifications automatisées → visualisation SIG interactive.
- **Why hybrid:** Les capteurs IoT offrent une **précision locale** en temps réel ; la télédétection satellitaire apporte une **couverture spatiale étendue** ; les modèles ML ajoutent des **prédictions spatio-temporelles** et une détection d'anomalies avancée.

---

## Features

- 🔔 **Alertes automatisées** basées sur les normes OMS avec notifications email/SMS
- 📡 **Ingestion IoT continue** via MQTT avec validation et normalisation des données
- 🛰️ **Télédétection satellitaire** Sentinel-2 pour indices NDWI, Chlorophylle, Turbidité
- 🤖 **Modèles ML multiples** : ConvLSTM (prédictions spatio-temporelles), Random Forest (turbidité), Gradient Boosting (potabilité)
- 🗺️ **Visualisation cartographique** interactive avec GeoServer, PostGIS et Leaflet
- 📊 **Dashboard temps réel** avec graphiques et métriques de qualité de l'eau
- 🔐 **Authentification sécurisée** avec JWT et gestion des utilisateurs
- 🧠 **Recommandations IA** générées via Google Generative AI pour les alertes
- 🐳 **Déploiement Docker** avec Docker Compose pour la stack complète
- 🔄 **CI/CD intégré** avec Jenkins pour l'automatisation

---

## Monorepo Layout

```
AquaWatch/
├─ mqtt-gateway/              # Passerelle IoT (Node.js)
├─ alert-service/             # Service d'alertes & API (Node.js)
├─ satellite-service/         # Traitement Sentinel-2 (Python)
├─ st-model/                  # Modèles ML & prédictions (Python/PyTorch)
├─ frontend/                  # Interface web React + Leaflet
├─ mosquitto/                 # Configuration broker MQTT
├─ sql/                       # Scripts d'initialisation DB
├─ jenkins/                   # Configuration CI/CD
├─ docker-compose.yml
└─ README.md
```

---

## Architecture

```
┌─────────────┐
│   Capteurs  │──MQTT──┐
│     IoT     │        │
└─────────────┘        │
                       ▼
              ┌─────────────────┐
              │  MQTT Gateway    │──► TimescaleDB
              │  (Validation)    │
              └─────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Alert Service   │──► Notifications
              │  (Règles OMS)    │    (Email/SMS)
              └─────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  ST-Model        │──► Prédictions ML
              │  (ConvLSTM/RF)   │
              └─────────────────┘
                       │
┌─────────────┐        │
│ Sentinel-2  │───►┐   │
└─────────────┘    │   │
                   ▼   ▼
              ┌─────────────────┐
              │ Satellite Service│──► MinIO
              │  (NDWI/Chl/Turb) │
              └─────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   GeoServer      │──► Frontend
              │   (PostGIS)      │    (React/Leaflet)
              └─────────────────┘
```

- **MQTT Gateway:** Collecte et valide les données des capteurs IoT, les stocke dans TimescaleDB.
- **Alert Service:** Surveille les seuils (normes OMS), génère des alertes et envoie des notifications.
- **Satellite Service:** Télécharge et traite les images Sentinel-2, calcule les indices de qualité de l'eau.
- **ST-Model:** Modèles ML pour prédictions spatio-temporelles et évaluation de la potabilité.
- **Frontend:** Interface web interactive avec cartes, graphiques et gestion des alertes.
- **GeoServer:** Serveur SIG pour diffusion de données géospatiales via WMS/WFS.

---

## APIs

### Alert Service
**POST** `/api/register`
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**POST** `/api/login`
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**GET** `/api/alerts`
```json
{
  "alerts": [
    {
      "id": 1,
      "timestamp": "2024-01-15T10:30:00Z",
      "sensor_id": "sensor_001",
      "alert_type": "pH",
      "value": 8.5,
      "threshold": 8.0,
      "severity": "HIGH",
      "message": "pH élevé détecté",
      "recommendation": "Vérifier la source de contamination..."
    }
  ]
}
```

**GET** `/api/sensors/status`
```json
{
  "sensors": [
    {
      "sensor_id": "sensor_001",
      "last_seen": "2024-01-15T10:25:00Z",
      "status": "online"
    }
  ]
}
```

### MQTT Gateway
**GET** `/health` → `{"status": "ok"}`

**POST** `/api/sensors/data` (pour simulation)
```json
{
  "sensor_id": "sensor_001",
  "timestamp": "2024-01-15T10:30:00Z",
  "latitude": 33.5731,
  "longitude": -7.5898,
  "sensors": {
    "ph": 7.2,
    "temperature": 18.5,
    "turbidity": 2.1,
    "conductivity": 450
  }
}
```

### Satellite Service
- Traitement automatique via scheduler
- Génère des fichiers GeoTIFF (NDWI, Chlorophylle, Turbidité)
- Upload vers MinIO pour stockage

### ST-Model
- Prédictions automatiques toutes les heures
- Modèles : Random Forest (turbidité), Gradient Boosting (potabilité), ConvLSTM (spatio-temporel)

---

## Metrics (Model Quality)

Évaluation des modèles ML sur les données de qualité de l'eau :

| Modèle | Métrique | Performance |
| --- | :---: | :---: |
| **Random Forest Regressor** (Turbidité) | R² Train | **0.79** |
| **Gradient Boosting Classifier** (Potabilité) | Accuracy | **79.08%** |
| **ConvLSTM** (Spatio-temporel) | En cours d'optimisation | - |

> Reproduire :
> ```bash
> cd st-model
> python eval_regressor.py
> python eval_accuracy.py
> ```

---

## Quick Start (Docker)

Créer un fichier `.env` à la racine (ou utiliser les valeurs par défaut) :

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=aquawatch

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin

# GeoServer
GEOSERVER_ADMIN_USER=admin
GEOSERVER_ADMIN_PASSWORD=geoserver

# MQTT Gateway
MQTT_BROKER_URL=mqtt://mosquitto:1883
DATA_SOURCE=csv  # ou "mqtt" pour capteurs réels

# Alert Service
# Configurer dans alert-service/.env pour notifications email/SMS
```

Le `docker-compose.yml` configure automatiquement tous les services :

```bash
docker compose up --build
```

Services disponibles :
- **Frontend:** http://localhost:5173
- **Alert Service API:** http://localhost:3005
- **MQTT Gateway:** http://localhost:3001
- **GeoServer:** http://localhost:8080
- **MinIO Console:** http://localhost:9001
- **Jenkins:** http://localhost:8085

---

## Local Dev (Per Service)

### MQTT Gateway
```bash
cd mqtt-gateway
npm install
# Créer .env avec configuration MQTT/DB
npm start
```

### Alert Service
```bash
cd alert-service
npm install
# Créer .env avec configuration DB et notifications
npm start
```

### Satellite Service
```bash
cd satellite-service
conda env create -f environment.yml
conda activate satproc
# Créer .env avec credentials Sentinel-Hub et MinIO
python src/sat_pipeline.py  # Traitement unique
python src/scheduler.py     # Mode automatique
```

### ST-Model
```bash
cd st-model
pip install -r requirements.txt
# Configurer variables d'environnement DB
python src/main.py  # Lance prédictions toutes les heures
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Configuration

- **MQTT Gateway:** Mode `DATA_SOURCE` (`mqtt` ou `csv`) pour simulation ou capteurs réels.
- **Alert Service:** Seuils configurables dans `alert-service/src/config/thresholds.js` selon normes OMS.
- **Satellite Service:** Zones de traitement définies dans `satellite-service/data/zones/*.geojson`.
- **ST-Model:** Modèles pré-entraînés dans `st-model/`, prédictions automatiques toutes les heures.
- **GeoServer:** Configuration via interface web (http://localhost:8080) pour couches WMS/WFS.
- **CORS:** Configuré dans les services Node.js pour permettre les requêtes frontend.

---

## Environment Variables

| Variable | Service | Default / Example | Purpose |
| --- | --- | --- | --- |
| `POSTGRES_USER` | TimescaleDB | `postgres` | DB user |
| `POSTGRES_PASSWORD` | TimescaleDB | `postgres` | DB password |
| `POSTGRES_DB` | TimescaleDB | `aquawatch` | Database name |
| `MQTT_BROKER_URL` | Gateway/Alert | `mqtt://mosquitto:1883` | MQTT broker |
| `DATA_SOURCE` | Gateway | `csv` | Source mode (mqtt/csv) |
| `PG_HOST` | All services | `aquawatch_db` | Database host |
| `PG_PORT` | All services | `5432` | Database port |
| `MINIO_ROOT_USER` | MinIO | `minioadmin` | MinIO admin user |
| `MINIO_ROOT_PASSWORD` | MinIO | `minioadmin` | MinIO admin password |
| `SENTINELHUB_CLIENT_ID` | Satellite | - | Sentinel-Hub API |
| `SENTINELHUB_CLIENT_SECRET` | Satellite | - | Sentinel-Hub API |
| `GEOSERVER_ADMIN_USER` | GeoServer | `admin` | GeoServer admin |
| `GEOSERVER_ADMIN_PASSWORD` | GeoServer | `geoserver` | GeoServer password |

---

## Testing & QA

- **Unit / Integration**
  - Gateway/Alert: `npm test` (si configuré)
  - Satellite/ST-Model: `pytest` (si configuré)
  - Frontend: `npm test`
- **Validation:** Tests manuels via `mqtt-gateway/tests/test_validation_manual.js`
- **Health Checks:** 
  - Gateway: `GET /health`
  - Alert Service: `GET /api/alerts`
  - GeoServer: `GET /geoserver/rest/about/version`
- **Static Analysis:** SonarQube configuré (voir `sonar-project.properties`)

---

## Troubleshooting

- **`PG_HOST` non résolu** → Vérifier que TimescaleDB est démarré et accessible via le réseau Docker.
- **MQTT connexion échouée** → Vérifier que Mosquitto est démarré et que `MQTT_BROKER_URL` est correct.
- **Données satellite manquantes** → Vérifier les credentials Sentinel-Hub dans `.env` et la disponibilité des images.
- **Modèles ML non chargés** → Vérifier que les fichiers `.pkl` existent dans `st-model/` ou réentraîner :
  ```bash
  cd st-model
  python src/main.py  # Réentraînement si nécessaire
  ```
- **CORS errors** → Configurer CORS dans `alert-service/src/api.js` pour inclure l'origine frontend.
- **GeoServer ne démarre pas** → Vérifier les permissions du volume `geoserver_data` et les logs.

---

## Roadmap

- [ ] Intégration de capteurs IoT supplémentaires (dissolved oxygen, nitrates)
- [ ] Amélioration des modèles ML avec plus de données historiques
- [ ] Support multi-langues pour l'interface utilisateur
- [ ] Application mobile (Android/iOS) pour notifications push
- [ ] Intégration avec systèmes d'alerte gouvernementaux
- [ ] Dashboard analytics avancé avec prédictions à long terme
- [ ] API GraphQL pour requêtes flexibles
- [ ] Support de données Sentinel-3 pour océans

---

## Contributing

Nous accueillons les contributions ! Veuillez :

1. Fork le repo, créer une branche feature.
2. Ajouter des tests où pertinent.
3. Exécuter les linters/formatters (`eslint`, `black`, `flake8`).
4. Ouvrir une PR avec une description claire et des captures d'écran si changements UI.

**Bonnes pratiques :**
- Suivre les conventions de code du projet
- Documenter les nouvelles APIs
- Ajouter des tests pour les nouvelles fonctionnalités
- Mettre à jour le README si nécessaire

---