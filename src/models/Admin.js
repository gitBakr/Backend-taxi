const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
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
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'admin',
        enum: ['admin', 'super_admin']
    },
    dateCreation: {
        type: Date,
        default: Date.now
    },
    dernierConnexion: Date,
    active: {
        type: Boolean,
        default: true
    }
});

// Hash le mot de passe avant de sauvegarder
adminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

module.exports = mongoose.model('Admin', adminSchema); 