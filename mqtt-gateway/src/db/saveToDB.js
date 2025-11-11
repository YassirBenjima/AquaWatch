import pkg from "pg";
import config from "../config/config.js";

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
  console.log("[DB] ✅ Connexion à la base de données établie");
});

pool.on("error", (err) => {
  console.error(
    "[DB] ❌ Erreur de connexion à la base de données:",
    err.message
  );
});

export async function saveToDB(data) {
  const query = `
    INSERT INTO sensor_data
    (sensor_id, timestamp, pH, temperature, turbidity, conductivity, latitude, longitude)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
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
    await pool.query(query, values);
    console.log("[DB] ✅ Données insérées avec succès");
  } catch (err) {
    console.error("[DB] ❌ Erreur d’insertion:", err.message);
  }
}
