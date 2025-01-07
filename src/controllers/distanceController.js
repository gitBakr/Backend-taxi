const DistanceService = require('../services/distanceService');

exports.calculateDistance = async (req, res) => {
    try {
        const { originLat, originLng, destLat, destLng } = req.query;

        const origin = {
            lat: parseFloat(originLat),
            lng: parseFloat(originLng)
        };

        const destination = {
            lat: parseFloat(destLat),
            lng: parseFloat(destLng)
        };

        const result = await DistanceService.getDistance(origin, destination);

        res.json({
            status: 'success',
            data: {
                ...result,
                origin,
                destination
            }
        });

    } catch (error) {
        console.error('Erreur calcul distance:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}; 