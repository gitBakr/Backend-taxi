const net = require('net');
const fs = require('fs');
const path = require('path');

// Fonction pour trouver un port disponible
const findAvailablePort = async (startPort) => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });

    server.listen(startPort, () => {
      server.close(() => {
        resolve(startPort);
      });
    });
  });
};

// Fonction pour mettre à jour les fichiers .rest
const updateRestFiles = async (port) => {
  const testsDir = path.join(__dirname, '..', '..', 'tests');
  
  if (fs.existsSync(testsDir)) {
    const restFiles = [
      'clients.rest',
      'chauffeurs.rest',
      'reservations.rest',
      'auth.rest',
      'paiements.rest'
    ];

    restFiles.forEach(file => {
      const filePath = path.join(testsDir, file);
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(
          /@baseUrl = http:\/\/localhost:\d+\/api/,
          `@baseUrl = http://localhost:${port}/api`
        );
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file} with port ${port}`);
      }
    });
  }
};

module.exports = {
  findAvailablePort,
  updateRestFiles
}; 