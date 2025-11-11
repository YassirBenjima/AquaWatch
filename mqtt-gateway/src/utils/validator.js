import { logWarn } from "./logger.js";

/**
 * Parse un message qui peut être au format JSON ou au format key:value simple
 * @param {string} message - Le message brut reçu
 * @returns {object|null} - L'objet parsé ou null si le parsing échoue
 */
export function parseMessage(message) {
  if (!message || typeof message !== "string") {
    return null;
  }

  // Essayer d'abord le parsing JSON standard
  try {
    const parsed = JSON.parse(message);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed;
    }
  } catch (e) {
    // JSON parsing a échoué, continuer avec le parsing personnalisé
  }

  // Si le JSON échoue, essayer de parser le format key:value
  try {
    let cleaned = message.trim();

    // Enlever les guillemets simples ou doubles au début et à la fin
    cleaned = cleaned.replace(/^['"]+|['"]+$/g, "");

    // Enlever les accolades au début et à la fin
    cleaned = cleaned.replace(/^[{}]+|[{}]+$/g, "");

    // Diviser par les virgules (en faisant attention aux valeurs qui pourraient contenir des virgules)
    const pairs = cleaned.split(",");
    const result = {};

    for (const pair of pairs) {
      const colonIndex = pair.indexOf(":");
      if (colonIndex === -1) continue;

      const key = pair.substring(0, colonIndex).trim();
      const value = pair.substring(colonIndex + 1).trim();

      if (key) {
        // Essayer de convertir en nombre si la valeur ressemble à un nombre
        const trimmedValue = value.trim();
        // Vérifier si la valeur est un nombre (peut contenir des chiffres, un point, un signe moins)
        if (/^-?\d*\.?\d+$/.test(trimmedValue)) {
          const numValue = parseFloat(trimmedValue);
          result[key] = isNaN(numValue) ? trimmedValue : numValue;
        } else {
          result[key] = trimmedValue;
        }
      }
    }

    return Object.keys(result).length > 0 ? result : null;
  } catch (err) {
    return null;
  }
}

/**
 * Normalise les données du capteur avec validation des plages
 * @param {object} data - Données brutes du capteur
 * @returns {object} - Données normalisées
 */
export function normalizeData(data) {
  return {
    sensor_id: data.sensor_id || data.sensorId || "sensor_001",
    timestamp: data.timestamp || new Date().toISOString(),
    pH: checkRange(data.pH, 0, 14),
    temperature: checkRange(data.temperature, -10, 100),
    turbidity: checkRange(data.turbidity, 0, 1000, true), // Turbidité en NTU (0-1000 NTU)
    conductivity: checkRange(data.conductivity, 0, 100000, true), // Conductivité en µS/cm (0-100000)
    latitude: checkRange(data.latitude, -90, 90, false, 33.5731), // Latitude par défaut: Casablanca
    longitude: checkRange(data.longitude, -180, 180, false, -7.5898), // Longitude par défaut: Casablanca
  };
}

/**
 * Valide qu'une valeur est dans une plage donnée
 * @param {number} value - Valeur à valider
 * @param {number} min - Valeur minimale
 * @param {number} max - Valeur maximale
 * @param {boolean} allowNull - Autoriser null si la valeur n'est pas fournie
 * @param {number|null} defaultValue - Valeur par défaut si allowNull est false
 * @returns {number|null} - Valeur validée ou null/defaultValue
 */
export function checkRange(
  value,
  min,
  max,
  allowNull = true,
  defaultValue = null
) {
  if (value === undefined || value === null) {
    return allowNull ? null : defaultValue;
  }

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return allowNull ? null : defaultValue;
  }

  if (numValue < min || numValue > max) {
    logWarn(
      `Valeur hors plage détectée: ${numValue} (plage attendue: ${min}-${max})`
    );
    return null;
  }

  return numValue;
}
