const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/', express.raw({type: 'application/json'}), async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.error('Webhook Error:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Gérer l'événement
        switch (event.type) {
            case 'payment_intent.succeeded':
                // Traitement du paiement réussi
                break;
            case 'payment_intent.payment_failed':
                // Traitement du paiement échoué
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({received: true});
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({error: error.message});
    }
});

module.exports = router; 