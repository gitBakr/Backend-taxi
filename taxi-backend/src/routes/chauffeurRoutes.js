const express = require('express');
const router = express.Router();
const chauffeurController = require('../controllers/chauffeurController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Routes publiques
router.post('/', chauffeurController.createChauffeur);

// Routes protégées
router.use(authenticateToken);  // Protection de toutes les routes suivantes

// Gestion des trajets
router.post('/trajets', chauffeurController.ajouterTrajets);
router.get('/trajets', chauffeurController.getMesTrajets);
router.patch('/trajets/:tarifId', chauffeurController.modifierTarif);
router.delete('/trajets/:tarifId', chauffeurController.supprimerTarif);

module.exports = router; 