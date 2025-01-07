const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const routes = require('./routes');
const authRoutes = require('./routes/authRoutes');
const villeRoutes = require('./routes/villeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const webhookRoutes = require('./webhooks/stripeWebhook');
const trajetRoutes = require('./routes/trajetRoutes');
const prixRoutes = require('./routes/prixRoutes');
const distanceRoutes = require('./routes/distanceRoutes');
const baseRoutes = require('./routes/baseRoutes');
const clientRoutes = require('./routes/clientRoutes');
const paiementRoutes = require('./routes/paiementRoutes');

const app = express();

// Middleware CORS
app.use(cors({
    origin: [
        'https://front-client-taxi.onrender.com',
        'http://localhost:3000'  // Pour le développement local
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Routes spéciales (avant express.json)
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), webhookRoutes);

// Middleware JSON pour les autres routes
app.use(express.json());

// Routes API (ordre important)
app.use('/api', baseRoutes);  // Doit être en premier
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/villes', villeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/trajets', trajetRoutes);
app.use('/api/prix', prixRoutes);
app.use('/api/distance', distanceRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api', routes);  // Routes génériques en dernier

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

// Démarrage du serveur
const startServer = async () => {
  try {
    const port = process.env.PORT || 3000;
    
    // Vérification de la variable d'environnement
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Une seule connexion MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Atlas Connected:', mongoose.connection.host);

    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });

    // Gestion de l'arrêt propre
    process.on('SIGTERM', async () => {
      await mongoose.connection.close();
      console.log('👋 Server closed.');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; 