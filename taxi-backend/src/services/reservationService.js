const Reservation = require('../models/Reservation');
const Chauffeur = require('../models/Chauffeur');
const NotificationService = require('./notificationService');

class ReservationService {
  async creerReservation(data) {
    // Vérifier la disponibilité du chauffeur
    const chauffeur = await Chauffeur.findById(data.chauffeur);
    if (!chauffeur || !chauffeur.disponible) {
      throw new Error('Chauffeur non disponible');
    }

    // Vérifier les conflits de réservation
    const conflit = await this.verifierConflitsHoraire(
      data.chauffeur,
      data.trajet.dateDepart,
      data.trajet.dureeEstimee
    );

    if (conflit) {
      throw new Error('Le chauffeur a déjà une réservation sur ce créneau');
    }

    // Créer la réservation
    const reservation = await Reservation.create(data);

    // Envoyer les notifications
    await NotificationService.notifierNouvelleReservation(reservation);

    return reservation;
  }

  async confirmerReservation(reservationId, chauffeurId) {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      throw new Error('Réservation non trouvée');
    }

    if (reservation.chauffeur.toString() !== chauffeurId) {
      throw new Error('Non autorisé à confirmer cette réservation');
    }

    if (reservation.statut !== 'en_attente') {
      throw new Error('Cette réservation ne peut plus être confirmée');
    }

    reservation.statut = 'confirmee';
    reservation.historique.push({
      statut: 'confirmee',
      date: new Date(),
      commentaire: 'Réservation confirmée par le chauffeur'
    });

    await reservation.save();
    await NotificationService.notifierConfirmationReservation(reservation);

    return reservation;
  }

  async demarrerCourse(reservationId, chauffeurId) {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation || reservation.chauffeur.toString() !== chauffeurId) {
      throw new Error('Réservation non trouvée ou non autorisée');
    }

    if (reservation.statut !== 'confirmee') {
      throw new Error('La course ne peut pas être démarrée');
    }

    reservation.statut = 'en_cours';
    reservation.historique.push({
      statut: 'en_cours',
      date: new Date(),
      commentaire: 'Course démarrée'
    });

    await reservation.save();
    return reservation;
  }

  async terminerCourse(reservationId, chauffeurId) {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation || reservation.chauffeur.toString() !== chauffeurId) {
      throw new Error('Réservation non trouvée ou non autorisée');
    }

    // Permettre de terminer la course si elle est confirmée ou en cours
    if (!['confirmee', 'en_cours'].includes(reservation.statut)) {
      throw new Error('La course ne peut pas être terminée');
    }

    reservation.statut = 'terminee';
    reservation.historique.push({
      statut: 'terminee',
      date: new Date(),
      commentaire: reservation.statut === 'en_cours' ? 
        'Course terminée normalement' : 
        'Course terminée avant démarrage'
    });

    await reservation.save();
    
    // Envoyer une notification au client
    await NotificationService.notifierFinCourse(reservation);

    return reservation;
  }

  async verifierConflitsHoraire(chauffeurId, dateDepart, dureeEstimee) {
    // Convertir la chaîne de date en objet Date
    const dateReservation = new Date(dateDepart);
    const finEstimee = new Date(dateReservation.getTime() + (dureeEstimee * 60 * 1000));
    
    const reservationsConflits = await Reservation.find({
        chauffeur: chauffeurId,
        statut: { $in: ['confirmee', 'en_cours'] },
        'trajet.dateDepart': { 
            $lt: finEstimee,
            $gt: dateReservation
        }
    });

    return reservationsConflits.length > 0;
  }

  async getReservationDetails(reservationId, userId) {
    const reservation = await Reservation.findById(reservationId)
      .populate('client', 'nom prenom telephone')
      .populate('chauffeur', 'nom prenom telephone vehicule');

    if (!reservation) {
      throw new Error('Réservation non trouvée');
    }

    if (reservation.client._id.toString() !== userId && 
        reservation.chauffeur._id.toString() !== userId) {
      throw new Error('Non autorisé à voir cette réservation');
    }

    return reservation;
  }
}

module.exports = new ReservationService(); 