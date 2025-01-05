const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PaymentError, StripeError } = require('../utils/errors');

class StripeService {
  async createPaymentIntent(amount, currency = 'eur', paymentMethodData = null) {
    try {
      if (amount <= 0) {
        throw new PaymentError('Le montant doit être supérieur à 0', 400);
      }

      const paymentIntentParams = {
        amount: Math.round(amount * 100),
        currency,
        payment_method_types: ['card'],
        capture_method: 'manual',
      };

      if (paymentMethodData) {
        const paymentMethod = await this.createPaymentMethod(paymentMethodData);
        paymentIntentParams.payment_method = paymentMethod.id;
      }

      const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
      return paymentIntent;
    } catch (error) {
      if (error.type === 'StripeError') {
        throw new StripeError(error);
      }
      throw new PaymentError(error.message);
    }
  }

  async confirmPayment(paymentIntentId, paymentMethodId = null) {
    try {
      if (!paymentIntentId) {
        throw new PaymentError('ID de paiement requis', 400);
      }

      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId
      });

      return this._handlePaymentIntentStatus(paymentIntent);
    } catch (error) {
      if (error.type === 'StripeError') {
        throw new StripeError(error);
      }
      throw new PaymentError(error.message);
    }
  }

  async capturePayment(paymentIntentId) {
    try {
      if (!paymentIntentId) {
        throw new PaymentError('ID de paiement requis', 400);
      }

      const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      if (error.type === 'StripeError') {
        throw new StripeError(error);
      }
      throw new PaymentError(error.message);
    }
  }

  async createRefund(paymentIntentId, amount, reason = null) {
    try {
      if (!paymentIntentId) {
        throw new PaymentError('ID de paiement requis', 400);
      }

      const refundParams = {
        payment_intent: paymentIntentId,
        amount: Math.round(amount * 100)
      };

      if (reason) {
        if (!['duplicate', 'fraudulent', 'requested_by_customer'].includes(reason)) {
          throw new PaymentError('Raison de remboursement invalide', 400);
        }
        refundParams.reason = reason;
      }

      const refund = await stripe.refunds.create(refundParams);
      return refund;
    } catch (error) {
      if (error.type === 'StripeError') {
        throw new StripeError(error);
      }
      throw new PaymentError(error.message);
    }
  }

  // Méthode privée pour gérer les statuts de paiement
  _handlePaymentIntentStatus(paymentIntent) {
    switch (paymentIntent.status) {
      case 'requires_action':
        return {
          requiresAction: true,
          clientSecret: paymentIntent.client_secret
        };
      case 'succeeded':
        return {
          success: true,
          paymentIntent
        };
      default:
        return {
          success: false,
          status: paymentIntent.status
        };
    }
  }

  async createPaymentMethod(paymentData) {
    try {
      let paymentMethodParams;
      
      if (paymentData.token) {
        paymentMethodParams = {
          type: 'card',
          card: { token: paymentData.token }
        };
      } else if (paymentData.card) {
        paymentMethodParams = {
          type: 'card',
          card: paymentData.card
        };
      } else {
        throw new Error('Token ou données de carte requis');
      }

      const paymentMethod = await stripe.paymentMethods.create(paymentMethodParams);
      return paymentMethod;
    } catch (error) {
      console.error('Stripe payment method error:', error);
      throw new Error(error.message);
    }
  }
}

module.exports = new StripeService(); 