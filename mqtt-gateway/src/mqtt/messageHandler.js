import { normalizeData } from "../utils/validator.js";
import { logInfo, logWarn } from "../utils/logger.js";
import { saveToDB } from "../db/saveToDB.js";

export async function handleMessage(topic, msg) {
  try {
    const data = JSON.parse(msg);
    logInfo(`📥 Message reçu sur [${topic}]: ${msg}`);
    const normalized = normalizeData(data);
    logInfo(`✅ Données normalisées:`, normalized);

    // Sauvegarde dans TimescaleDB
    await saveToDB(normalized);
  } catch (err) {
    logWarn(`⚠️ Message non JSON reçu: ${msg}`);
  }
}
