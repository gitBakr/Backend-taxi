class SMSService {
  constructor() {
    this.isDev = process.env.NODE_ENV === 'development';
  }

  async sendSMS(to, message) {
    // Logger le code OTP pour la production
    console.log('\n=== SMS ENVOYÉ ===');
    console.log(`📱 Téléphone: ${to}`);
    console.log(`📝 Message: ${message}`);
    console.log('Code OTP:', message.match(/\d{6}/)[0]);  // Extrait le code à 6 chiffres
    console.log('================\n');

    // En développement, simuler l'envoi
    if (this.isDev) {
      return true;
    }

    // En production, implémenter l'envoi réel ici
    try {
      // TODO: Intégrer un service SMS réel
      return true;
    } catch (error) {
      console.error('Erreur envoi SMS:', error);
      return false;
    }
  }
}

module.exports = new SMSService(); 