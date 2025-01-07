const mongoose = require('mongoose');

const tarifSchema = new mongoose.Schema({
    chauffeur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chauffeur',
        required: true
    },
    villeDepart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ville',
        required: true
    },
    villeArrivee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ville',
        required: true
    },
    prixBase: {
        type: Number,
        required: true,
        min: 0
    },
    active: {
        type: Boolean,
        default: true
    }
});

// Index unique pour éviter les doublons
tarifSchema.index(
    { chauffeur: 1, villeDepart: 1, villeArrivee: 1 }, 
    { unique: true }
);

// Ajouter cette ligne pour exporter le modèle
module.exports = mongoose.model('Tarif', tarifSchema); 