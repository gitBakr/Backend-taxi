const DistanceService = require('./distanceService');

class PrixService {
    constructor() {
        this.prixParKm = 1.2;  // Prix de base par km
        this.prixMinimum = 10;  // Prix minimum
    }

    async calculerPrix(villeDepart, villeArrivee, options = {}) {
        try {
            // Validation des coordonnées
            if (!villeDepart?.coordinates || !villeArrivee?.coordinates) {
                throw new Error('Coordonnées invalides');
            }

            // Calculer la distance
            const distance = DistanceService.calculerDistance(
                villeDepart.coordinates,
                villeArrivee.coordinates
            );

            // Prix de base et calculs
            const prixBase = this.prixParKm;
            let montant = Math.max(this.prixMinimum, distance * prixBase);

            // Structure de réponse exacte pour le frontend
            const response = {
                status: 'success',
                data: {
                    montant: montant,
                    details: {
                        prixBase: prixBase,
                        distance: distance,
                        supplements: {
                            passagers: 'x1',
                            climatisation: '0'
                        },
                        duree: Math.round(distance * 1.2)
                    }
                }
            };

            // Appliquer les suppléments après
            if (options.passagers > 4) {
                montant *= 1.5;
                response.data.details.supplements.passagers = 'x1.5';
            }
            if (options.climatisation) {
                montant += 5;
                response.data.details.supplements.climatisation = '+5';
            }

            // Mettre à jour le montant final
            response.data.montant = Math.round(montant * 100) / 100;

            console.log('✅ Réponse prix:', response);
            return response;

        } catch (error) {
            console.error('❌ Erreur calcul prix:', error);
            throw new Error(`Erreur calcul prix: ${error.message}`);
        }
    }
}

module.exports = new PrixService(); 