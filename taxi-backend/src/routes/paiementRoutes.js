const express = require('express');
const router = express.Router();
const paiementController = require('../controllers/paiementController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Routes protégées
router.post('/initier', 
  authenticateToken, 
  paiementController.initierPaiement
);

router.post('/confirmer/:reference', 
  authenticateToken, 
  paiementController.confirmerPaiement
);

router.post('/rembourser/:reference', 
  authenticateToken, 
  paiementController.rembourserPaiement
);

router.get('/:id', 
  authenticateToken, 
  paiementController.getPaiement
);

module.exports = router; 