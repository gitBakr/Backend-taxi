const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Routes publiques
router.post('/', clientController.createClient);
router.get('/', clientController.getAllClients);
router.get('/:id', clientController.getClient);

// Routes protégées
router.use(authenticateToken);  // Protection des routes suivantes
router.patch('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);
router.get('/profile', clientController.getProfile);
router.patch('/profile', clientController.updateProfile);

module.exports = router; 