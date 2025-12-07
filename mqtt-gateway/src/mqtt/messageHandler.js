import { updateSensorStatus } from "../services/sensorMonitor.js";
import { parseMessage, normalizeData } from "../utils/validator.js";
import { validateSensorData } from "../utils/validation.js";
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

    // Normaliser d'abord pour avoir une structure cohérente (gestion des alias, KV plat -> imbriqué, ID par défaut)
    const normalized = normalizeData(data);

    // Validation des données Normalisées
    if (!validateSensorData(normalized)) {
      logWarn(`[Message] ⚠️ Données invalides (après normalisation) pour ${normalized.sensor_id}`);
      return;
    }

    const sensorId = normalized.sensor_id;
    updateSensorStatus(sensorId);

    logInfo(`📥 Message reçu sur [${topic}] de ${sensorId}`);

    // Log des données normalisées
    const dataSummary = {
      timestamp: normalized.timestamp,
      pH: normalized.sensors.ph,
      temperature: normalized.sensors.temperature,
      turbidity: normalized.sensors.turbidity,
      conductivity: normalized.sensors.conductivity,
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
