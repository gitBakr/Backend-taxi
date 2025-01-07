const PrixService = require('../services/prixService');
const Ville = require('../models/Ville');

exports.estimationInstantanee = async (req, res) => {
    try {
        const { lat, lng, villeArriveeId } = req.query;

        // Trouver la ville d'arrivée
        const villeArrivee = await Ville.findById(villeArriveeId);
        if (!villeArrivee) {
            return res.status(404).json({
                status: 'error',
                message: 'Ville d\'arrivée non trouvée'
            });
        }

        // Créer un point de départ à partir des coordonnées
        const depart = {
            coordinates: {
                lat: parseFloat(lat),
                lng: parseFloat(lng)
            }
        };

        // Calculer le prix
        const estimation = await PrixService.calculerPrixInstantane(
            depart,
            villeArrivee,
            {
                isNuit: req.query.isNuit === 'true',
                isWeekend: req.query.isWeekend === 'true',
                isHeurePointe: req.query.isHeurePointe === 'true'
            }
        );

        res.json(estimation);

    } catch (error) {
        console.error('Erreur estimation:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}; 