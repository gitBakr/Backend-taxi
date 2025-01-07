const express = require('express');
const router = express.Router();
const trajetController = require('../controllers/trajetController');

// Routes
router.get('/disponible', trajetController.checkDisponibilite);

module.exports = router; 