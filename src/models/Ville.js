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
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: function(v) {
                    return Array.isArray(v) && v.length === 2;
                },
                message: 'Les coordonnées doivent être un tableau de 2 nombres [longitude, latitude]'
            }
        }
    }
});

// Ajouter l'index géospatial
villeSchema.index({ location: '2dsphere' });

// Middleware pour synchroniser coordinates et location
villeSchema.pre('save', function(next) {
    if (this.coordinates) {
        this.location = {
            type: 'Point',
            coordinates: [this.coordinates.longitude, this.coordinates.latitude]
        };
    }
    next();
});

module.exports = mongoose.model('Ville', villeSchema); 