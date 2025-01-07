const axios = require('axios');
require('dotenv').config();

class DistanceService {
    async getDistance(origin, destination) {
        try {
            // Utiliser OSRM (OpenStreetMap)
            const response = await axios.get(
                `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`
            );

            if (response.data.code !== 'Ok') {
                return this.calculateHaversineDistance(origin, destination);
            }

            const route = response.data.routes[0];
            return {
                distance: route.distance / 1000, // Convertir en km
                duration: route.duration / 60,   // Convertir en minutes
                status: 'success'
            };
        } catch (error) {
            console.error('Erreur OSRM:', error);
            // Fallback sur calcul simple
            return this.calculateHaversineDistance(origin, destination);
        }
    }

    calculateHaversineDistance(origin, destination) {
        const R = 6371;
        const dLat = this.toRad(destination.lat - origin.lat);
        const dLon = this.toRad(destination.lng - origin.lng);
        const lat1 = this.toRad(origin.lat);
        const lat2 = this.toRad(destination.lat);

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        return {
            distance,
            duration: distance * 1.2, // Estimation du temps en minutes
            status: 'estimated'
        };
    }

    toRad(value) {
        return value * Math.PI / 180;
    }
}

module.exports = new DistanceService(); 