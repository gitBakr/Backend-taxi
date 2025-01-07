const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Reservation = require('../models/Reservation');
const Paiement = require('../models/Paiement');
const NotificationService = require('../services/notificationService');

router.post('/', async (req, res) => {
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
            console.error('Erreur webhook:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Traiter l'événement
        const result = await handleStripeEvent(event);

        res.json({ received: true, ...result });

    } catch (error) {
        console.error('Erreur générale webhook:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

async function handleStripeEvent(event) {
    switch (event.type) {
        case 'payment_intent.succeeded':
            return await handlePaymentSuccess(event.data.object);

        case 'payment_intent.payment_failed':
            return await handlePaymentFailure(event.data.object);

        case 'charge.dispute.created':
            return await handleDispute(event.data.object);

        case 'charge.refunded':
            return await handleRefund(event.data.object);

        default:
            console.log(`Événement non géré: ${event.type}`);
            return { status: 'ignored', type: event.type };
    }
}

async function handlePaymentSuccess(paymentIntent) {
    const reservationId = paymentIntent.metadata.reservationId;
    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
        throw new Error(`Réservation non trouvée: ${reservationId}`);
    }

    // Mettre à jour le statut
    reservation.paiement.statut = 'paye';
    await reservation.save();

    // Créer l'enregistrement de paiement
    const paiement = await Paiement.create({
        reservation: reservationId,
        montant: paymentIntent.amount / 100,
        stripePaymentId: paymentIntent.id,
        statut: 'succès',
        datePaiement: new Date()
    });

    // Envoyer une notification
    await NotificationService.notifierPaiementReussi(reservation);

    return { 
        status: 'success', 
        type: 'payment_success',
        reservationId,
        paiementId: paiement._id
    };
}

async function handlePaymentFailure(paymentIntent) {
    try {
        const reservationId = paymentIntent.metadata.reservationId;
        
        // Mettre à jour la réservation
        await Reservation.findByIdAndUpdate(reservationId, {
            'paiement.statut': 'échoué',
            dateEchec: new Date()
        });

        // Enregistrer l'échec
        await Paiement.create({
            reservation: reservationId,
            montant: paymentIntent.amount / 100,
            stripePaymentId: paymentIntent.id,
            statut: 'échoué',
            datePaiement: new Date(),
            raisonEchec: paymentIntent.last_payment_error?.message
        });

    } catch (error) {
        console.error('Erreur traitement paiement échoué:', error);
        throw error;
    }
}

module.exports = router; 