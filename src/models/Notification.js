const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userType'
  },
  userType: {
    type: String,
    required: true,
    enum: ['Client', 'Chauffeur']
  },
  type: {
    type: String,
    required: true,
    enum: ['reservation', 'paiement', 'course', 'rappel', 'confirmation']
  },
  message: {
    type: String,
    required: true
  },
  lue: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Index pour améliorer les performances des requêtes
notificationSchema.index({ user: 1, date: -1 });
notificationSchema.index({ lue: 1 });

module.exports = mongoose.model('Notification', notificationSchema); 