exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        status: 'error',
        message: 'Accès non autorisé'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'avez pas les droits nécessaires'
      });
    }

    next();
  };
}; 