const PrixService = require('../services/prixService');
const Ville = require('../models/Ville');

exports.estimerPrix = async (req, res) => {
    try {
        const { 
            depart, departLat, departLng,
            arrivee, arriveeLat, arriveeLng,
            date, passagers, options 
        } = req.query;

        // Créer les objets ville avec coordonnées
        const villeDepart = {
            nom: depart,
            coordinates: {
                lat: parseFloat(departLat),
                lng: parseFloat(departLng)
            }
        };

        const villeArrivee = {
            nom: arrivee,
            coordinates: {
                lat: parseFloat(arriveeLat),
                lng: parseFloat(arriveeLng)
            }
        };

        // Calculer le prix
        const prix = await PrixService.calculerPrix(
            villeDepart,
            villeArrivee,
            {
                date,
                passagers: parseInt(passagers),
                climatisation: options?.includes('climatisation')
            }
        );

        res.json({ 
            status: 'success', 
            data: prix 
        });

    } catch (error) {
        console.error('Erreur estimation prix:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
}; 