const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

// Routes protégées
router.get('/profile', authenticateToken, requireRole('client'), clientController.getProfile);
router.patch('/profile', authenticateToken, clientController.updateProfile);

// Routes publiques
router.post('/', clientController.createClient);
router.get('/', clientController.getAllClients);
router.get('/:id', clientController.getClient);
router.patch('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

module.exports = router; 