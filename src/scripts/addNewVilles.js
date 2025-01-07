const mongoose = require('mongoose');
const Ville = require('../models/Ville');
require('dotenv').config();

const nouvellesVilles = [
    {
        nom: "Nouvelle Ville 1",
        gouvernorat: "Gouvernorat",
        region: "Sud-Est",
        codePostal: "4150",
        coordinates: {
            latitude: 33.5000,
            longitude: 10.5000
        }
    }
    // Ajouter d'autres villes ici
];

async function ajouterVilles() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connecté à MongoDB');

        // Ajouter les nouvelles villes
        const villes = await Ville.insertMany(nouvellesVilles);
        console.log('\n📍 Nouvelles villes ajoutées :');
        villes.forEach(ville => {
            console.log(`- ${ville.nom} (${ville.gouvernorat}) : ${ville._id}`);
        });

        await mongoose.connection.close();
        console.log('\n👋 Déconnecté de MongoDB');

    } catch (error) {
        console.error('\n❌ Erreur:', error);
        if (mongoose.connection) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

ajouterVilles(); 