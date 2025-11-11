export function normalizeData(data) {
  return {
    sensor_id: data.sensor_id || "sensor_001",
    timestamp: new Date().toISOString(),
    pH: checkRange(data.pH, 0, 14),
    temperature: checkRange(data.temperature, -10, 100),
    turbidity: data.turbidity ?? null,
    conductivity: data.conductivity ?? null,
    latitude: data.latitude ?? 33.5731,
    longitude: data.longitude ?? -7.5898,
  };
}

export function checkRange(value, min, max) {
  if (value === undefined || value === null) return null;
  if (typeof value !== "number" || value < min || value > max) {
    console.warn(`[WARN] Valeur hors plage détectée: ${value}`);
    return null;
  }
  return value;
}
