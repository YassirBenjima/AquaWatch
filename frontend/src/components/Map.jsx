import React, { useEffect } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Default Icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Pulse Icon for Sensors
const pulseIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #ff0055; width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 10px #ff0055; animation: pulse 1.5s infinite;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
});

const SENSORS = [
    { id: 'sensor_001', lat: 33.5731, lng: -7.5898, name: 'Station Alpha' },
    { id: 'sensor_002', lat: 33.5740, lng: -7.5910, name: 'Station Beta' },
    { id: 'sensor_003', lat: 33.5720, lng: -7.5920, name: 'Station Gamma' },
];

const Map = () => {
    return (
        <MapContainer
            center={[33.5731, -7.5898]}
            zoom={15}
            scrollWheelZoom={true}
            className="w-full h-full"
            style={{ background: '#020617' }} // Matches dark theme
        >
            {/* Dark Matter Base Map */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* GeoServer Zones Layer (WMS) */}
            <WMSTileLayer
                url="http://localhost:8080/geoserver/aquawatch/wms"
                layers="aquawatch:zones"
                format="image/png"
                transparent={true}
                opacity={0.6}
            />

            {/* Sensor Markers */}
            {SENSORS.map((sensor) => (
                <Marker key={sensor.id} position={[sensor.lat, sensor.lng]} icon={pulseIcon}>
                    <Popup className="glass-popup">
                        <div className="p-2">
                            <h3 className="font-bold text-gray-800">{sensor.name}</h3>
                            <p className="text-sm text-gray-600">ID: {sensor.id}</p>
                            <div className="mt-2 text-xs">
                                <p>pH: 7.2 <span className="text-green-500">(Good)</span></p>
                                <p>Turbidity: 4.5 NTU</p>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default Map;
