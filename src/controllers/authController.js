const authService = require('../services/authService');
const jwtService = require('../services/jwtService');
const Client = require('../models/Client');
const Chauffeur = require('../models/Chauffeur');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.sendOTP = async (req, res) => {
  try {
    const { telephone } = req.body;

    if (!telephone) {
      return res.status(400).json({
        status: 'error',
        message: 'Le numéro de téléphone est requis'
      });
    }

    // Validation du format du numéro de téléphone (Tunisie et France)
    const tunisieRegex = /^\+216[0-9]{8}$/;
    const franceRegex = /^\+33[1-9][0-9]{8}$/;
    
    if (!tunisieRegex.test(telephone) && !franceRegex.test(telephone)) {
      return res.status(400).json({
        status: 'error',
        message: 'Format de numéro invalide. Utilisez le format : +216XXXXXXXX (Tunisie) ou +33XXXXXXXXX (France)'
      });
    }

    const sent = await authService.sendOTP(telephone);

    if (!sent) {
      return res.status(500).json({
        status: 'error',
        message: 'Erreur lors de l\'envoi du code'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Code envoyé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { telephone, code } = req.body;

    if (!telephone || !code) {
      return res.status(400).json({
        status: 'error',
        message: 'Le numéro de téléphone et le code sont requis'
      });
    }

    // Validation du format du numéro de téléphone tunisien
    const phoneRegex = /^\+216[0-9]{8}$/;
    if (!phoneRegex.test(telephone)) {
      return res.status(400).json({
        status: 'error',
        message: 'Format de numéro invalide. Utilisez le format : +216XXXXXXXX'
      });
    }

    // Validation du format du code (6 chiffres)
    const codeRegex = /^[0-9]{6}$/;
    if (!codeRegex.test(code)) {
      return res.status(400).json({
        status: 'error',
        message: 'Le code doit contenir exactement 6 chiffres'
      });
    }

    const isValid = await authService.verifyOTP(telephone, code);

    if (!isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Code invalide ou expiré'
      });
    }

    // Chercher l'utilisateur (client ou chauffeur)
    let user = await Client.findOne({ telephone });
    let role = 'client';
    
    if (!user) {
      user = await Chauffeur.findOne({ telephone });
      role = 'chauffeur';
    }
    
    // Pour un chauffeur, créer le token avec _id
    const token = jwt.sign(
      { 
        _id: user._id,
        role: 'chauffeur'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      status: 'success',
      message: 'Authentification réussie',
      data: {
        token,
        user: {
          id: user._id,
          role,
          telephone: user.telephone,
          nom: user.nom,
          prenom: user.prenom
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.registerAdmin = async (req, res) => {
    try {
        const { nom, prenom, email, telephone, password, codeSecret } = req.body;

        // Ajouter ces logs
        console.log('Code secret reçu:', codeSecret);
        console.log('Code secret attendu:', process.env.ADMIN_SECRET_CODE);
        console.log('Sont-ils égaux?', codeSecret === process.env.ADMIN_SECRET_CODE);

        if (codeSecret !== process.env.ADMIN_SECRET_CODE) {
            return res.status(401).json({
                status: 'error',
                message: 'Code secret invalide'
            });
        }

        // Vérifier si l'admin existe déjà
        const adminExist = await Admin.findOne({
            $or: [
                { email: email.toLowerCase() },
                { telephone }
            ]
        });

        if (adminExist) {
            return res.status(400).json({
                status: 'error',
                message: 'Un admin avec cet email ou ce numéro existe déjà'
            });
        }

        // Créer l'admin
        const admin = await Admin.create({
            nom,
            prenom,
            email: email.toLowerCase(),
            telephone,
            password
        });

        // Générer le token
        const token = jwt.sign(
            { userId: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            status: 'success',
            message: 'Admin créé avec succès',
            data: {
                admin: {
                    id: admin._id,
                    nom: admin.nom,
                    prenom: admin.prenom,
                    email: admin.email,
                    role: admin.role
                },
                token
            }
        });

    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
}; 