import { initMQTT } from "./mqtt/mqttClient.js";
import { monitorSensors } from "./services/sensorMonitor.js";
import { logInfo } from "./utils/logger.js";

logInfo("🚀 Démarrage du microservice MQTT Gateway...");

initMQTT();
monitorSensors(); // ✅ Active la surveillance des capteurs
