# Aqua Watch Qualité de l’eau en temps réel

## Problématique et besoins :

Dans de nombreuses régions, la qualité de l’eau (potable, fluviale, côtière) est affectée par des sources de pollution industrielle, agricole ou domestique. Or, la détection de cette pollution est souvent lente, manuelle et coûteuse. Les collectivités territoriales et agences environnementales manquent d’outils numériques intégrés pour surveiller et anticiper les pics de pollution. Une solution automatisée, basée sur des données hétérogènes (stations au sol, satellites, normes OMS), permettrait une alerte rapide et une prise de décision éclairée.

## Solution proposée :

Une plateforme modulaire basée sur microservices qui agrége, normalise, analyse et diffuse en temps réel des signaux multi-sources (IoT + télédétection).

## Fonctions-clés :

ingestion continue (MQTT), stockage séries temporelles (TimescaleDB), enrichissement satellite (Sentinel-2 via SentinelHub/GDAL), prévisions spatio-temporelles (ConvLSTM PyTorch), règles d’alerte (normes OMS), et visualisation cartographique (GeoServer/PostGIS + API GeoJSON).

## Résultat attendu :

détection proactive des anomalie, notifications automatisées (email/SMS) et interface SIG interactive pour autorités et citoyens

## Outils / Matériels / Technologies :

Ingestion IoT: MQTT, Node.js
DB: TimescaleDB (Postgres)
GDAL, rasterio, SentinelHub API, stockage MinIO
PyTorch (ConvLSTM), MLflow pour suivi
Alertes & logs: Node.js, PostgreSQL
SIG & API: GeoServer, PostGIS, REST / GeoJSON,
frontend React + Leaflet
Sécurité : OAuth2 / JWT
