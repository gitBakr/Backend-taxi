const DistanceService = require('./distanceService');

class PrixService {
    constructor() {
        this.prixParKm = 1.2;  // Prix de base par km
        this.prixMinimum = 10;  // Prix minimum
    }

    async calculerPrix(villeDepart, villeArrivee, options = {}) {
        try {
            // Validation des coordonnées
            DistanceService.validateCoordinates(villeDepart.coordinates);
            DistanceService.validateCoordinates(villeArrivee.coordinates);

            // Calculer la distance
            const distance = DistanceService.calculerDistance(
                villeDepart.coordinates,
                villeArrivee.coordinates
            );

            // Prix de base
            let prix = Math.max(
                this.prixMinimum,
                distance * this.prixParKm
            );

            // Ajustements selon les options
            if (options.passagers > 4) {
                prix *= 1.5;  // Supplément pour plus de 4 passagers
            }

            if (options.climatisation) {
                prix += 5;  // Supplément climatisation
            }

            // Arrondir à 2 décimales
            prix = Math.round(prix * 100) / 100;

            return {
                montant: prix,
                details: {
                    distance,
                    prixBase: this.prixParKm,
                    supplements: {
                        passagers: options.passagers > 4 ? 'x1.5' : 'x1',
                        climatisation: options.climatisation ? '+5' : '0'
                    },
                    duree: Math.round(distance * 1.2)  // Estimation en minutes
                }
            };

        } catch (error) {
            console.error('Erreur calcul prix:', error);
            throw new Error(`Erreur calcul prix: ${error.message}`);
        }
    }
}

module.exports = new PrixService(); 