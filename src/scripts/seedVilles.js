const mongoose = require('mongoose');
const Ville = require('../models/Ville');
require('dotenv').config();

const villes = [
    {
        nom: "Tunis",
        gouvernorat: "Tunis",
        region: "Nord",
        codePostal: "1000",
        coordinates: {
            latitude: 36.8065,
            longitude: 10.1815
        }
    },
    {
        nom: "Sousse",
        gouvernorat: "Sousse",
        region: "Sahel",
        codePostal: "4000",
        coordinates: {
            latitude: 35.8245,
            longitude: 10.6346
        }
    },
    // Ajoutez d'autres villes ici
];

async function seedVilles() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connecté à MongoDB');

        // Supprimer les anciennes données
        await Ville.deleteMany({});
        console.log('🗑️ Anciennes villes supprimées');

        // Insérer les nouvelles villes
        await Ville.insertMany(villes);
        console.log('🌆 Nouvelles villes ajoutées');

        console.log('✨ Seed terminé avec succès');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

// Exécuter le script
seedVilles(); 