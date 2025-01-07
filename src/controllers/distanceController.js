const DistanceService = require('../services/distanceService');

exports.calculateDistance = async (req, res) => {
    try {
        const { originLat, originLng, destLat, destLng } = req.query;

        // Convertir les coordonnées en nombres
        const coordsDepart = {
            latitude: parseFloat(originLat),
            longitude: parseFloat(originLng)
        };

        const coordsArrivee = {
            latitude: parseFloat(destLat),
            longitude: parseFloat(destLng)
        };

        // Valider les coordonnées
        DistanceService.validateCoordinates(coordsDepart);
        DistanceService.validateCoordinates(coordsArrivee);

        // Calculer la distance
        const distance = DistanceService.calculerDistance(coordsDepart, coordsArrivee);

        // Estimer la durée (1.2 minutes par km en moyenne)
        const dureeEstimee = Math.round(distance * 1.2);

        res.json({
            status: 'success',
            data: {
                distance: distance,
                unite: 'km',
                details: {
                    depart: coordsDepart,
                    arrivee: coordsArrivee,
                    dureeEstimee: dureeEstimee,
                    uniteTemps: 'minutes'
                }
            }
        });

    } catch (error) {
        console.error('Erreur calcul distance:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
}; 