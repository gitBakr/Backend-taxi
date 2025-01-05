const OTP = require('../models/OTP');
const smsService = require('./smsService');

class AuthService {
  // Générer un code à 6 chiffres
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Envoyer le code par SMS
  async sendOTP(telephone) {
    try {
      // Générer le code
      const code = this.generateOTP();
      
      // Sauvegarder dans la base de données
      await OTP.create({ telephone, code });
      
      // Envoyer le SMS
      const message = `Votre code de vérification est : ${code}`;
      await smsService.sendSMS(telephone, message);
      
      return true;
    } catch (error) {
      console.error('Erreur envoi OTP:', error);
      return false;
    }
  }

  // Vérifier le code
  async verifyOTP(telephone, code) {
    try {
      const otp = await OTP.findOne({ 
        telephone,
        code,
        createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) } // 5 minutes
      });

      if (!otp) return false;

      // Supprimer le code utilisé
      await OTP.deleteOne({ _id: otp._id });
      
      return true;
    } catch (error) {
      console.error('Erreur vérification OTP:', error);
      return false;
    }
  }
}

module.exports = new AuthService(); 