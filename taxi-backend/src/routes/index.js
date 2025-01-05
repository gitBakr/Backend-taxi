const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const villeRoutes = require('./villeRoutes');

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/villes', villeRoutes);

module.exports = router; 