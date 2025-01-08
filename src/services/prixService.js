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

            // Prix de base
            let montant = Math.max(this.prixMinimum, distance * this.prixParKm);

            // Appliquer les suppléments
            const supplements = {
                passagers: 'x1',
                climatisation: '0'
            };

            if (options.passagers > 4) {
                montant *= 1.5;
                supplements.passagers = 'x1.5';
            }
            
            if (options.climatisation) {
                montant += 5;
                supplements.climatisation = '+5';
            }

            // Arrondir à 2 décimales
            montant = Math.round(montant * 100) / 100;

            // Log pour debug
            console.log('Calcul prix:', {
                distance,
                montantBase: distance * this.prixParKm,
                supplements,
                montantFinal: montant
            });

            return {
                status: 'success',
                data: {
                    montant: montant,
                    details: {
                        prixBase: this.prixParKm,
                        distance: distance,
                        supplements: supplements,
                        duree: Math.round(distance * 1.2), // minutes
                        villeDepart: villeDepart.nom,
                        villeArrivee: villeArrivee.nom
                    }
                }
            };

        } catch (error) {
            console.error('❌ Erreur calcul prix:', error);
            throw new Error(`Erreur calcul prix: ${error.message}`);
        }
    }
}

module.exports = new PrixService(); 