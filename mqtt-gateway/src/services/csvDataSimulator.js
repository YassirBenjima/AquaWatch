import fs from "fs";
import { parse } from "csv-parse/sync";
import { handleMessage } from "../mqtt/messageHandler.js";
import { logInfo, logError } from "../utils/logger.js";
import config from "../config/config.js";

let csvData = [];
let currentIndex = 0;
let intervalId = null;

/**
 * Charge les données du fichier CSV
 * @param {string} csvPath - Chemin vers le fichier CSV
 * @returns {Array} - Tableau des données parsées
 */
function loadCSVData(csvPath) {
  try {
    const fileContent = fs.readFileSync(csvPath, "utf-8");
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    logInfo(`📊 ${records.length} enregistrements chargés depuis le CSV`);
    return records;
  } catch (err) {
    logError(`❌ Erreur lors du chargement du CSV: ${err.message}`);
    return [];
  }
}

/**
 * Convertit une ligne CSV en message MQTT simulé
 * @param {object} row - Ligne du CSV
 * @param {number} index - Index de la ligne
 * @returns {string} - Message JSON formaté
 */
function convertRowToMessage(row, index) {
  const sensorId = `sensor_${String((index % 5) + 1).padStart(3, "0")}`; // Simule 5 capteurs différents

  const message = {
    sensor_id: sensorId,
    timestamp: new Date().toISOString(),
    pH: parseFloat(row.pH) || null,
    temperature: parseFloat(row["Temperature (°C)"]) || null,
    turbidity: parseFloat(row["Turbidity (NTU)"]) || null,
    conductivity: parseFloat(row["Conductivity (µS/cm)"]) || null,
    // Dissolved Oxygen n'est pas dans le schéma actuel, mais on peut l'ajouter si nécessaire
    dissolved_oxygen: parseFloat(row["Dissolved Oxygen (mg/L)"]) || null,
  };

  return JSON.stringify(message);
}

/**
 * Démarre la simulation de données depuis le CSV
 * @param {string} csvPath - Chemin vers le fichier CSV
 * @param {number} intervalMs - Intervalle entre les envois en millisecondes (défaut: 5000ms = 5s)
 */
export function startCSVSimulation(
  csvPath = "Water Quality Testing.csv",
  intervalMs = 5000
) {
  csvData = loadCSVData(csvPath);

  if (csvData.length === 0) {
    logError("❌ Aucune donnée à simuler. Vérifiez le fichier CSV.");
    return;
  }

  logInfo(`🔄 Démarrage de la simulation CSV (intervalle: ${intervalMs}ms)`);
  logInfo(`📡 Mode: Dataset CSV (${csvData.length} enregistrements)`);

  // Envoyer la première donnée immédiatement
  sendNextData();

  // Puis envoyer les données suivantes à intervalle régulier
  intervalId = setInterval(() => {
    sendNextData();
  }, intervalMs);
}

/**
 * Envoie la prochaine donnée du CSV
 */
function sendNextData() {
  if (csvData.length === 0) return;

  const row = csvData[currentIndex];
  const message = convertRowToMessage(row, currentIndex);

  // Simuler la réception d'un message MQTT
  handleMessage(config.MQTT_TOPIC, message);

  // Passer à la ligne suivante (boucle si on arrive à la fin)
  currentIndex = (currentIndex + 1) % csvData.length;

  if (currentIndex === 0) {
    logInfo("🔄 Retour au début du dataset CSV");
  }
}

/**
 * Arrête la simulation CSV
 */
export function stopCSVSimulation() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    logInfo("🛑 Simulation CSV arrêtée");
  }
}

/**
 * Réinitialise l'index de lecture du CSV
 */
export function resetCSVIndex() {
  currentIndex = 0;
  logInfo("🔄 Index CSV réinitialisé");
}
