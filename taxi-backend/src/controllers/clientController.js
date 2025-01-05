const Client = require('../models/Client');

// Créer un nouveau client
exports.createClient = async (req, res) => {
  try {
    const { email, telephone } = req.body;

    // Vérifier si le client existe déjà
    const clientExist = await Client.findOne({
      $or: [
        { email: email?.toLowerCase() },
        { telephone }
      ]
    });

    if (clientExist) {
      return res.status(400).json({
        status: 'error',
        message: 'Un client avec cet email ou ce numéro existe déjà'
      });
    }

    const client = await Client.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: client
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Obtenir un client par ID
exports.getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        status: 'error',
        message: 'Client non trouvé'
      });
    }

    res.status(200).json({
      status: 'success',
      data: client
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Mettre à jour un client
exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({
        status: 'error',
        message: 'Client non trouvé'
      });
    }

    res.status(200).json({
      status: 'success',
      data: client
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Supprimer un client
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) {
      return res.status(404).json({
        status: 'error',
        message: 'Client non trouvé'
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Le client ${client.prenom} ${client.nom} a été supprimé avec succès`
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Obtenir tous les clients (avec pagination)
exports.getAllClients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const clients = await Client.find()
      .skip(skip)
      .limit(limit);

    const total = await Client.countDocuments();

    res.status(200).json({
      status: 'success',
      results: clients.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: clients
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const client = await Client.findById(req.user.userId);
    
    if (!client) {
      return res.status(404).json({
        status: 'error',
        message: 'Client non trouvé'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        id: client._id,
        nom: client.nom,
        prenom: client.prenom,
        email: client.email,
        telephone: client.telephone
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.user.userId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({
        status: 'error',
        message: 'Client non trouvé'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        id: client._id,
        nom: client.nom,
        prenom: client.prenom,
        email: client.email,
        telephone: client.telephone
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}; 