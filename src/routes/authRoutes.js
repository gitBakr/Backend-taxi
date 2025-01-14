const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const OTP = require('../models/OTP');

// Routes d'authentification
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/register-admin', authController.registerAdmin);

// Ajouter cette route pour voir le dernier code OTP
if (process.env.NODE_ENV !== 'production') {
  router.get('/debug/last-otp/:telephone', async (req, res) => {
    try {
      const otp = await OTP.findOne(
        { telephone: req.params.telephone },
        { code: 1 },
        { sort: { createdAt: -1 } }
      );
      
      res.json({
        status: 'success',
        data: {
          telephone: req.params.telephone,
          code: otp?.code || 'Aucun code trouvé'
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  });
}

// Route temporaire pour tester (À SUPPRIMER EN PRODUCTION)
router.get('/test-otp/:telephone', async (req, res) => {
  try {
    const lastOTP = await OTP.findOne(
      { telephone: req.params.telephone },
      {},
      { sort: { createdAt: -1 } }
    );

    if (!lastOTP) {
      return res.status(404).json({
        status: 'error',
        message: 'Aucun code trouvé pour ce numéro'
      });
    }

    res.json({
      status: 'success',
      data: {
        telephone: lastOTP.telephone,
        code: lastOTP.code,
        createdAt: lastOTP.createdAt,
        expiresAt: lastOTP.expiresAt
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router; 