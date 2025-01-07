const axios = require('axios');

async function calculateRealDistance(origin, destination) {
    try {
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.latitude},${origin.longitude}&destinations=${destination.latitude},${destination.longitude}&mode=driving&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );

        const distance = response.data.rows[0].elements[0].distance.value / 1000; // Convertir en km
        const duration = response.data.rows[0].elements[0].duration.value / 60;   // Convertir en minutes

        return {
            distance: Math.round(distance),
            duration: Math.round(duration),
            route: response.data.rows[0].elements[0].status === 'OK'
        };
    } catch (error) {
        console.error('Erreur Google Maps:', error);
        // Fallback sur la distance à vol d'oiseau
        return calculateHaversineDistance(origin, destination);
    }
} 