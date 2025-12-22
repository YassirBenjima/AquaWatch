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
