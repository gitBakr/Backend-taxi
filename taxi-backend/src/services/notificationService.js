const smsService = require('./smsService');
const Client = require('../models/Client');
const Chauffeur = require('../models/Chauffeur');
const Notification = require('../models/Notification');

class NotificationService {
  async notifierNouvelleReservation(reservation) {
    try {
      // Charger les informations complètes
      const client = await Client.findById(reservation.client);
      const chauffeur = await Chauffeur.findById(reservation.chauffeur);
      
      // Notifier le client
      await smsService.sendSMS(
        client.telephone,
        `Votre réservation a été créée avec succès pour le ${reservation.trajet.dateDepart.toLocaleString()}. En attente de confirmation du chauffeur.`
      );

      // Notifier le chauffeur
      await smsService.sendSMS(
        chauffeur.telephone,
        `Nouvelle réservation pour ${reservation.trajet.villeDepart} - ${reservation.trajet.villeArrivee} le ${reservation.trajet.dateDepart.toLocaleString()}`
      );

      // Sauvegarder les notifications dans la réservation
      reservation.notifications.push(
        {
          type: 'confirmation',
          message: 'Réservation créée, en attente de confirmation',
          destinataire: 'client'
        },
        {
          type: 'confirmation',
          message: 'Nouvelle réservation à confirmer',
          destinataire: 'chauffeur'
        }
      );

      await reservation.save();
    } catch (error) {
      console.error('Erreur notification:', error);
    }
  }

  async notifierConfirmationReservation(reservation) {
    try {
      const client = await Client.findById(reservation.client);
      
      // Notifier le client de la confirmation
      await smsService.sendSMS(
        client.telephone,
        `Votre réservation pour ${reservation.trajet.villeDepart} - ${reservation.trajet.villeArrivee} a été confirmée par le chauffeur.`
      );

      // Ajouter la notification dans l'historique
      reservation.notifications.push({
        type: 'confirmation',
        message: 'Réservation confirmée par le chauffeur',
        destinataire: 'client'
      });

      await reservation.save();
    } catch (error) {
      console.error('Erreur notification confirmation:', error);
    }
  }

  async envoyerRappel(reservation) {
    try {
      const client = await Client.findById(reservation.client);
      const chauffeur = await Chauffeur.findById(reservation.chauffeur);

      // Rappel 1h avant
      const message = `Rappel: Votre trajet ${reservation.trajet.villeDepart} - ${reservation.trajet.villeArrivee} est prévu dans 1 heure.`;
      
      await smsService.sendSMS(client.telephone, message);
      await smsService.sendSMS(chauffeur.telephone, message);

      reservation.notifications.push({
        type: 'rappel',
        message: 'Rappel envoyé aux deux parties',
        destinataire: 'tous'
      });

      await reservation.save();
    } catch (error) {
      console.error('Erreur envoi rappel:', error);
    }
  }

  async notifierPaiementReussi(reservation) {
    // Notification pour le client
    await Notification.create({
      user: reservation.client,
      userType: 'Client',
      type: 'paiement',
      message: 'Votre paiement a été confirmé avec succès',
      lue: false,
      date: new Date()
    });

    // Notification pour le chauffeur
    await Notification.create({
      user: reservation.chauffeur,
      userType: 'Chauffeur',
      type: 'paiement',
      message: 'Le paiement de la course a été confirmé',
      lue: false,
      date: new Date()
    });
  }

  async notifierFinCourse(reservation) {
    // Notification pour le client
    await Notification.create({
      user: reservation.client,
      userType: 'Client',
      type: 'course',
      message: 'Votre course est terminée',
      lue: false,
      date: new Date()
    });

    // Notification pour le chauffeur
    await Notification.create({
      user: reservation.chauffeur,
      userType: 'Chauffeur',
      type: 'course',
      message: 'Course terminée avec succès',
      lue: false,
      date: new Date()
    });
  }
}

module.exports = new NotificationService(); 