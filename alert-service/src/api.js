import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { pool } from './db/storage.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const hash = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO users (email, password_hash, last_login)
            VALUES ($1, $2, NOW())
            RETURNING email, notifications_enabled;
        `;
        const result = await pool.query(query, [email, hash]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'User already exists' });
        }
        console.error('Error registering:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password (if user has one)
        if (user.password_hash) {
            const match = await bcrypt.compare(password, user.password_hash);
            if (!match) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        } else {
            // Basic fallback for legacy users (optional: force reset)
            // For now, we allow them to login if strictly intended, OR block them.
            // Best practice: block and ask to register/reset. 
            // Implementing block for security.
            return res.status(401).json({ error: 'Please reset your password or register' });
        }

        // Update last login
        await pool.query('UPDATE users SET last_login = NOW() WHERE email = $1', [email]);

        // Return user info (excluding hash)
        const { password_hash, ...safeUser } = user;
        res.json(safeUser);

    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/user/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/user/:email', async (req, res) => {
    const { email } = req.params;
    const { notifications_enabled } = req.body;

    if (typeof notifications_enabled !== 'boolean') {
        return res.status(400).json({ error: 'notifications_enabled must be a boolean' });
    }

    try {
        const query = `
            UPDATE users 
            SET notifications_enabled = $1
            WHERE email = $2
            RETURNING *;
        `;
        const result = await pool.query(query, [notifications_enabled, email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get recent alerts
router.get('/alerts', async (req, res) => {
    try {
        const query = `
            SELECT * FROM alerts 
            ORDER BY timestamp DESC 
            LIMIT 5
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching alerts:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export function startServer() {
    const app = express();
    app.use(cors());
    app.use(express.json());

    app.use('/api', router);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 API Server running on port ${PORT}`);
    });
}
