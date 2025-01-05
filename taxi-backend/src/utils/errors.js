class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class PaymentError extends AppError {
  constructor(message, statusCode = 400) {
    super(message, statusCode);
    this.name = 'PaymentError';
  }
}

class StripeError extends PaymentError {
  constructor(stripeError) {
    super(stripeError.message);
    this.name = 'StripeError';
    this.stripeCode = stripeError.code;
    this.stripeType = stripeError.type;
  }
}

module.exports = {
  AppError,
  PaymentError,
  StripeError
}; 