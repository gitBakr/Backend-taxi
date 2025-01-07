const Tarif = require('../models/Tarif');
const Chauffeur = require('../models/Chauffeur');
const Ville = require('../models/Ville');

exports.checkDisponibilite = async (req, res) => {
    try {
        const { depart, arrivee } = req.query;

        // Trouver les IDs des villes
        const [villeDepart, villeArrivee] = await Promise.all([
            Ville.findOne({ nom: { $regex: new RegExp(depart, 'i') } }),
            Ville.findOne({ nom: { $regex: new RegExp(arrivee, 'i') } })
        ]);

        if (!villeDepart || !villeArrivee) {
            return res.status(400).json({
                status: 'error',
                message: 'Ville non trouvée'
            });
        }

        // Vérifier les chauffeurs disponibles
        const chauffeursDispo = await Tarif.aggregate([
            {
                $match: {
                    villeDepart: villeDepart._id,
                    villeArrivee: villeArrivee._id
                }
            },
            {
                $lookup: {
                    from: 'chauffeurs',
                    localField: 'chauffeur',
                    foreignField: '_id',
                    as: 'chauffeur'
                }
            },
            {
                $match: {
                    'chauffeur.disponible': true
                }
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                disponible: chauffeursDispo.length > 0,
                nombreChauffeurs: chauffeursDispo.length,
                prixMin: Math.min(...chauffeursDispo.map(t => t.prixBase)),
                prixMax: Math.max(...chauffeursDispo.map(t => t.prixBase)),
                dureeEstimee: 120 // minutes (à calculer avec un service de distance)
            }
        });

    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
}; 