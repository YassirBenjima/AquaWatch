import express from 'express';
import cors from 'cors';
import pg from 'pg';
import config from '../config/config.js';
import { logInfo, logError } from '../utils/logger.js';

const { Pool } = pg;

const pool = new Pool({
    user: config.PG_USER,
    host: config.PG_HOST,
    database: config.PG_DB,
    password: config.PG_PASSWORD,
    port: config.PG_PORT,
});

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Endpoint to get historical data
app.get('/api/history', async (req, res) => {
    try {
        // Get last 50 records ordered by time
        const result = await pool.query('SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 50');

        // Reverse to show oldest to newest in charts
        const data = result.rows.reverse();

        res.json(data);
    } catch (err) {
        logError('Error fetching history:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Endpoint to get latest forecast
app.get('/api/forecast', async (req, res) => {
    try {
        // Get latest forecast for EACH model
        const query = `
            SELECT DISTINCT ON (model_name) * 
            FROM forecasts 
            ORDER BY model_name, timestamp DESC
        `;
        const result = await pool.query(query);

        // Transform into dictionary: { convlstm: val, random_forest: val }
        const response = {};
        result.rows.forEach(row => {
            response[row.model_name] = row.predicted_turbidity;
        });

        res.json(response);
    } catch (err) {
        logError('Error fetching forecast:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

export const startServer = () => {
    app.listen(PORT, () => {
        logInfo(`🚀 API Server listening on port ${PORT}`);
    });
};
