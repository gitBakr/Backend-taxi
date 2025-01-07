const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Route de santé
router.get('/health', async (req, res) => {
    try {
        // Vérifier la connexion MongoDB
        const isConnected = mongoose.connection.readyState === 1;

        res.json({
            status: 'success',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            service: {
                name: 'taxi-backend',
                version: process.env.npm_package_version || '1.0.0'
            },
            database: {
                connected: isConnected,
                host: isConnected ? mongoose.connection.host : null
            }
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Service health check failed',
            error: error.message
        });
    }
});

// Route version
router.get('/version', (req, res) => {
    res.json({
        status: 'success',
        version: process.env.npm_package_version || '1.0.0',
        lastUpdate: '2024-03-19',
        features: {
            payments: true,
            sms: true,
            geolocation: true
        }
    });
});

module.exports = router; 