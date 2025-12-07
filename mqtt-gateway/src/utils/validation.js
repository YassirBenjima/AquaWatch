import { logError } from "./logger.js";

/**
 * Validates sensor data payload
 * @param {Object} payload - The data payload to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function validateSensorData(payload) {
  try {
    // Check if payload is an object
    if (!payload || typeof payload !== "object") {
      logError("⚠️ Validation: Payload is not an object");
      return false;
    }

    // Check required fields
    if (!payload.sensor_id && !payload.station_id) {
      logError("⚠️ Validation: Missing station_id or sensor_id");
      return false;
    }

    if (!payload.timestamp) {
      logError("⚠️ Validation: Missing timestamp");
      return false;
    }

    if (!payload.sensors || typeof payload.sensors !== "object") {
      logError("⚠️ Validation: Missing or invalid sensors data");
      return false;
    }

    // Validate sensor values (basic range checks)
    const { ph, temperature, turbidity, conductivity } = payload.sensors;

    if (
      ph !== undefined &&
      ph !== null &&
      (typeof ph !== "number" || ph < 0 || ph > 14)
    ) {
      logError(`⚠️ Validation: Invalid pH value (${ph})`);
      return false;
    }

    if (
      temperature !== undefined &&
      temperature !== null &&
      (typeof temperature !== "number" || temperature < -50 || temperature > 100)
    ) {
      logError(`⚠️ Validation: Invalid temperature value (${temperature})`);
      return false;
    }

    if (
      turbidity !== undefined &&
      turbidity !== null &&
      (typeof turbidity !== "number" || turbidity < 0)
    ) {
      logError(`⚠️ Validation: Invalid turbidity value (${turbidity})`);
      return false;
    }
    
    if (
      conductivity !== undefined &&
      conductivity !== null &&
      (typeof conductivity !== "number" || conductivity < 0)
    ) {
        logError(`⚠️ Validation: Invalid conductivity value (${conductivity})`);
        return false;
    }

    return true;
  } catch (error) {
    logError(`❌ Validation Error: ${error.message}`);
    return false;
  }
}
