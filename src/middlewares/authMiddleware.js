const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.authenticateToken = async (req, res, next) => {
    try {
        // Vérifier le header Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Token manquant'
            });
        }

        // Vérifier et décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Vérifier si c'est un admin
        if (decoded.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Accès non autorisé'
            });
        }

        // Ajouter l'utilisateur à la requête
        req.user = decoded;
        next();

    } catch (error) {
        return res.status(401).json({
            status: 'error',
            message: 'Token invalide'
        });
    }
};

exports.isAdmin = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.user.userId);
        
        if (!admin || !admin.active) {
            return res.status(403).json({
                status: 'error',
                message: 'Accès non autorisé'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}; 