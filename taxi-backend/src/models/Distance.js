const distanceSchema = new mongoose.Schema({
    villeDepart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ville',
        required: true
    },
    villeArrivee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ville',
        required: true
    },
    distance: {
        route: Number,      // Distance par route
        vol: Number,        // Distance à vol d'oiseau
        temps: Number       // Temps moyen en minutes
    },
    metadata: {
        lastUpdated: Date,
        source: String      // 'google', 'manual', 'calculated'
    }
}); 