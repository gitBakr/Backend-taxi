const express = require('express');
const router = express.Router();
const distanceController = require('../controllers/distanceController');

router.get('/calculate', distanceController.calculateDistance);

module.exports = router; 