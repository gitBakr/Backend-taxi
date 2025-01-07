const mongoose = require('mongoose');
const Ville = require('../models/Ville');
require('dotenv').config();

const villesTunisie = [
    // RÉGION NORD
    {
        nom: "Tunis",
        gouvernorat: "Tunis",
        region: "Nord",
        codePostal: "1000",
        coordinates: {
            latitude: 36.8065,
            longitude: 10.1815
        }
    },
    {
        nom: "Bizerte",
        gouvernorat: "Bizerte",
        region: "Nord",
        codePostal: "7000",
        coordinates: {
            latitude: 37.2744,
            longitude: 9.8739
        }
    },
    {
        nom: "Béja",
        gouvernorat: "Béja",
        region: "Nord",
        codePostal: "9000",
        coordinates: {
            latitude: 36.7256,
            longitude: 9.1817
        }
    },

    // RÉGION NORD-EST
    {
        nom: "Nabeul",
        gouvernorat: "Nabeul",
        region: "Nord-Est",
        codePostal: "8000",
        coordinates: {
            latitude: 36.4513,
            longitude: 10.7357
        }
    },
    {
        nom: "Hammamet",
        gouvernorat: "Nabeul",
        region: "Nord-Est",
        codePostal: "8050",
        coordinates: {
            latitude: 36.4000,
            longitude: 10.6167
        }
    },

    // RÉGION SAHEL
    {
        nom: "Sousse",
        gouvernorat: "Sousse",
        region: "Sahel",
        codePostal: "4000",
        coordinates: {
            latitude: 35.8333,
            longitude: 10.6333
        }
    },
    {
        nom: "Monastir",
        gouvernorat: "Monastir",
        region: "Sahel",
        codePostal: "5000",
        coordinates: {
            latitude: 35.7780,
            longitude: 10.8262
        }
    },
    {
        nom: "Mahdia",
        gouvernorat: "Mahdia",
        region: "Sahel",
        codePostal: "5100",
        coordinates: {
            latitude: 35.5047,
            longitude: 11.0622
        }
    },

    // RÉGION SUD
    {
        nom: "Sfax",
        gouvernorat: "Sfax",
        region: "Sud",
        codePostal: "3000",
        coordinates: {
            latitude: 34.7400,
            longitude: 10.7600
        }
    },
    {
        nom: "Gabès",
        gouvernorat: "Gabès",
        region: "Sud",
        codePostal: "6000",
        coordinates: {
            latitude: 33.8881,
            longitude: 10.0983
        }
    },
    {
        nom: "Djerba",
        gouvernorat: "Médenine",
        region: "Sud-Est",
        codePostal: "4180",
        coordinates: {
            latitude: 33.8075,
            longitude: 10.8451
        }
    },

    // RÉGION SUD-OUEST
    {
        nom: "Tozeur",
        gouvernorat: "Tozeur",
        region: "Sud-Ouest",
        codePostal: "2200",
        coordinates: {
            latitude: 33.9197,
            longitude: 8.1336
        }
    },
    {
        nom: "Kébili",
        gouvernorat: "Kébili",
        region: "Sud-Ouest",
        codePostal: "4200",
        coordinates: {
            latitude: 33.7050,
            longitude: 8.9650
        }
    },

    // RÉGION CENTRE
    {
        nom: "Kairouan",
        gouvernorat: "Kairouan",
        region: "Centre",
        codePostal: "3100",
        coordinates: {
            latitude: 35.6784,
            longitude: 10.0963
        }
    },
    {
        nom: "Sidi Bouzid",
        gouvernorat: "Sidi Bouzid",
        region: "Centre",
        codePostal: "9100",
        coordinates: {
            latitude: 35.0381,
            longitude: 9.4858
        }
    },

    // RÉGION SUD-EST
    {
        nom: "Médenine",
        gouvernorat: "Médenine",
        region: "Sud-Est",
        codePostal: "4100",
        coordinates: {
            latitude: 33.3547,
            longitude: 10.4914
        }
    },
    {
        nom: "Zarzis",
        gouvernorat: "Médenine",
        region: "Sud-Est",
        codePostal: "4170",
        coordinates: {
            latitude: 33.5042,
            longitude: 11.1122
        }
    },
    {
        nom: "Ben Gardane",
        gouvernorat: "Médenine",
        region: "Sud-Est",
        codePostal: "4160",
        coordinates: {
            latitude: 33.1389,
            longitude: 11.2167
        }
    },
    {
        nom: "Tataouine",
        gouvernorat: "Tataouine",
        region: "Sud-Est",
        codePostal: "3200",
        coordinates: {
            latitude: 32.9297,
            longitude: 10.4518
        }
    }
    // ... autres villes
];

async function seedVilles() {
    try {
        // 1. Connexion à MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connecté à MongoDB');

        // 2. Nettoyage de la collection
        await Ville.deleteMany({});
        console.log('🗑️  Collection Villes nettoyée');

        // 3. Insertion des nouvelles villes
        const villes = await Ville.insertMany(villesTunisie);
        
        // 4. Affichage groupé par région
        console.log('\n📍 Villes ajoutées par région :');
        
        // Grouper les villes par région
        const villesParRegion = villes.reduce((acc, ville) => {
            if (!acc[ville.region]) {
                acc[ville.region] = [];
            }
            acc[ville.region].push(ville);
            return acc;
        }, {});

        // Afficher par région
        Object.keys(villesParRegion).sort().forEach(region => {
            console.log(`\n🔹 RÉGION ${region.toUpperCase()} :`);
            villesParRegion[region].forEach(ville => {
                console.log(`  - ${ville.nom} (${ville.gouvernorat})`);
                console.log(`    CP: ${ville.codePostal} | ID: ${ville._id}`);
            });
        });

        // 5. Fermeture de la connexion
        await mongoose.connection.close();
        console.log('\n👋 Déconnecté de MongoDB');

    } catch (error) {
        console.error('\n❌ Erreur:', error);
        if (mongoose.connection) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

// Exécution du script
seedVilles(); 