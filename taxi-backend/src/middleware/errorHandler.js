const { AppError, PaymentError, StripeError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Erreurs opérationnelles connues
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      code: err.name
    });
  }

  // Erreurs Stripe
  if (err instanceof StripeError) {
    return res.status(400).json({
      status: 'error',
      message: err.message,
      code: err.stripeCode,
      type: err.stripeType
    });
  }

  // Erreurs Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Données invalides',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // Erreur par défaut
  return res.status(500).json({
    status: 'error',
    message: 'Erreur interne du serveur'
  });
};

module.exports = errorHandler; 