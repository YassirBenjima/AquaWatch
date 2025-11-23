import { initMQTT } from "./mqtt/mqttClient.js";
import { monitorSensors } from "./services/sensorMonitor.js";
import { startCSVSimulation } from "./services/csvDataSimulator.js";
import { logInfo } from "./utils/logger.js";
import config from "./config/config.js";

logInfo("🚀 Démarrage du microservice MQTT Gateway...");
logInfo(`📡 Mode de collecte: ${config.DATA_SOURCE.toUpperCase()}`);

// Initialiser le mode approprié selon la configuration
if (config.DATA_SOURCE === "csv") {
  // Mode Dataset CSV : simuler les données depuis le fichier CSV
  logInfo("📊 Utilisation du dataset CSV pour la collecte des données");
  startCSVSimulation(config.CSV_PATH, config.CSV_INTERVAL_MS);
  monitorSensors(); // ✅ Active la surveillance des capteurs (même en mode CSV)
} else {
  // Mode MQTT : collecte depuis les capteurs réels via MQTT
  logInfo("🔌 Utilisation des capteurs réels via MQTT");
  initMQTT();
  monitorSensors(); // ✅ Active la surveillance des capteurs
}
