const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const routes = require('./routes');
const authRoutes = require('./routes/authRoutes');
const villeRoutes = require('./routes/villeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const webhookRoutes = require('./webhooks/stripeWebhook');
const { findAvailablePort, updateRestFiles } = require('./utils/portUtils');
const trajetRoutes = require('./routes/trajetRoutes');
const prixRoutes = require('./routes/prixRoutes');
const distanceRoutes = require('./routes/distanceRoutes');

const app = express();

// Middleware pour Stripe webhook
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), webhookRoutes);

// Middleware standard
app.use(express.json());
app.use(cors());

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/villes', villeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', routes);
app.use('/api/trajets', trajetRoutes);
app.use('/api/prix', prixRoutes);
app.use('/api/distance', distanceRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

// Connexion à MongoDB et démarrage du serveur
const startServer = async () => {
  try {
    const port = process.env.PORT || 3000;
    
    // Vérification de la variable d'environnement
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Atlas Connected:', mongoose.connection.host);

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    // Gestion de l'arrêt propre
    process.on('SIGTERM', () => {
      console.log('Server closed.');
      process.exit(0);
    });

  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; 