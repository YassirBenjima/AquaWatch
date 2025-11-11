import dotenv from "dotenv";
dotenv.config();

export default {
  MQTT_BROKER_URL: process.env.MQTT_BROKER_URL || "mqtt://localhost",
  MQTT_TOPIC: process.env.MQTT_TOPIC || "sensors/data",
  // Database configuration
  PG_USER: process.env.PG_USER,
  PG_PASSWORD: process.env.PG_PASSWORD,
  PG_HOST: process.env.PG_HOST,
  PG_PORT: process.env.PG_PORT,
  PG_DB: process.env.PG_DB,
};
