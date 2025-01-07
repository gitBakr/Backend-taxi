const express = require('express');
const router = express.Router();

// Route de santé
router.get('/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'API is running',
        timestamp: new Date(),
        environment: process.env.NODE_ENV,
        database: {
            connected: mongoose.connection.readyState === 1
        }
    });
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