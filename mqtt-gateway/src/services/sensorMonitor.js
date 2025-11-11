import { logInfo, logWarn } from "../utils/logger.js";

const sensorStatus = new Map(); // sensor_id -> timestamp dernière activité
const OFFLINE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export function updateSensorStatus(sensorId) {
  sensorStatus.set(sensorId, Date.now());
  logInfo(`[Sensor] ✅ ${sensorId} actif`);
}

export function monitorSensors() {
  setInterval(() => {
    const now = Date.now();

    for (const [sensorId, lastSeen] of sensorStatus.entries()) {
      const inactiveFor = now - lastSeen;

      if (inactiveFor > OFFLINE_TIMEOUT_MS) {
        logWarn(`[Sensor] ⚠️ ${sensorId} inactif depuis ${Math.floor(inactiveFor / 1000)}s`);
        // Tu peux ajouter ici une fonction sendAlert(sensorId)
      }
    }
  }, 60 * 1000); // Vérification toutes les minutes
}

