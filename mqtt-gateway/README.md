# MQTT Gateway Service

Passerelle IoT chargée de collecter, valider et normaliser les données des capteurs d'eau avant de les stocker dans TimescaleDB.

## Fonctionnalités
- **Collecte Hybride** : Supporte les capteurs réels (MQTT) et la simulation via CSV.
- **Sécurité** : Authentification MQTT (User/Password).
- **Validation** : Vérification stricte des types et plages de valeurs (pH, Température, Turbidité).
- **Stockage** : Sauvegarde performante en séries temporelles (TimescaleDB).

## Installation

```bash
cd mqtt-gateway
npm install
```

## Configuration

Créer un fichier `.env` à la racine :

```ini
# Mode de données : "mqtt" ou "csv"
DATA_SOURCE=mqtt

# MQTT Broker (Prod / Dev)
MQTT_BROKER_URL=mqtt://localhost
MQTT_TOPIC=sensors/data
MQTT_USER=your_secure_user
MQTT_PASSWORD=your_secure_password

# Simulation (si DATA_SOURCE=csv)
CSV_PATH=Water Quality Testing.csv
CSV_INTERVAL_MS=5000

# Base de données (TimescaleDB)
PG_USER=postgres
PG_PASSWORD=password
PG_HOST=localhost
PG_PORT=5432
PG_DB=aquawatch
```

## Validation des Données

Le service rejette les données hors normes pour garantir la qualité :
- **pH** : 0 - 14
- **Température** : -50°C - 100°C
- **Turbidité/Conductivité** : >= 0
- **Champs requis** : `station_id`, `timestamp`, `sensors` object.

## Lancement

```bash
# Démarrer le service
npm start

# Mode Dev (avec nodemon si installé)
npm run dev
```

## Tests

Pour vérifier la validation des données :

```bash
node tests/test_validation_manual.js
```
