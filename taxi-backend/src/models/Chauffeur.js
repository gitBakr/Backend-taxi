const mongoose = require('mongoose');

const vehiculeSchema = new mongoose.Schema({
  marque: {
    type: String,
    required: true
  },
  modele: {
    type: String,
    required: true
  },
  annee: {
    type: Number,
    required: true
  },
  photo: String
});

const tarifSchema = new mongoose.Schema({
  villeDepart: {
    type: String,
    required: true
  },
  villeArrivee: {
    type: String,
    required: true
  },
  prix: {
    type: Number,
    required: true,
    min: 0
  }
});

const chauffeurSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  telephone: {
    type: String,
    required: true,
    unique: true
  },
  vehicule: {
    type: vehiculeSchema,
    required: true
  },
  photoChauffeur: String,
  disponible: {
    type: Boolean,
    default: true
  },
  tarifs: [tarifSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour mettre à jour updatedAt
chauffeurSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Chauffeur', chauffeurSchema); 