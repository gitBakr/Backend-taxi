const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema({
  reservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    required: true
  },
  montant: {
    type: Number,
    required: true,
    min: 0
  },
  statut: {
    type: String,
    enum: ['en_attente', 'traitement', 'complete', 'echoue', 'rembourse'],
    default: 'en_attente'
  },
  methode: {
    type: String,
    enum: ['carte', 'especes'],
    required: true
  },
  stripe: {
    paymentIntentId: String,
    clientSecret: String,
    status: String
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  dateMiseAJour: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Paiement', paiementSchema); 