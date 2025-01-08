const PrixService = require('../services/prixService');
const Ville = require('../models/Ville');

exports.estimerPrix = async (req, res) => {
    try {
        console.log('\n📊 ESTIMATION PRIX');
        console.log('Paramètres:', req.query);

        const { depart, arrivee, passagers = 1, options = '' } = req.query;

        // Recherche des villes (insensible à la casse)
        const [villeDepart, villeArrivee] = await Promise.all([
            Ville.findOne({ 
                nom: { $regex: new RegExp(`^${depart}$`, 'i') }
            }).select('nom coordinates location'),
            Ville.findOne({ 
                nom: { $regex: new RegExp(`^${arrivee}$`, 'i') }
            }).select('nom coordinates location')
        ]);

        console.log('Ville départ trouvée:', villeDepart);
        console.log('Ville arrivée trouvée:', villeArrivee);

        if (!villeDepart || !villeArrivee) {
            return res.status(400).json({
                status: 'error',
                message: `Ville${!villeDepart ? ' de départ' : ''}${!villeArrivee ? ' d\'arrivée' : ''} non trouvée`
            });
        }

        if (!villeDepart.coordinates || !villeArrivee.coordinates) {
            return res.status(400).json({
                status: 'error',
                message: 'Coordonnées manquantes pour une ou plusieurs villes'
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

        console.log('Résultat calcul:', resultat);
        res.json(resultat);

    } catch (error) {
        console.error('❌ Erreur estimation prix:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
}; 