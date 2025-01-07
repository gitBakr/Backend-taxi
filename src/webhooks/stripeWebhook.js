const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Reservation = require('../models/Reservation');
const Paiement = require('../models/Paiement');
const NotificationService = require('../services/notificationService');

const logger = {
    error: (message, error) => {
        console.error('\n❌ ERREUR STRIPE WEBHOOK ❌');
        console.error('================================');
        console.error('Message:', message);
        console.error('Erreur:', error);
        console.error('Stack:', error.stack);
        console.error('================================\n');
    },
    info: (message, data = {}) => {
        console.log('\n✅ INFO STRIPE WEBHOOK ✅');
        console.log('================================');
        console.log('Message:', message);
        if (Object.keys(data).length) {
            console.log('Données:', JSON.stringify(data, null, 2));
        }
        console.log('================================\n');
    }
};

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
                await handlePaymentSuccess(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await handlePaymentFailure(event.data.object);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({received: true});
    } catch (error) {
        logger.error('Erreur traitement webhook', error);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }
});

async function handlePaymentSuccess(paymentIntent) {
    try {
        const reservation = await Reservation.findById(paymentIntent.metadata.reservationId);
        if (!reservation) {
            throw new Error('Réservation non trouvée');
        }

        reservation.paiement.statut = 'payé';
        await reservation.save();

        await NotificationService.notifierPaiementReussi(reservation);
    } catch (error) {
        console.error('Erreur traitement paiement:', error);
        throw error;
    }
}

async function handlePaymentFailure(paymentIntent) {
    try {
        const reservation = await Reservation.findById(paymentIntent.metadata.reservationId);
        if (reservation) {
            reservation.paiement.statut = 'échoué';
            await reservation.save();
        }
    } catch (error) {
        console.error('Erreur traitement échec:', error);
        throw error;
    }
}

module.exports = router; 