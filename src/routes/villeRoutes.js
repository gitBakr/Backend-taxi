const express = require('express');
const router = express.Router();
const villeController = require('../controllers/villeController');
const Ville = require('../models/Ville');

// Routes publiques
router.get('/', villeController.getAllVilles);
router.get('/disponibles', villeController.getVillesDisponibles);
router.get('/trajets-disponibles', villeController.getTrajetsDisponibles);
router.get('/search', villeController.searchVilles);
router.get('/proche', villeController.getVilleProche);
router.get('/liste', async (req, res) => {
  try {
    const villes = await Ville.find({})
      .select('nom gouvernorat region coordinates')
      .sort('nom');
    
    res.json({
      status: 'success',
      count: villes.length,
      data: villes
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});
router.get('/autocomplete', villeController.autocomplete);

module.exports = router; 