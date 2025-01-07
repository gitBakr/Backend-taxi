const Chauffeur = require('../models/Chauffeur');
const Tarif = require('../models/Tarif');
const Ville = require('../models/Ville');

// Créer un nouveau chauffeur
exports.createChauffeur = async (req, res) => {
  try {
    const { email, telephone } = req.body;

    // Vérifier si le chauffeur existe déjà
    const chauffeurExist = await Chauffeur.findOne({
      $or: [
        { email: email?.toLowerCase() },
        { telephone }
      ]
    });

    if (chauffeurExist) {
      return res.status(400).json({
        status: 'error',
        message: 'Un chauffeur avec cet email ou ce numéro existe déjà'
      });
    }

    const chauffeur = await Chauffeur.create(req.body);
    
    res.status(201).json({
      status: 'success',
      message: 'Chauffeur créé avec succès',
      data: chauffeur
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Obtenir tous les chauffeurs avec filtres
exports.getAllChauffeurs = async (req, res) => {
  try {
    const {
      disponible,
      ville,
      prixMin,
      prixMax,
      marqueVehicule,
      page = 1,
      limit = 10,
      sort = 'nom'
    } = req.query;

    let query = {};
    
    // Filtre par disponibilité
    if (disponible !== undefined) {
      query.disponible = disponible === 'true';
    }

    // Filtre par ville
    if (ville) {
      query['tarifs.villeDepart'] = ville;
    }

    // Filtre par marque de véhicule
    if (marqueVehicule) {
      query['vehicule.marque'] = new RegExp(marqueVehicule, 'i');
    }

    // Filtre par prix
    if (prixMin || prixMax) {
      query['tarifs.prix'] = {};
      if (prixMin) query['tarifs.prix'].$gte = parseInt(prixMin);
      if (prixMax) query['tarifs.prix'].$lte = parseInt(prixMax);
    }

    const skip = (page - 1) * limit;
    
    const chauffeurs = await Chauffeur.find(query)
      .select('-__v')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Chauffeur.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: chauffeurs.length,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      },
      data: chauffeurs
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Obtenir un chauffeur par ID
exports.getChauffeur = async (req, res) => {
  try {
    const chauffeur = await Chauffeur.findById(req.params.id);
    
    if (!chauffeur) {
      return res.status(404).json({
        status: 'error',
        message: 'Chauffeur non trouvé'
      });
    }

    res.status(200).json({
      status: 'success',
      data: chauffeur
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Mettre à jour un chauffeur
exports.updateChauffeur = async (req, res) => {
  try {
    const chauffeur = await Chauffeur.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!chauffeur) {
      return res.status(404).json({
        status: 'error',
        message: 'Chauffeur non trouvé'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Chauffeur mis à jour avec succès',
      data: chauffeur
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Supprimer un chauffeur
exports.deleteChauffeur = async (req, res) => {
  try {
    const chauffeur = await Chauffeur.findByIdAndDelete(req.params.id);

    if (!chauffeur) {
      return res.status(404).json({
        status: 'error',
        message: 'Chauffeur non trouvé'
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Le chauffeur ${chauffeur.prenom} ${chauffeur.nom} a été supprimé avec succès`
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Mettre à jour la disponibilité
exports.updateDisponibilite = async (req, res) => {
  try {
    const chauffeur = await Chauffeur.findByIdAndUpdate(
      req.params.id,
      { disponible: req.body.disponible },
      { new: true }
    );

    if (!chauffeur) {
      return res.status(404).json({
        status: 'error',
        message: 'Chauffeur non trouvé'
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Le chauffeur est maintenant ${chauffeur.disponible ? 'disponible' : 'indisponible'}`,
      data: chauffeur
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Obtenir le profil du chauffeur connecté
exports.getProfile = async (req, res) => {
  try {
    const chauffeur = await Chauffeur.findById(req.user.userId);
    
    if (!chauffeur) {
      return res.status(404).json({
        status: 'error',
        message: 'Chauffeur non trouvé'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        id: chauffeur._id,
        nom: chauffeur.nom,
        prenom: chauffeur.prenom,
        email: chauffeur.email,
        telephone: chauffeur.telephone,
        vehicule: chauffeur.vehicule,
        disponible: chauffeur.disponible,
        tarifs: chauffeur.tarifs
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Mettre à jour le profil du chauffeur connecté
exports.updateProfile = async (req, res) => {
  try {
    const chauffeur = await Chauffeur.findByIdAndUpdate(
      req.user.userId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!chauffeur) {
      return res.status(404).json({
        status: 'error',
        message: 'Chauffeur non trouvé'
      });
    }

    res.status(200).json({
      status: 'success',
      data: chauffeur
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Mettre à jour la disponibilité du chauffeur connecté
exports.updateDisponibilite = async (req, res) => {
  try {
    const { disponible } = req.body;

    if (typeof disponible !== 'boolean') {
      return res.status(400).json({
        status: 'error',
        message: 'La disponibilité doit être un booléen (true/false)'
      });
    }

    const chauffeur = await Chauffeur.findByIdAndUpdate(
      req.user.userId,
      { disponible },
      { new: true }
    );

    if (!chauffeur) {
      return res.status(404).json({
        status: 'error',
        message: 'Chauffeur non trouvé'
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Disponibilité mise à jour : ${disponible ? 'disponible' : 'non disponible'}`,
      data: {
        disponible: chauffeur.disponible
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.searchChauffeurs = async (req, res) => {
  try {
    const { q, villeDepart, villeArrivee, prixMax } = req.query;
    let query = {};

    // Recherche par nom ou prénom
    if (q) {
      query.$or = [
        { nom: new RegExp(q, 'i') },
        { prenom: new RegExp(q, 'i') }
      ];
    }

    // Filtre par ville (dans les tarifs)
    if (villeDepart || villeArrivee) {
      query.tarifs = {
        $elemMatch: {}
      };
      if (villeDepart) {
        query.tarifs.$elemMatch.villeDepart = villeDepart;
      }
      if (villeArrivee) {
        query.tarifs.$elemMatch.villeArrivee = villeArrivee;
      }
      if (prixMax) {
        query.tarifs.$elemMatch.prix = { $lte: parseInt(prixMax) };
      }
    }

    const chauffeurs = await Chauffeur.find(query)
      .select('nom prenom vehicule disponible tarifs')
      .sort('nom');

    res.status(200).json({
      status: 'success',
      results: chauffeurs.length,
      data: chauffeurs
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.ajouterTarif = async (req, res) => {
    try {
        const { villeDepart, villeArrivee, prix } = req.body;
        const chauffeurId = req.user.id;

        const nouveauTarif = await Tarif.create({
            chauffeur: chauffeurId,
            villeDepart,
            villeArrivee,
            prix
        });

        res.status(201).json({
            status: 'success',
            data: nouveauTarif
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.getTarifs = async (req, res) => {
    try {
        const tarifs = await Tarif.find({ chauffeur: req.user.id })
                                 .populate('villeDepart villeArrivee');
        
        res.status(200).json({
            status: 'success',
            data: tarifs
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// 1. Ajouter des trajets et tarifs
exports.ajouterTrajets = async (req, res) => {
    try {
        // Ajout de logs pour déboguer
        console.log('User from token:', req.user);

        // Vérifier si on a l'ID du chauffeur
        if (!req.user || !req.user._id) {
            console.log('ID manquant. req.user:', req.user);
            return res.status(401).json({
                status: 'error',
                message: 'Non autorisé - ID chauffeur manquant'
            });
        }

        const chauffeurId = req.user._id;
        const { trajets } = req.body;

        // Log des données reçues
        console.log('Données reçues:', {
            chauffeurId,
            trajets
        });

        // Validation des données
        if (!trajets || !Array.isArray(trajets)) {
            return res.status(400).json({
                status: 'error',
                message: 'Le format des trajets est invalide'
            });
        }

        // Créer les tarifs
        const tarifsSauvegardes = await Promise.all(
            trajets.map(async (trajet) => {
                return await Tarif.create({
                    chauffeur: chauffeurId,
                    villeDepart: trajet.villeDepart,
                    villeArrivee: trajet.villeArrivee,
                    prixBase: trajet.prixBase
                });
            })
        );

        res.status(201).json({
            status: 'success',
            message: 'Trajets ajoutés avec succès',
            data: tarifsSauvegardes
        });

    } catch (error) {
        console.error('Erreur ajout trajets:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// 2. Obtenir mes trajets
exports.getMesTrajets = async (req, res) => {
    try {
        const chauffeurId = req.user._id;

        const trajets = await Tarif.find({ chauffeur: chauffeurId })
            .populate({
                path: 'villeDepart',
                model: 'Ville',
                select: 'nom gouvernorat'
            })
            .populate({
                path: 'villeArrivee',
                model: 'Ville',
                select: 'nom gouvernorat'
            })
            .sort('villeDepart');

        res.status(200).json({
            status: 'success',
            data: trajets
        });

    } catch (error) {
        console.error('Erreur récupération trajets:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// 3. Modifier un tarif
exports.modifierTarif = async (req, res) => {
    try {
        const { tarifId } = req.params;
        const { prixBase } = req.body;
        const chauffeurId = req.user._id;

        console.log('Debug:', {
            tarifId,
            chauffeurId,
            prixBase
        });

        const tarif = await Tarif.findOneAndUpdate(
            { 
                _id: tarifId,
                chauffeur: chauffeurId 
            },
            { prixBase },
            { new: true }
        ).populate('villeDepart villeArrivee');

        if (!tarif) {
            return res.status(404).json({
                status: 'error',
                message: 'Tarif non trouvé'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Tarif mis à jour avec succès',
            data: tarif
        });

    } catch (error) {
        console.error('Erreur modification tarif:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Ajouter une nouvelle méthode pour supprimer un tarif
exports.supprimerTarif = async (req, res) => {
    try {
        const { tarifId } = req.params;
        const chauffeurId = req.user._id;

        const tarif = await Tarif.findOneAndDelete({
            _id: tarifId,
            chauffeur: chauffeurId
        });

        if (!tarif) {
            return res.status(404).json({
                status: 'error',
                message: 'Tarif non trouvé'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Tarif supprimé avec succès'
        });

    } catch (error) {
        console.error('Erreur suppression tarif:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.ajouterMesTrajets = async (req, res) => {
    try {
        const chauffeurId = req.user._id;
        const { trajets } = req.body;

        // Format attendu :
        // trajets: [
        //   { villeDepart: "ID_VILLE", villeArrivee: "ID_VILLE", prixBase: 120 },
        //   { villeDepart: "ID_VILLE", villeArrivee: "ID_VILLE", prixBase: 150 }
        // ]

        // Validation des villes
        for (const trajet of trajets) {
            const [depart, arrivee] = await Promise.all([
                Ville.findById(trajet.villeDepart),
                Ville.findById(trajet.villeArrivee)
            ]);

            if (!depart || !arrivee) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Ville non trouvée'
                });
            }

            if (depart._id.equals(arrivee._id)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'La ville de départ et d\'arrivée doivent être différentes'
                });
            }
        }

        // Créer les trajets
        const nouveauxTrajets = await Tarif.insertMany(
            trajets.map(trajet => ({
                chauffeur: chauffeurId,
                villeDepart: trajet.villeDepart,
                villeArrivee: trajet.villeArrivee,
                prixBase: trajet.prixBase
            }))
        );

        res.status(201).json({
            status: 'success',
            message: `${nouveauxTrajets.length} trajets ajoutés avec succès`,
            data: nouveauxTrajets
        });

    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
}; 