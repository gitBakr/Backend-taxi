const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Routes d'authentification
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/register-admin', authController.registerAdmin);

module.exports = router; 