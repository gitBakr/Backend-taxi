const ReservationService = require('../services/reservationService');

exports.creerReservation = async (req, res) => {
  try {
    const data = {
      ...req.body,
      client: req.user.userId
    };

    const dateDepart = new Date(data.trajet.dateDepart);
    if (dateDepart <= new Date()) {
      return res.status(400).json({
        status: 'error',
        message: 'La date de départ doit être dans le futur'
      });
    }

    const reservation = await ReservationService.creerReservation(data);

    res.status(201).json({
      status: 'success',
      message: 'Réservation créée avec succès',
      data: reservation
    });
  } catch (error) {
    console.error('Erreur création réservation:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.confirmerReservation = async (req, res) => {
  try {
    const reservation = await ReservationService.confirmerReservation(
      req.params.id,
      req.user.userId
    );

    res.status(200).json({
      status: 'success',
      message: 'Réservation confirmée',
      data: reservation
    });
  } catch (error) {
    console.error('Erreur confirmation réservation:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.demarrerCourse = async (req, res) => {
  try {
    const reservation = await ReservationService.demarrerCourse(
      req.params.id,
      req.user.userId
    );

    res.status(200).json({
      status: 'success',
      message: 'Course démarrée',
      data: reservation
    });
  } catch (error) {
    console.error('Erreur démarrage course:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.terminerCourse = async (req, res) => {
  try {
    // Vérifier si la confirmation est présente
    if (!req.body.confirmation) {
      return res.status(400).json({
        status: 'confirmation_required',
        message: 'Êtes-vous sûr de vouloir terminer cette course ?'
      });
    }

    const reservation = await ReservationService.terminerCourse(
      req.params.id,
      req.user.userId
    );

    res.status(200).json({
      status: 'success',
      message: 'Course terminée avec succès',
      data: reservation
    });
  } catch (error) {
    console.error('Erreur fin course:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getReservation = async (req, res) => {
  try {
    const reservation = await ReservationService.getReservationDetails(
      req.params.id,
      req.user.userId
    );

    res.status(200).json({
      status: 'success',
      data: reservation
    });
  } catch (error) {
    console.error('Erreur récupération réservation:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
}; 