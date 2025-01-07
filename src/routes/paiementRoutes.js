const express = require('express');
const router = express.Router();
const paiementController = require('../controllers/paiementController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Protection de toutes les routes
router.use(authenticateToken);

// Routes de paiement
router.post('/initier', paiementController.initierPaiement);
router.post('/confirmer/:reference', paiementController.confirmerPaiement);
router.post('/rembourser/:reference', paiementController.rembourserPaiement);
router.get('/:id', paiementController.getPaiement);

module.exports = router; 