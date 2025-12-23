-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS sensor_data (
    sensor_id VARCHAR(50),
    timestamp TIMESTAMPTZ NOT NULL,
    pH FLOAT,
    temperature FLOAT,
    turbidity FLOAT,
    conductivity FLOAT,
    latitude FLOAT,
    longitude FLOAT,
    geom GEOMETRY(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)) STORED
);

SELECT create_hypertable('sensor_data', 'timestamp', if_not_exists => TRUE);

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    sensor_id VARCHAR(50),
    alert_type VARCHAR(50),
    value FLOAT,
    threshold FLOAT,
    message TEXT,
    severity VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS zones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    geom GEOMETRY(Polygon, 4326),
    description TEXT
);
