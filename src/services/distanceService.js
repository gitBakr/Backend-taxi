const axios = require('axios');
require('dotenv').config();

class DistanceService {
    constructor() {
        this.EARTH_RADIUS = 6371; // Rayon de la Terre en km
    }

    calculerDistance(coordsDepart, coordsArrivee) {
        try {
            const lat1 = this.toRadians(coordsDepart.latitude);
            const lon1 = this.toRadians(coordsDepart.longitude);
            const lat2 = this.toRadians(coordsArrivee.latitude);
            const lon2 = this.toRadians(coordsArrivee.longitude);

            // Formule de Haversine
            const dLat = lat2 - lat1;
            const dLon = lon2 - lon1;

            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat1) * Math.cos(lat2) * 
                    Math.sin(dLon/2) * Math.sin(dLon/2);
            
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = this.EARTH_RADIUS * c;

            // Arrondir à 2 décimales
            return Math.round(distance * 100) / 100;
        } catch (error) {
            console.error('Erreur calcul distance:', error);
            throw new Error('Erreur lors du calcul de la distance');
        }
    }

    toRadians(degrees) {
        return degrees * (Math.PI/180);
    }

    // Méthode pour vérifier si les coordonnées sont valides
    validateCoordinates(coords) {
        if (!coords || typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') {
            throw new Error('Coordonnées invalides');
        }
        if (coords.latitude < -90 || coords.latitude > 90) {
            throw new Error('Latitude invalide');
        }
        if (coords.longitude < -180 || coords.longitude > 180) {
            throw new Error('Longitude invalide');
        }
        return true;
    }
}

module.exports = new DistanceService(); 