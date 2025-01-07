const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

// Routes protégées
router.post('/', 
  authenticateToken, 
  requireRole('client'), 
  reservationController.creerReservation
);

router.patch('/:id/confirmer', 
  authenticateToken, 
  requireRole('chauffeur'), 
  reservationController.confirmerReservation
);

router.patch('/:id/demarrer', 
  authenticateToken, 
  requireRole('chauffeur'), 
  reservationController.demarrerCourse
);

router.patch('/:id/terminer', 
  authenticateToken, 
  requireRole('chauffeur'), 
  reservationController.terminerCourse
);

router.get('/:id', 
  authenticateToken, 
  reservationController.getReservation
);

module.exports = router; 