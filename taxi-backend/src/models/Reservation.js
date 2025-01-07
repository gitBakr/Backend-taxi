const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  chauffeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chauffeur',
    required: true
  },
  trajet: {
    villeDepart: {
      type: String,
      required: true
    },
    villeArrivee: {
      type: String,
      required: true
    },
    dateDepart: {
      type: Date,
      required: true,
      validate: {
        validator: function(date) {
          return date > new Date(Date.now() + 30 * 60 * 1000);
        },
        message: "La réservation doit être faite au moins 30 minutes à l'avance"
      }
    },
    dureeEstimee: Number, // en minutes
    distanceEstimee: Number // en kilomètres
  },
  statut: {
    type: String,
    enum: ['en_attente', 'confirmee', 'en_cours', 'terminee', 'annulee'],
    default: 'en_attente'
  },
  paiement: {
    montantBase: {
      type: Number,
      required: true,
      min: 0
    },
    commission: {
      type: Number,
      min: 0,
      default: function() {
        return Math.round(this.montantBase * 0.1);
      }
    },
    montantTotal: {
      type: Number,
      min: 0,
      default: function() {
        const commission = this.commission || Math.round(this.montantBase * 0.1);
        return this.montantBase + commission;
      }
    },
    statut: {
      type: String,
      enum: ['en_attente', 'paye', 'rembourse'],
      default: 'en_attente'
    }
  },
  notifications: [{
    type: {
      type: String,
      enum: ['confirmation', 'rappel', 'annulation', 'modification']
    },
    message: String,
    date: {
      type: Date,
      default: Date.now
    },
    lue: {
      type: Boolean,
      default: false
    }
  }],
  historique: [{
    statut: String,
    date: {
      type: Date,
      default: Date.now
    },
    commentaire: String
  }],
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
reservationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (!this.dateReservation) {
    this.dateReservation = new Date(Date.now() + 60 * 60 * 1000); // +1 heure
  }
  next();
});

// Méthode pour calculer le prix total
reservationSchema.methods.calculerPrixTotal = function() {
  return this.paiement.montantBase + this.paiement.commission;
};

// Méthode pour vérifier si la réservation peut être annulée
reservationSchema.methods.peutEtreAnnulee = function() {
  const maintenant = new Date();
  const dateReservation = new Date(this.dateReservation);
  const differenceEnMinutes = (dateReservation - maintenant) / (1000 * 60);
  
  return differenceEnMinutes > 30 && this.statut !== 'terminee';
};

module.exports = mongoose.model('Reservation', reservationSchema); 