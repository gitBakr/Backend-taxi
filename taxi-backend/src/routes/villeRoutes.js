const express = require('express');
const router = express.Router();
const villeController = require('../controllers/villeController');

// Routes publiques
router.get('/', villeController.getAllVilles);
router.get('/disponibles', villeController.getVillesDisponibles);
router.get('/trajets-disponibles', villeController.getTrajetsDisponibles);

module.exports = router; 