const Ville = require('../models/Ville');
const Chauffeur = require('../models/Chauffeur');
const Tarif = require('../models/Tarif');
const { calculerPrix } = require('../services/prixService');

exports.getAllVilles = async (req, res) => {
    try {
        const villes = await Ville.find({ active: true })
                                .sort({ nom: 1 });
        res.status(200).json({
            status: 'success',
            data: villes
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.getTrajetsDisponibles = async (req, res) => {
    try {
        const trajets = await Ville.aggregate([
            { $match: { active: true } },
            {
                $lookup: {
                    from: 'tarifs',
                    localField: '_id',
                    foreignField: 'villeDepart',
                    as: 'trajetsDisponibles'
                }
            }
        ]);
        res.status(200).json({
            status: 'success',
            data: trajets
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.estimerTrajet = async (req, res) => {
    try {
        const { villeDepart, villeArrivee } = req.body;
        const { isNuit, isWeekend } = req.query;

        // Calculer la distance
        const distance = calculateDistance(villeDepart.coordinates, villeArrivee.coordinates);

        // Calculer le prix avec les options
        const prix = calculerPrix(distance, {
            isNuit,
            isWeekend,
            isHeurePointe: isHeureDePointe(),
            isSaisonHaute: isSaisonHaute()
        });

        res.status(200).json({
            status: 'success',
            data: {
                distance,
                prix,
                duree: Math.round(distance * 1.2) // Estimation du temps en minutes
            }
        });

    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.getVillesDisponibles = async (req, res) => {
    try {
        // Trouver les villes qui ont des chauffeurs disponibles
        const villesAvecChauffeurs = await Tarif.aggregate([
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
            },
            {
                $group: {
                    _id: '$villeDepart',
                    nombreChauffeurs: { $sum: 1 }
                }
            }
        ]);

        const villeIds = villesAvecChauffeurs.map(v => v._id);
        const villes = await Ville.find({
            _id: { $in: villeIds },
            active: true
        });

        res.status(200).json({
            status: 'success',
            data: villes
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.ajouterVille = async (req, res) => {
    try {
        const { nom, gouvernorat, region, codePostal, coordinates } = req.body;

        // Validation de la région
        const regionsValides = ['Nord', 'Nord-Est', 'Nord-Ouest', 'Centre', 'Sahel', 'Sud', 'Sud-Est', 'Sud-Ouest'];
        if (!regionsValides.includes(region)) {
            return res.status(400).json({
                status: 'error',
                message: 'Région invalide'
            });
        }

        // Vérifier si la ville existe déjà
        const villeExiste = await Ville.findOne({ nom });
        if (villeExiste) {
            return res.status(400).json({
                status: 'error',
                message: 'Cette ville existe déjà'
            });
        }

        // Créer la nouvelle ville
        const nouvelleVille = await Ville.create({
            nom,
            gouvernorat,
            region,
            codePostal,
            coordinates,
            active: true
        });

        res.status(201).json({
            status: 'success',
            message: 'Ville ajoutée avec succès',
            data: nouvelleVille
        });

    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Fonction pour calculer la distance entre deux points
function calculateDistance(point1, point2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = toRad(point2.latitude - point1.latitude);
    const dLon = toRad(point2.longitude - point1.longitude);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(point1.latitude)) * Math.cos(toRad(point2.latitude)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;  // Distance en kilomètres
    
    return Math.round(distance);
}

function toRad(value) {
    return value * Math.PI / 180;
}

// Mettre à jour une ville
exports.updateVille = async (req, res) => {
    try {
        const { villeId } = req.params;
        const { nom, gouvernorat, region, codePostal, coordinates, active } = req.body;

        // Validation de la région
        const regionsValides = ['Nord', 'Nord-Est', 'Nord-Ouest', 'Centre', 'Sahel', 'Sud', 'Sud-Est', 'Sud-Ouest'];
        if (region && !regionsValides.includes(region)) {
            return res.status(400).json({
                status: 'error',
                message: 'Région invalide'
            });
        }

        // Vérifier si le nouveau nom existe déjà
        if (nom) {
            const villeExiste = await Ville.findOne({ 
                nom, 
                _id: { $ne: villeId } 
            });
            if (villeExiste) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Ce nom de ville est déjà utilisé'
                });
            }
        }

        const villeModifiee = await Ville.findByIdAndUpdate(
            villeId,
            {
                nom,
                gouvernorat,
                region,
                codePostal,
                coordinates,
                active
            },
            { new: true, runValidators: true }
        );

        if (!villeModifiee) {
            return res.status(404).json({
                status: 'error',
                message: 'Ville non trouvée'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Ville modifiée avec succès',
            data: villeModifiee
        });

    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Supprimer une ville (soft delete)
exports.deleteVille = async (req, res) => {
    try {
        const { villeId } = req.params;

        // Vérifier si la ville est utilisée dans des trajets
        const trajetsExistants = await Tarif.find({
            $or: [
                { villeDepart: villeId },
                { villeArrivee: villeId }
            ]
        });

        if (trajetsExistants.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Cette ville ne peut pas être supprimée car elle est utilisée dans des trajets'
            });
        }

        // Soft delete (désactiver au lieu de supprimer)
        const villeDesactivee = await Ville.findByIdAndUpdate(
            villeId,
            { active: false },
            { new: true }
        );

        if (!villeDesactivee) {
            return res.status(404).json({
                status: 'error',
                message: 'Ville non trouvée'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Ville désactivée avec succès'
        });

    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Obtenir une ville spécifique
exports.getVille = async (req, res) => {
    try {
        const { villeId } = req.params;

        const ville = await Ville.findById(villeId);

        if (!ville) {
            return res.status(404).json({
                status: 'error',
                message: 'Ville non trouvée'
            });
        }

        res.status(200).json({
            status: 'success',
            data: ville
        });

    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Recherche de villes (autocomplétion)
exports.searchVilles = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({
                status: 'error',
                message: 'Le paramètre de recherche est requis'
            });
        }

        const villes = await Ville.find({
            nom: { $regex: q, $options: 'i' },
            active: true
        }).limit(10);

        res.status(200).json({
            status: 'success',
            data: villes
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Trouver la ville la plus proche
exports.getVilleProche = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({
                status: 'error',
                message: 'Latitude et longitude requises'
            });
        }

        const villes = await Ville.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    distanceField: "distance",
                    spherical: true,
                    maxDistance: 50000 // 50km
                }
            },
            { $limit: 5 }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                villePlusProche: villes[0],
                villesProches: villes.slice(1)
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
}; 