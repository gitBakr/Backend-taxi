const PrixService = require('../services/prixService');
const Ville = require('../models/Ville');

exports.estimerPrix = async (req, res) => {
    try {
        const { depart, arrivee, passagers = 1, options = '' } = req.query;

        // Recherche des villes
        const [villeDepart, villeArrivee] = await Promise.all([
            Ville.findOne({ 
                nom: { $regex: new RegExp(`^${depart}$`, 'i') }
            }).select('nom coordinates location'),
            Ville.findOne({ 
                nom: { $regex: new RegExp(`^${arrivee}$`, 'i') }
            }).select('nom coordinates location')
        ]);

        if (!villeDepart || !villeArrivee) {
            return res.status(400).json({
                status: 'error',
                message: 'Ville de départ ou d\'arrivée non trouvée'
            });
        }

        // Calculer le prix
        const resultat = await PrixService.calculerPrix(
            villeDepart,
            villeArrivee,
            {
                passagers: parseInt(passagers),
                climatisation: options.includes('climatisation')
            }
        );

        res.json({
            status: 'success',
            data: {
                prix: resultat.montant,
                details: {
                    ...resultat.details,
                    villeDepart: villeDepart.nom,
                    villeArrivee: villeArrivee.nom
                }
            }
        });

    } catch (error) {
        console.error('Erreur estimation prix:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
}; 