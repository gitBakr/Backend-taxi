const PRIX_BASE_KM = 0.8;        // Prix de base par km
const PRIX_MIN = 15;             // Prix minimum
const FRAIS_SERVICE = 2;         // Frais de service fixe
const MAJORATION_NUIT = 1.3;     // +30% la nuit
const MAJORATION_WEEKEND = 1.2;   // +20% le weekend

function calculerPrix(distance, options = {}) {
    try {
        // Prix de base selon la distance
        let prixBase = Math.max(
            distance * PRIX_BASE_KM,
            PRIX_MIN
        );

        // Facteurs de majoration
        const facteurs = {
            // Distance
            courteDistance: distance < 30 ? 1.2 : 1,    // +20% pour courtes distances
            longueDistance: distance > 100 ? 0.9 : 1,   // -10% pour longues distances

            // Période
            nuit: options.isNuit ? MAJORATION_NUIT : 1,
            weekend: options.isWeekend ? MAJORATION_WEEKEND : 1,

            // Demande
            heurePointe: options.isHeurePointe ? 1.15 : 1,  // +15% en heure de pointe
            saisonHaute: options.isSaisonHaute ? 1.2 : 1    // +20% en haute saison
        };

        // Appliquer les facteurs
        const facteurTotal = Object.values(facteurs).reduce((acc, val) => acc * val, 1);
        prixBase = prixBase * facteurTotal;

        // Arrondir au dinar supérieur
        prixBase = Math.ceil(prixBase);

        // Calculer les composantes du prix
        const detail = {
            prixBase: prixBase,
            fraisService: FRAIS_SERVICE,
            total: prixBase + FRAIS_SERVICE,
            facteurs: facteurs,
            parKm: (prixBase / distance).toFixed(2)
        };

        return detail;

    } catch (error) {
        console.error('Erreur calcul prix:', error);
        throw new Error('Erreur lors du calcul du prix');
    }
}

// Exemple d'utilisation
const exemples = {
    // Djerba - Zarzis (45km)
    djerba_zarzis: calculerPrix(45, {
        isNuit: false,
        isWeekend: false,
        isHeurePointe: false
    }),

    // Djerba - Tataouine (90km)
    djerba_tataouine: calculerPrix(90, {
        isNuit: false,
        isWeekend: true,
        isSaisonHaute: true
    })
};

module.exports = {
    calculerPrix,
    exemples
}; 