class SMSService {
  constructor() {
    this.isDev = process.env.NODE_ENV === 'development';
  }

  async sendSMS(to, message) {
    // En développement, on simule juste l'envoi
    console.log('=== SMS SIMULÉ ===');
    console.log(`À: ${to}`);
    console.log(`Message: ${message}`);
    console.log('=================');
    return true;
  }
}

module.exports = new SMSService(); 