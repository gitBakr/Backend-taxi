const express = require('express');
const router = express.Router();
const prixController = require('../controllers/prixController');

// Routes
router.get('/estimation', prixController.estimerPrix);

module.exports = router; 