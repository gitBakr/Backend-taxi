class TarifService {
    async calculerPrix(villeDepart, villeArrivee, options = {}) {
        const {
            date = new Date(),
            passagers = 1,
            bagages = 0,
            climatisation = false
        } = options;

        // Prix de base
        const tarifBase = await this.getTarifBase(villeDepart, villeArrivee);
        
        // Facteurs multiplicateurs
        let prix = tarifBase;
        
        // Heure de pointe ?
        if (this.isHeurePointe(date)) {
            prix *= tarifBase.multiplicateurs.heurePointe;
        }
        
        // Weekend ?
        if (this.isWeekend(date)) {
            prix *= tarifBase.multiplicateurs.weekend;
        }
        
        // Nuit ?
        if (this.isNuit(date)) {
            prix *= tarifBase.multiplicateurs.nuit;
        }

        // Extras
        prix += this.calculateExtras(passagers, bagages, climatisation);

        return Math.round(prix);
    }
} 