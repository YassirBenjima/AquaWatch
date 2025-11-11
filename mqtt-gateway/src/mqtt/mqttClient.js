import mqtt from "mqtt";
import { handleMessage } from "./messageHandler.js";
import { logInfo, logError } from "../utils/logger.js";
import config from "../config/config.js";

export function initMQTT() {
  const client = mqtt.connect(config.MQTT_BROKER_URL, {
    // Paramètres de reconnexion automatique
    reconnectPeriod: 5000, // Délai entre les tentatives de reconnexion (5 secondes)
    connectTimeout: 30 * 1000, // Timeout de connexion (30 secondes)
    keepalive: 60, // Intervalle de keepalive (60 secondes)
    clean: true, // Nettoyer la session à la reconnexion
    clientId: `mqtt-gateway-${Date.now()}`, // ID unique pour éviter les conflits

    // Paramètres de qualité de service
    qos: 1, // Quality of Service niveau 1

    // Gestion des erreurs et reconnexion
    will: {
      topic: "gateway/status",
      payload: "offline",
      qos: 1,
      retain: true,
    },
  });

  client.on("connect", () => {
    logInfo(`✅ Connecté au broker MQTT: ${config.MQTT_BROKER_URL}`);
    client.subscribe(config.MQTT_TOPIC);

    // Publier le statut en ligne
    client.publish("gateway/status", "online", { qos: 1, retain: true });
  });

  client.on("message", (topic, msg) => {
    handleMessage(topic, msg.toString());
  });

  client.on("reconnect", () => {
    logInfo("🔄 Tentative de reconnexion au broker MQTT...");
  });

  client.on("close", () => {
    logInfo("🔌 Connexion MQTT fermée");
  });

  client.on("offline", () => {
    logInfo("📴 Client MQTT hors ligne");
  });

  client.on("error", (err) => {
    logError("❌ Erreur MQTT:", err.message);
  });

  // Gestion propre de l'arrêt
  process.on("SIGINT", () => {
    logInfo("🛑 Arrêt du client MQTT...");
    client.publish("gateway/status", "offline", { qos: 1, retain: true });
    client.end();
    process.exit(0);
  });
}
