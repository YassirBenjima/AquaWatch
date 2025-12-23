import axios from 'axios';

const GEOSERVER_URL = 'http://geoserver:8080/geoserver/rest';
const AUTH = {
    username: 'admin',
    password: 'geoserver'
};

const WORKSPACE = 'aquawatch';

const DATASTORE = {
    dataStore: {
        name: 'aquawatch_db',
        connectionParameters: {
            entry: [
                { "@key": "host", "$": "aquawatch_db" },
                { "@key": "port", "$": "5432" },
                { "@key": "database", "$": "aquawatch" },
                { "@key": "user", "$": "postgres" },
                { "@key": "passwd", "$": "postgres" },
                { "@key": "dbtype", "$": "postgis" },
                { "@key": "schema", "$": "public" }
            ]
        }
    }
};

async function setup() {
    try {
        console.log(`Setting up GeoServer at ${GEOSERVER_URL}...`);

        // 1. Create Workspace
        console.log('1. Creating Workspace...');
        try {
            await axios.post(`${GEOSERVER_URL}/workspaces`,
                { workspace: { name: WORKSPACE } },
                { auth: AUTH, headers: { 'Content-Type': 'application/json' } }
            );
            console.log('   Workspace created.');
        } catch (e) {
            if (e.response && e.response.status === 409) console.log('   Workspace already exists.');
            else throw e;
        }

        // 2. Create DataStore
        console.log('2. Creating DataStore...');
        try {
            await axios.post(`${GEOSERVER_URL}/workspaces/${WORKSPACE}/datastores`,
                DATASTORE,
                { auth: AUTH, headers: { 'Content-Type': 'application/json' } }
            );
            console.log('   DataStore created.');
        } catch (e) {
            if (e.response && e.response.status === 409) console.log('   DataStore already exists.');
            else throw e;
        }

        // 3. Publish Layers
        const layers = ['sensor_data', 'zones'];
        for (const layer of layers) {
            console.log(`3. Publishing layer: ${layer}...`);
            try {
                await axios.post(`${GEOSERVER_URL}/workspaces/${WORKSPACE}/datastores/aquawatch_db/featuretypes`,
                    { featureType: { name: layer } },
                    { auth: AUTH, headers: { 'Content-Type': 'application/json' } }
                );
                console.log(`   Layer ${layer} published.`);
            } catch (e) {
                if (e.response && e.response.status === 409) console.log(`   Layer ${layer} already published.`);
                else {
                    console.error(`   Failed to publish ${layer}:`, e.message);
                    // Don't throw, try next layer
                }
            }
        }

        console.log('\n✅ GeoServer configuration complete!');

    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        if (error.response) {
            console.error('Data:', JSON.stringify(error.response.data));
        }
    }
}

setup();
