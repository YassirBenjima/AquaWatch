import { saveAlert } from './db/storage.js';
import { sendNotification } from './services/notifier.js';
import { THRESHOLDS } from './config/thresholds.js';
import { startServer } from './api.js';
import { getRecommendation } from './services/ai.js';
import dotenv from 'dotenv';
import mqtt from 'mqtt';

startServer();

// ... (existing code top) ...

// ... (middle code omitted for brevity in call) ...

// We only need to replace the processData function part or imports? 
// The tool works best with contiguous blocks. I'll target the imports first then the function body.
// Wait, I can't do multiple replace in one tool call unless multi_replace.
// I will target imports first in one tool call, then function body.
// Actually, `replace_file_content` is single contiguous. 
// I'll rewrite `processData` and the loop.

// First, imports are handled by replacing line 1-6 above.
// But wait, I need to see the file again to be sure of line numbers or context.
// I already saw index.js in step 23 and 58.

// Let's replace the whole file content or a large chunk to be safe? No, efficient use.
// I'll do two replace calls. One for imports, one for the loop.
// Tool list: 
// 1. Write ai.js (done in this turn)
// 2. Replace storage.js (done in this turn)
// 3. Replace index.js imports
// 4. Replace index.js processData loop
// 5. Append .env

// Wait, replace_file_content usage: "Do NOT make multiple parallel calls to this tool ... for the same file."
// I must use multi_replace for index.js if I want to change imports AND body.

// But first I need to check line numbers again to be safe? 
// StartLine 1 imports...
// Line 80ish loop...
// Step 58 showed imports.

// Let's add the key to .env first in its own file tool.

dotenv.config();

console.log('🚀 Starting Alert Service...');
console.log(`[Config] Email Enabled: ${process.env.ENABLE_EMAIL}`);
console.log(`[Config] SMTP Host: ${process.env.SMTP_HOST}`);
console.log(`[Config] Recipient: ${process.env.ALERT_EMAIL_RECIPIENT}`);

// MQTT connection
const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL || 'mqtt://mosquitto:1883', {
    clientId: 'alert-service-watcher',
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
});

mqttClient.on('connect', () => {
    console.log('✅ Connected to MQTT Broker');
    mqttClient.subscribe('sensors/data', (err) => {
        if (!err) {
            console.log('📡 Subscribed to sensors/data');
        }
    });
});

mqttClient.on('message', async (topic, message) => {
    const msgString = message.toString();
    console.log(`[Debug] Received: ${msgString}`);
    try {
        const data = JSON.parse(msgString);
        await processData(data);
    } catch (e) {
        console.error('❌ Error processing message:', e.message);
    }
});

async function processData(data) {
    const alerts = [];

    // Validations (pH, Turbidity, etc.)
    if (data.pH < THRESHOLDS.ph.min || data.pH > THRESHOLDS.ph.max) {
        alerts.push({
            type: 'pH',
            value: data.pH,
            threshold: `${THRESHOLDS.ph.min} - ${THRESHOLDS.ph.max}`,
            severity: 'WARNING',
            message: `pH abnormal: ${data.pH}`
        });
    }

    if (data.turbidity > THRESHOLDS.turbidity.max) {
        alerts.push({
            type: 'TURBIDITY',
            value: data.turbidity,
            threshold: THRESHOLDS.turbidity.max,
            severity: 'CRITICAL',
            message: `High Turbidity: ${data.turbidity} NTU`
        });
    }

    if (data.conductivity > THRESHOLDS.conductivity.max) {
        alerts.push({
            type: 'CONDUCTIVITY',
            value: data.conductivity,
            threshold: THRESHOLDS.conductivity.max,
            severity: 'WARNING',
            message: `High Conductivity: ${data.conductivity} µS/cm`
        });
    }

    // Process all generated alerts
    for (const alert of alerts) {
        let fullAlert = { ...alert, sensor_id: data.sensor_id || 'unknown' };

        // 🤖 Get AI Recommendation
        if (process.env.GEMINI_API_KEY) {
            console.log(`🧠 Asking Gemini for advice on ${fullAlert.type}...`);
            const advice = await getRecommendation(fullAlert.type, fullAlert.value, fullAlert.threshold);
            if (advice) {
                fullAlert.recommendation = advice;
                console.log(`💡 Advice: ${advice}`);
            }
        }

        // 1. Persist (with recommendation)
        const id = await saveAlert(fullAlert);
        fullAlert.id = id;

        // 2. Notify (email content is standard, no AI)
        await sendNotification(fullAlert);
    }
}
