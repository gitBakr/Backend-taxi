const Paiement = require('../models/Paiement');
const Reservation = require('../models/Reservation');
const NotificationService = require('./notificationService');
const StripeService = require('./stripeService');
const { PaymentError, StripeError } = require('../utils/errors');

class PaiementService {
  async initierPaiement(reservationId, methode) {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      throw new Error('Réservation non trouvée');
    }

    let stripeDetails = {};
    if (methode === 'carte') {
      const paymentIntent = await StripeService.createPaymentIntent(
        reservation.paiement.montantTotal
      );
      stripeDetails = {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status
      };
    }

    const paiement = await Paiement.create({
      reservation: reservationId,
      montant: reservation.paiement.montantTotal,
      methode,
      reference: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      stripe: stripeDetails
    });

    // Mettre à jour la réservation
    reservation.paiement.statut = 'en_attente';
    await reservation.save();

    return paiement;
  }

  async confirmerPaiement(paymentIntentId, paymentData) {
    const paiement = await Paiement.findOne({ 'stripe.paymentIntentId': paymentIntentId });
    if (!paiement) {
      throw new PaymentError('Paiement non trouvé', 404);
    }

    // Vérifier si le paiement est déjà confirmé
    if (paiement.statut === 'complete') {
      throw new PaymentError('Ce paiement a déjà été confirmé', 400);
    }

    try {
      if (!paymentData.confirmation) {
        throw new Error('Confirmation requise');
      }

      // Préparer les données de paiement pour Stripe
      const stripePaymentData = {
        type: 'card',
        token: typeof paymentData.card === 'string' ? paymentData.card : 
               paymentData.card?.token || 
               (paymentData.paymentMethod?.token)
      };

      if (!stripePaymentData.token) {
        throw new Error('Token de carte requis');
      }

      // Créer la méthode de paiement avec Stripe
      const paymentMethod = await StripeService.createPaymentMethod(stripePaymentData);

      // Confirmer le paiement avec Stripe
      const stripeResult = await StripeService.confirmPayment(
        paymentIntentId, 
        paymentMethod.id
      );
      
      if (stripeResult.requiresAction) {
        return {
          requiresAction: true,
          clientSecret: stripeResult.clientSecret
        };
      }

      // Ajouter la capture si nécessaire
      if (stripeResult.status === 'requires_capture') {
        const captureResult = await StripeService.capturePayment(paymentIntentId);
        if (captureResult.status === 'succeeded') {
          stripeResult.success = true;
          stripeResult.status = 'succeeded';
        }
      }

      if (stripeResult.success || stripeResult.status === 'succeeded') {
        // Mettre à jour le statut
        paiement.statut = 'complete';
        paiement.dateMiseAJour = new Date();
        await paiement.save();

        // Mettre à jour la réservation
        const reservation = await Reservation.findById(paiement.reservation);
        reservation.paiement.statut = 'paye';
        await reservation.save();

        // Envoyer une notification
        await NotificationService.notifierPaiementReussi(reservation);

        return {
          success: true,
          paiement
        };
      }

      return {
        success: false,
        status: stripeResult.status
      };
    } catch (error) {
      if (error.type === 'StripeError') {
        throw new StripeError(error);
      }
      throw new PaymentError(error.message);
    }
  }

  async rembourserPaiement(reference, raison) {
    // Chercher d'abord par référence
    const paiement = await Paiement.findOne({ 
      $or: [
        { reference: reference },
        { 'stripe.paymentIntentId': reference }
      ]
    });

    if (!paiement) {
      throw new Error('Paiement non trouvé');
    }

    try {
      // Effectuer le remboursement via Stripe
      if (paiement.stripe?.paymentIntentId) {
        await StripeService.createRefund(
          paiement.stripe.paymentIntentId,
          paiement.montant,
          raison
        );
      }

      // Mettre à jour le statut
      paiement.statut = 'rembourse';
      paiement.details = {
        ...paiement.details,
        error_message: raison,
        remboursement_date: new Date()
      };
      paiement.dateMiseAJour = new Date();
      await paiement.save();

      // Mettre à jour la réservation
      const reservation = await Reservation.findById(paiement.reservation);
      reservation.paiement.statut = 'rembourse';
      await reservation.save();

      return paiement;
    } catch (error) {
      console.error('Erreur remboursement:', error);
      throw error;
    }
  }
}

module.exports = new PaiementService(); 