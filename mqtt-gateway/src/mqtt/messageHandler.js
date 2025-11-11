import { updateSensorStatus } from "../services/sensorMonitor.js";
import { parseMessage, normalizeData } from "../utils/validator.js";
import { logInfo, logWarn, logError } from "../utils/logger.js";
import { saveToDB } from "../db/saveToDB.js";

/**
 * Traite un message MQTT reçu d'un capteur
 * @param {string} topic - Le topic MQTT
 * @param {string} msg - Le message brut
 */
export async function handleMessage(topic, msg) {
  try {
    // Parser le message (JSON ou format key:value)
    const data = parseMessage(msg.toString());

    if (!data) {
      logWarn(`[Message] ⚠️ Impossible de parser le message: ${msg}`);
      return;
    }

    // Vérifier la présence du sensor_id
    const sensorId = data.sensor_id || data.sensorId;
    if (!sensorId) {
      logWarn("[Message] ⚠️ Donnée reçue sans sensor_id");
      return;
    }

    // Mettre à jour le statut du capteur (détection d'activité)
    updateSensorStatus(sensorId);

    logInfo(`📥 Message reçu sur [${topic}] de ${sensorId}`);

    // Normaliser les données (validation des plages, horodatage, géolocalisation)
    const normalized = normalizeData(data);

    // Log des données normalisées
    const dataSummary = {
      timestamp: normalized.timestamp,
      pH: normalized.pH,
      temperature: normalized.temperature,
      turbidity: normalized.turbidity,
      conductivity: normalized.conductivity,
      location: `[${normalized.latitude}, ${normalized.longitude}]`,
    };
    logInfo(
      `✅ Données normalisées pour ${sensorId}:`,
      JSON.stringify(dataSummary, null, 2)
    );

    // Sauvegarde dans TimescaleDB (séries temporelles)
    await saveToDB(normalized);
  } catch (err) {
    logError(`[Message] ❌ Erreur lors du traitement: ${err.message}`);
    logError(`[Message] Message original: ${msg}`);
  }
}
