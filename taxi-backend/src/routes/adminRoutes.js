const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

// Protection de toutes les routes admin
router.use(authenticateToken, isAdmin);

// Info admin
router.get('/me', adminController.getAdminInfo);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Gestion des chauffeurs
router.get('/chauffeurs', adminController.getChauffeurs);

// Gestion des réservations
router.get('/reservations', adminController.getReservations);
router.get('/reservations/:id', adminController.getDetailsCourse);

// Gestion des paiements
router.get('/paiements', adminController.getPaiements);

// Actions rapides
router.post('/actions/bloquer-chauffeur/:id', adminController.bloquerChauffeur);
router.post('/actions/debloquer-chauffeur/:id', adminController.debloquerChauffeur);
router.post('/actions/annuler-course/:id', adminController.annulerCourse);

module.exports = router; 