import dotenv from "dotenv";
dotenv.config();

// Mode de collecte des données: "mqtt" (capteurs réels) ou "csv" (dataset)
const DATA_SOURCE = process.env.DATA_SOURCE || "mqtt";

export default {
  // Mode de collecte des données
  DATA_SOURCE: DATA_SOURCE, // "mqtt" ou "csv"
  
  // Configuration MQTT (pour mode capteurs réels)
  MQTT_BROKER_URL: process.env.MQTT_BROKER_URL || "mqtt://localhost",
  MQTT_TOPIC: process.env.MQTT_TOPIC || "sensors/data",
  
  // Configuration CSV (pour mode dataset)
  CSV_PATH: process.env.CSV_PATH || "Water Quality Testing.csv",
  CSV_INTERVAL_MS: parseInt(process.env.CSV_INTERVAL_MS) || 5000, // Intervalle entre les envois (5 secondes par défaut)
  
  // Database configuration
  PG_USER: process.env.PG_USER,
  PG_PASSWORD: process.env.PG_PASSWORD,
  PG_HOST: process.env.PG_HOST,
  PG_PORT: process.env.PG_PORT,
  PG_DB: process.env.PG_DB,
};
