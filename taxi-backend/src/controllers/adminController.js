const Chauffeur = require('../models/Chauffeur');
const Client = require('../models/Client');
const Reservation = require('../models/Reservation');
const Paiement = require('../models/Paiement');
const Admin = require('../models/Admin');

exports.getDashboardStats = async (req, res) => {
    try {
        // Statistiques générales
        const stats = {
            // Stats Chauffeurs
            chauffeurs: {
                total: await Chauffeur.countDocuments(),
                actifs: await Chauffeur.countDocuments({ disponible: true }),
                enAttente: await Chauffeur.countDocuments({ statut: 'en_attente' }),
                bloques: await Chauffeur.countDocuments({ statut: 'bloque' }),
                nouveauxCeMois: await Chauffeur.countDocuments({
                    createdAt: { 
                        $gte: new Date(new Date().setDate(1)) // Depuis le début du mois
                    }
                })
            },

            // Stats Courses
            courses: {
                total: await Reservation.countDocuments(),
                aujourdhui: await Reservation.countDocuments({
                    dateReservation: {
                        $gte: new Date(new Date().setHours(0,0,0,0))
                    }
                }),
                enCours: await Reservation.countDocuments({ statut: 'en_cours' }),
                terminees: await Reservation.countDocuments({ statut: 'terminee' }),
                annulees: await Reservation.countDocuments({ statut: 'annulee' })
            },

            // Stats Financières
            finances: {
                chiffreAffaires: await Paiement.aggregate([
                    { $match: { statut: 'succès' } },
                    { $group: { 
                        _id: null, 
                        total: { $sum: '$montant' },
                        moisCourant: {
                            $sum: {
                                $cond: [
                                    { $gte: ['$datePaiement', new Date(new Date().setDate(1))] },
                                    '$montant',
                                    0
                                ]
                            }
                        }
                    }}
                ]),
                paiementsEnAttente: await Paiement.countDocuments({ statut: 'en_attente' }),
                litiges: await Paiement.countDocuments({ statut: 'litige' })
            },

            // Stats Clients
            clients: {
                total: await Client.countDocuments(),
                actifs: await Client.countDocuments({ 
                    derniereCourse: { 
                        $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) 
                    }
                }),
                nouveauxCeMois: await Client.countDocuments({
                    createdAt: { 
                        $gte: new Date(new Date().setDate(1))
                    }
                })
            }
        };

        res.status(200).json({
            status: 'success',
            data: stats
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Gestion des chauffeurs
exports.getChauffeurs = async (req, res) => {
    try {
        const chauffeurs = await Chauffeur.find()
            .select('nom prenom telephone email vehicule disponible note')
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            data: chauffeurs
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Gestion des réservations
exports.getReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find()
            .populate('client', 'nom prenom telephone')
            .populate('chauffeur', 'nom prenom telephone')
            .sort('-dateReservation');

        res.status(200).json({
            status: 'success',
            data: reservations
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Gestion des paiements
exports.getPaiements = async (req, res) => {
    try {
        const paiements = await Paiement.find()
            .populate('reservation')
            .sort('-datePaiement');

        res.status(200).json({
            status: 'success',
            data: paiements
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Actions rapides pour les chauffeurs
exports.bloquerChauffeur = async (req, res) => {
    try {
        const { id } = req.params;
        const { raison } = req.body;

        const chauffeur = await Chauffeur.findById(id);
        
        if (!chauffeur) {
            return res.status(404).json({
                status: 'error',
                message: 'Chauffeur non trouvé'
            });
        }

        // Mettre à jour le statut et ajouter la raison
        chauffeur.statut = 'bloque';
        chauffeur.disponible = false;
        chauffeur.raisonBlocage = raison;
        chauffeur.dateBlocage = new Date();
        chauffeur.bloqueePar = req.user._id;

        await chauffeur.save();

        // Annuler les réservations en cours
        await Reservation.updateMany(
            { 
                chauffeur: id,
                statut: 'en_cours'
            },
            {
                statut: 'annulee',
                raisonAnnulation: 'Chauffeur bloqué par administration',
                dateAnnulation: new Date()
            }
        );

        // Envoyer notification au chauffeur
        // TODO: Implémenter la notification

        res.status(200).json({
            status: 'success',
            message: 'Chauffeur bloqué avec succès',
            data: chauffeur
        });

    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.debloquerChauffeur = async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;

        const chauffeur = await Chauffeur.findById(id);
        
        if (!chauffeur) {
            return res.status(404).json({
                status: 'error',
                message: 'Chauffeur non trouvé'
            });
        }

        // Vérifier si le chauffeur est bien bloqué
        if (chauffeur.statut !== 'bloque') {
            return res.status(400).json({
                status: 'error',
                message: 'Ce chauffeur n\'est pas bloqué'
            });
        }

        // Mettre à jour le statut
        chauffeur.statut = 'actif';
        chauffeur.disponible = true;
        chauffeur.raisonBlocage = null;
        chauffeur.dateBlocage = null;
        chauffeur.noteDeblocage = note;
        chauffeur.dateDeblocage = new Date();
        chauffeur.debloquePar = req.user._id;

        await chauffeur.save();

        // Envoyer notification au chauffeur
        // TODO: Implémenter la notification

        res.status(200).json({
            status: 'success',
            message: 'Chauffeur débloqué avec succès',
            data: chauffeur
        });

    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Actions rapides pour les courses
exports.annulerCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { raison } = req.body;

        const reservation = await Reservation.findById(id)
            .populate('client', 'nom prenom telephone')
            .populate('chauffeur', 'nom prenom telephone');

        if (!reservation) {
            return res.status(404).json({
                status: 'error',
                message: 'Réservation non trouvée'
            });
        }

        // Vérifier si la course peut être annulée
        if (!['en_attente', 'en_cours'].includes(reservation.statut)) {
            return res.status(400).json({
                status: 'error',
                message: 'Cette course ne peut plus être annulée'
            });
        }

        // Mettre à jour le statut
        reservation.statut = 'annulee';
        reservation.raisonAnnulation = raison;
        reservation.dateAnnulation = new Date();
        reservation.annuleePar = {
            type: 'admin',
            id: req.user._id
        };

        await reservation.save();

        // Si un paiement est en cours, le rembourser
        const paiement = await Paiement.findOne({ 
            reservation: id,
            statut: { $in: ['en_attente', 'succès'] }
        });

        if (paiement) {
            // Initier le remboursement via Stripe
            const remboursement = await stripe.refunds.create({
                payment_intent: paiement.stripePaymentId,
                reason: 'requested_by_customer'
            });

            // Enregistrer le remboursement
            paiement.statut = 'rembourse';
            paiement.remboursement = {
                id: remboursement.id,
                date: new Date(),
                montant: paiement.montant,
                raison: raison
            };
            await paiement.save();
        }

        // Notifications
        // TODO: Notifier le client
        // TODO: Notifier le chauffeur

        res.status(200).json({
            status: 'success',
            message: 'Course annulée avec succès',
            data: {
                reservation,
                remboursement: paiement ? paiement.remboursement : null
            }
        });

    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Obtenir les détails d'une course
exports.getDetailsCourse = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('ID recherché:', id); // Debug

        const reservation = await Reservation.findById(id)
            .populate({
                path: 'client',
                select: 'nom prenom telephone email'
            })
            .populate({
                path: 'chauffeur',
                select: 'nom prenom telephone vehicule'
            });

        if (!reservation) {
            console.log('Réservation non trouvée pour ID:', id); // Debug
            return res.status(404).json({
                status: 'error',
                message: 'Réservation non trouvée'
            });
        }

        // Debug
        console.log('Réservation trouvée:', {
            id: reservation._id,
            client: reservation.client,
            chauffeur: reservation.chauffeur,
            statut: reservation.statut
        });

        res.status(200).json({
            status: 'success',
            data: reservation
        });

    } catch (error) {
        console.error('Erreur détails course:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Ajouter cette fonction pour vérifier
exports.getAdminInfo = async (req, res) => {
    try {
        const admin = await Admin.findById('677a72a682a27d32ecabb07f');
        console.log('Admin trouvé:', admin);
        
        res.status(200).json({
            status: 'success',
            data: {
                id: admin._id,
                nom: admin.nom,
                prenom: admin.prenom,
                email: admin.email,
                role: admin.role,
                dateCreation: admin.dateCreation
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
}; 