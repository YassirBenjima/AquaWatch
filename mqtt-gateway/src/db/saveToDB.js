import pkg from "pg";
import config from "../config/config.js";
import { logInfo, logError } from "../utils/logger.js";

const { Pool } = pkg;

const pool = new Pool({
  user: config.PG_USER,
  host: config.PG_HOST,
  database: config.PG_DB,
  password: config.PG_PASSWORD,
  port: config.PG_PORT,
});

// Test database connection
pool.on("connect", () => {
  logInfo("[DB] ✅ Connexion à TimescaleDB établie");
});

pool.on("error", (err) => {
  logError("[DB] ❌ Erreur de connexion à TimescaleDB:", err.message);
});

/**
 * Sauvegarde les données du capteur dans TimescaleDB (séries temporelles)
 * @param {object} data - Données normalisées du capteur
 */
export async function saveToDB(data) {
  const query = `
    INSERT INTO sensor_data
    (sensor_id, timestamp, pH, temperature, turbidity, conductivity, latitude, longitude)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;

  const values = [
    data.sensor_id,
    data.timestamp,
    data.pH,
    data.temperature,
    data.turbidity,
    data.conductivity,
    data.latitude,
    data.longitude,
  ];

  try {
    const result = await pool.query(query, values);
    if (result.rowCount > 0) {
      logInfo(
        `[DB] ✅ Données insérées pour ${data.sensor_id} à ${data.timestamp}`
      );
    }
  } catch (err) {
    logError(`[DB] ❌ Erreur d'insertion pour ${data.sensor_id}:`, err.message);
    // Ne pas lancer l'erreur pour ne pas interrompre le traitement d'autres messages
  }
}
