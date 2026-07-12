const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User context not found. Access denied.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role "${req.user.role}" does not have privileges to execute this operation.` 
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
