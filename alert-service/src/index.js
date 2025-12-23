import mqtt from 'mqtt';
import dotenv from 'dotenv';
import { saveAlert } from './db/storage.js';
import { sendNotification } from './services/notifier.js';
import { THRESHOLDS } from './config/thresholds.js';

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
        const fullAlert = { ...alert, sensor_id: data.sensor_id || 'unknown' };

        // 1. Notify
        await sendNotification(fullAlert);

        // 2. Persist
        await saveAlert(fullAlert);
    }
}
