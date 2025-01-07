const DistanceService = require('./distanceService');

class PrixService {
    constructor() {
        // Configuration des prix et majorations
        this.PRIX_BASE_KM = 0.8;
        this.PRIX_MIN = 15;
        this.FRAIS_SERVICE = 2;
        this.MAJORATIONS = {
            CLIMATISATION: 1.1,
            NUIT: 1.3,
            WEEKEND: 1.2,
            HEURE_POINTE: 1.15
        };
    }

    async calculerPrix(villeDepart, villeArrivee, options = {}) {
        try {
            // 1. Validation des données d'entrée
            this.validerDonnees(villeDepart, villeArrivee, options);

            // 2. Calcul de la distance et durée
            const distanceInfo = await DistanceService.getDistance(
                villeDepart.coordinates,
                villeArrivee.coordinates
            );

            // 3. Calcul du prix de base
            const prixBase = Math.max(
                this.PRIX_MIN,
                Math.round(distanceInfo.distance * this.PRIX_BASE_KM)
            );

            // 4. Application des majorations
            const majorations = this.calculerMajorations(options);
            const prixFinal = Math.round(prixBase * majorations.coefficient);

            // 5. Construction de la réponse détaillée
            return {
                status: 'success',
                data: {
                    prixBase,
                    fraisService: this.FRAIS_SERVICE,
                    total: prixFinal + this.FRAIS_SERVICE,
                    detail: {
                        distance: Math.round(distanceInfo.distance),
                        duree: Math.round(distanceInfo.duration),
                        trajet: {
                            depart: villeDepart.nom,
                            arrivee: villeArrivee.nom,
                            coordinates: {
                                depart: villeDepart.coordinates,
                                arrivee: villeArrivee.coordinates
                            }
                        },
                        majorations: majorations.detail,
                        options: this.formaterOptions(options)
                    }
                }
            };
        } catch (error) {
            throw new Error(`Erreur calcul prix: ${error.message}`);
        }
    }

    validerDonnees(villeDepart, villeArrivee, options) {
        if (!villeDepart?.coordinates?.lat || !villeDepart?.coordinates?.lng) {
            throw new Error('Coordonnées de départ invalides');
        }
        if (!villeArrivee?.coordinates?.lat || !villeArrivee?.coordinates?.lng) {
            throw new Error('Coordonnées d\'arrivée invalides');
        }
        if (options.passagers && (options.passagers < 1 || options.passagers > 4)) {
            throw new Error('Nombre de passagers invalide (1-4)');
        }
    }

    calculerMajorations(options) {
        let coefficient = 1;
        const detail = {};

        // Options de confort
        if (options.climatisation) {
            coefficient *= this.MAJORATIONS.CLIMATISATION;
            detail.climatisation = this.MAJORATIONS.CLIMATISATION;
        }

        // Majorations temporelles
        if (options.date) {
            const date = new Date(options.date);
            
            if (this.isNuit(date)) {
                coefficient *= this.MAJORATIONS.NUIT;
                detail.nuit = this.MAJORATIONS.NUIT;
            }

            if (this.isWeekend(date)) {
                coefficient *= this.MAJORATIONS.WEEKEND;
                detail.weekend = this.MAJORATIONS.WEEKEND;
            }

            if (this.isHeurePointe(date)) {
                coefficient *= this.MAJORATIONS.HEURE_POINTE;
                detail.heurePointe = this.MAJORATIONS.HEURE_POINTE;
            }
        }

        return { coefficient, detail };
    }

    isNuit(date) {
        const hours = date.getHours();
        return hours >= 22 || hours <= 5;
    }

    isWeekend(date) {
        const day = date.getDay();
        return day === 0 || day === 6;
    }

    isHeurePointe(date) {
        const hours = date.getHours();
        return (hours >= 7 && hours <= 9) || (hours >= 16 && hours <= 19);
    }

    formaterOptions(options) {
        return {
            passagers: parseInt(options.passagers) || 1,
            climatisation: !!options.climatisation,
            date: options.date ? new Date(options.date).toISOString() : new Date().toISOString()
        };
    }
}

module.exports = new PrixService(); 