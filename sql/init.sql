CREATE TABLE IF NOT EXISTS sensor_data (
    sensor_id VARCHAR(50),
    timestamp TIMESTAMPTZ NOT NULL,
    pH FLOAT,
    temperature FLOAT,
    turbidity FLOAT,
    conductivity FLOAT,
    latitude FLOAT,
    longitude FLOAT
);

SELECT create_hypertable('sensor_data', 'timestamp', if_not_exists => TRUE);

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    sensor_id VARCHAR(50),
    alert_type VARCHAR(50), -- e.g. "pH", "TURBIDITY"
    value FLOAT,
    threshold FLOAT,
    message TEXT,
    severity VARCHAR(20) -- "WARNING", "CRITICAL"
);
