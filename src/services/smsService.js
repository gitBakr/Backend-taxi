class SMSService {
  constructor() {
    this.isDev = process.env.NODE_ENV === 'development';
  }

  async sendSMS(to, message) {
    // Extraire le code OTP
    const otpCode = message.match(/\d{6}/)[0];
    
    // Log détaillé pour Render
    console.log('\n🔐 NOUVEAU CODE OTP GÉNÉRÉ 🔐');
    console.log('==========================');
    console.log(`📱 Téléphone: ${to}`);
    console.log(`🔑 Code: ${otpCode}`);
    console.log(`⏰ Date: ${new Date().toISOString()}`);
    console.log('==========================\n');

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