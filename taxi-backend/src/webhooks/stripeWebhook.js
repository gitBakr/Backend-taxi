const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Reservation = require('../models/Reservation');
const Paiement = require('../models/Paiement');

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

        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                
                // Récupérer l'ID de réservation depuis les metadata
                const reservationId = paymentIntent.metadata.reservationId;
                const reservation = await Reservation.findById(reservationId);

                if (!reservation) {
                    console.error('Réservation non trouvée:', reservationId);
                    return res.status(404).json({
                        status: 'error',
                        message: 'Réservation non trouvée'
                    });
                }

                // Mettre à jour le statut de paiement
                reservation.paiement.statut = 'paye';
                await reservation.save();

                // Créer l'enregistrement de paiement
                await Paiement.create({
                    reservation: reservationId,
                    montant: paymentIntent.amount / 100,
                    stripePaymentId: paymentIntent.id,
                    statut: 'succès',
                    datePaiement: new Date()
                });

                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                await handlePaymentFailure(failedPayment);
                break;

            default:
                console.log(`Événement non géré: ${event.type}`);
        }

        res.json({ received: true });

    } catch (error) {
        console.error('Erreur générale webhook:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

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