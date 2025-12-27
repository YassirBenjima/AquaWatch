import nodemailer from 'nodemailer';
import { pool } from '../db/storage.js';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Simule l'envoi de notifications (Email, SMS, Webhook)
 * @param {object} alert - L'objet alerte
 */
export async function sendNotification(alert) {
    console.log("==========================================");
    console.log(`🚨 [NOTIFICATION] ALERTE CRITIQUE DETECTEE`);
    console.log(`📍 Capteur: ${alert.sensor_id}`);
    console.log(`⚠️ Type: ${alert.type}`);
    console.log(`📉 Valeur: ${alert.value} (Seuil: ${alert.threshold})`);
    console.log("==========================================");

    if (process.env.ENABLE_EMAIL !== 'true') return;

    try {
        // Fetch recipients from DB
        const res = await pool.query('SELECT email FROM users WHERE notifications_enabled = true');
        const recipients = res.rows.map(row => row.email);

        if (recipients.length === 0) {
            console.log("[Email] No users subscribed to notifications.");
            return;
        }

        const info = await transporter.sendMail({
            from: '"AquaWatch Alert" <' + process.env.SMTP_USER + '>', // sender address
            to: recipients.join(', '), // list of receivers
            subject: `⚠️ ALERTE AQUAWATCH: ${alert.type} - ${alert.severity}`, // Subject line
            text: `Alerte détectée sur le capteur ${alert.sensor_id}.\n\nType: ${alert.type}\nValeur: ${alert.value}\nSeuil: ${alert.threshold}\nMessage: ${alert.message}`, // plain text body
            html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #eee;">
                
                <!-- Header -->
                <div style="background-color: #D32F2F; color: #ffffff; padding: 30px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800;">AquaWatch Alert System</h1>
                </div>

                <div style="padding: 40px; color: #333333;">
                    
                    <!-- Alert Title -->
                    <div style="margin-bottom: 20px;">
                        <h2 style="color: #D32F2F; margin: 0; font-size: 22px; display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 24px;">⚠️</span> Critical Water Quality Issue
                        </h2>
                    </div>

                    <p style="color: #555555; font-size: 15px; line-height: 1.5; margin-bottom: 30px;">
                        Our monitoring system has detected a parameter exceeding safety standards. Immediate attention is recommended.
                    </p>

                    <!-- Data Card -->
                    <div style="background-color: #FFEBEE; border-radius: 4px; border-left: 6px solid #D32F2F; padding: 25px; margin-bottom: 30px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #666; width: 40%; font-weight: bold;">Sensor ID:</td>
                                <td style="padding: 8px 0; color: #333; font-weight: bold;">${alert.sensor_id}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666; font-weight: bold;">Alert Type:</td>
                                <td style="padding: 8px 0; color: #333; font-weight: bold; text-transform: uppercase;">${alert.type}_HIGH</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666; font-weight: bold;">Detected Value:</td>
                                <td style="padding: 8px 0; color: #D32F2F; font-size: 18px; font-weight: bold;">${alert.value}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666; font-weight: bold;">Message:</td>
                                <td style="padding: 8px 0; color: #444;">${alert.message}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666; font-weight: bold;">Time:</td>
                                <td style="padding: 8px 0; color: #444;">${new Date().toLocaleString()}</td>
                            </tr>
                        </table>
                    </div>

                    <p style="color: #666; font-size: 14px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                        Please inspect the specified station immediately.
                    </p>
                </div>

                <!-- Footer -->
                <div style="background-color: #EEEEEE; color: #777; padding: 20px; text-align: center; font-size: 12px;">
                    <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} AquaWatch Monitoring Systems. All rights reserved.</p>
                    <p style="margin: 5px 0;">You received this email because you are subscribed to critical alerts.</p>
                </div>
            </div>
        </body>
        </html>
        `,
        });
        console.log("[Email] Message sent: %s", info.messageId);
    } catch (error) {
        console.error("[Email] Error sending email:", error);
    }
}
