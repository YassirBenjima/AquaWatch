import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

export async function saveAlert(alert) {
    const query = `
    INSERT INTO alerts (sensor_id, alert_type, value, threshold, message, severity, timestamp)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `;
    const values = [
        alert.sensor_id,
        alert.type,
        alert.value,
        alert.threshold,
        alert.message,
        alert.severity,
        new Date()
    ];

    try {
        const res = await pool.query(query, values);
        console.log(`[Storage] Alert saved with ID: ${res.rows[0].id}`);
        return res.rows[0].id;
    } catch (err) {
        console.error('[Storage] Error saving alert:', err.message);
    }
}
