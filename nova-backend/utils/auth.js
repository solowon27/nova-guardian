const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Child = require('../models/Child');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'PARENT') {
      req.user = await User.findById(decoded.id);
    } else if (decoded.role === 'CHILD') {
      req.child = await Child.findById(decoded.id);
    }
  } catch (err) {
    console.log('❌ JWT error:', err.message);
  }

  next();
};

module.exports = authMiddleware;
