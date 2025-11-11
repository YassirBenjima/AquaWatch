import { initMQTT } from "./mqtt/mqttClient.js";
import { logInfo } from "./utils/logger.js";

logInfo("🚀 Démarrage du microservice MQTT Gateway...");
initMQTT();
