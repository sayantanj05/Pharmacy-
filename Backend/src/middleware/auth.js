const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { resolveShopId, resolveShopFilter } = require('../utils/shopScope');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        res.status(401);
        return next(new Error('Not authorized, user no longer exists'));
      }
      return next();
    } catch (error) {
      res.status(401);
      return next(new Error('Not authorized, token failed'));
    }
  }
  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token'));
  }
};

/**
 * Resolves the acting user's shop into the ObjectId used by every domain model and
 * exposes it as `req.shopId`. Also resolves an explicit `?shopId=` filter (super admin
 * picking a shop) into `req.shopFilter`.
 *
 * Must run after `protect`.
 */
const shopScope = async (req, res, next) => {
  try {
    if (!req.user) return next();

    req.shopId = await resolveShopId(req.user.shopId);

    if (req.query && req.query.shopId) {
      req.shopFilter = await resolveShopFilter(req.query.shopId);
    } else if (req.user.role === 'super_admin' && req.body && req.body.shopId) {
      req.shopFilter = await resolveShopFilter(req.body.shopId);
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`User role ${req.user.role} is not authorized to access this route`));
    }
    return next();
  };
};

module.exports = { protect, authorize, shopScope };