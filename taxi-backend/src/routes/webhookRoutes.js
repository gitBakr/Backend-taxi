const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Important : Raw body pour Stripe
router.post('/stripe', 
  express.raw({type: 'application/json'}),
  webhookController.handleStripeWebhook
);

module.exports = router; 