export const THRESHOLDS = {
    ph: {
        min: 6.5,
        max: 8.5,
        unit: "pH"
    },
    turbidity: {
        max: 5,
        unit: "NTU"
    },
    conductivity: {
        // Exemple basé sur des normes d’eau potable (OMS/UE souvent < 2500, indicatif < 1500)
        max: 1500, 
        unit: "µS/cm"
    },
    temperature: {
        // Seuil indicateur de pollution thermique
        max: 30,
        unit: "°C"
    }
};
