const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Paiement = require('../models/Paiement');
const NotificationService = require('../services/notificationService');

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Vérifier la signature du webhook
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Traiter l'événement
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      
      case 'charge.dispute.created':
        await handleDispute(event.data.object);
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Erreur webhook:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

async function handlePaymentSuccess(paymentIntent) {
  const paiement = await Paiement.findOne({
    'stripe.paymentIntentId': paymentIntent.id
  });

  if (paiement) {
    paiement.statut = 'complete';
    paiement.dateMiseAJour = new Date();
    await paiement.save();

    await NotificationService.notifierPaiementReussi(paiement.reservation);
  }
}

async function handlePaymentFailure(paymentIntent) {
  const paiement = await Paiement.findOne({
    'stripe.paymentIntentId': paymentIntent.id
  });

  if (paiement) {
    paiement.statut = 'echoue';
    paiement.details = {
      ...paiement.details,
      error_message: paymentIntent.last_payment_error?.message
    };
    await paiement.save();

    await NotificationService.notifierEchecPaiement(paiement.reservation);
  }
}

async function handleDispute(dispute) {
  const paiement = await Paiement.findOne({
    'stripe.paymentIntentId': dispute.payment_intent
  });

  if (paiement) {
    paiement.statut = 'conteste';
    paiement.details = {
      ...paiement.details,
      dispute: {
        id: dispute.id,
        reason: dispute.reason,
        status: dispute.status,
        amount: dispute.amount
      }
    };
    await paiement.save();

    await NotificationService.notifierDispute(paiement.reservation);
  }
} 