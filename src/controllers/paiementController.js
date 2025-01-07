const PaiementService = require('../services/paiementService');
const Paiement = require('../models/Paiement');

exports.initierPaiement = async (req, res) => {
  try {
    const { reservationId, methode } = req.body;
    const paiement = await PaiementService.initierPaiement(reservationId, methode);

    res.status(200).json({
      status: 'success',
      message: 'Paiement initié avec succès',
      data: paiement
    });
  } catch (error) {
    console.error('Erreur initiation paiement:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.confirmerPaiement = async (req, res) => {
  try {
    const { reference } = req.params;
    const paymentData = req.body;

    console.log('Données reçues:', paymentData);

    if (!paymentData || !paymentData.confirmation) {
      return res.status(400).json({
        status: 'error',
        message: 'Confirmation requise'
      });
    }

    if (!paymentData.card && !paymentData.paymentMethod) {
      return res.status(400).json({
        status: 'error',
        message: 'Données de paiement requises'
      });
    }

    const paiement = await PaiementService.confirmerPaiement(reference, paymentData);

    res.status(200).json({
      status: 'success',
      message: 'Paiement confirmé avec succès',
      data: paiement
    });
  } catch (error) {
    console.error('Erreur confirmation paiement:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.rembourserPaiement = async (req, res) => {
  try {
    const { reference } = req.params;
    const { raison } = req.body;
    const paiement = await PaiementService.rembourserPaiement(reference, raison);

    res.status(200).json({
      status: 'success',
      message: 'Remboursement effectué avec succès',
      data: paiement
    });
  } catch (error) {
    console.error('Erreur remboursement:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getPaiement = async (req, res) => {
  try {
    const paiement = await Paiement.findOne({
      $or: [
        { 'stripe.paymentIntentId': req.params.id },
        { reference: req.params.id }
      ]
    }).populate('reservation');

    if (!paiement) {
      return res.status(404).json({
        status: 'error',
        message: 'Paiement non trouvé'
      });
    }

    res.status(200).json({
      status: 'success',
      data: paiement
    });
  } catch (error) {
    console.error('Erreur récupération paiement:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
}; 