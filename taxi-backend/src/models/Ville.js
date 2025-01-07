const mongoose = require('mongoose');

const villeSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        unique: true
    },
    gouvernorat: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: true,
        enum: ['Nord', 'Nord-Est', 'Nord-Ouest', 'Centre', 'Sahel', 'Sud', 'Sud-Est', 'Sud-Ouest']
    },
    codePostal: {
        type: String,
        required: true
    },
    coordinates: {
        latitude: Number,
        longitude: Number
    },
    active: {
        type: Boolean,
        default: true
    }
});

// S'assurer que le modèle n'est pas déjà enregistré
module.exports = mongoose.models.Ville || mongoose.model('Ville', villeSchema); 