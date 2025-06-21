const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Ensure this path is correct for your project
const Child = require('../models/Child'); // Ensure this path is correct for your project

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Check if Authorization header exists and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // No token, or not a Bearer token, so proceed without attaching user/child
  }

  const token = authHeader.split(' ')[1];

  // 2. Ensure JWT_SECRET is defined in environment variables
  if (!process.env.JWT_SECRET) {
    console.error('❌ AUTH ERROR: JWT_SECRET is not defined in environment variables. Cannot verify token.');
    // In a production app, you might want to respond with a 500 error here
    // or log an alert, as this indicates a critical server misconfiguration.
    return next(); // Proceed without user/child, but log the critical error
  }

  try {
    // 3. Verify the token
    // Assuming your JWT payload has 'id' and 'role' properties directly at the root.
    // Example: { id: '...', role: 'PARENT', iat: ..., exp: ... }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach user or child based on role
    if (decoded.role === 'PARENT') {
      // Find the user by ID and exclude the password field for security
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user; // Attach the authenticated user object to the request
      } else {
        console.log(`⚠️ AUTH WARNING: Parent user with ID ${decoded.id} not found in DB after token verification.`);
      }
    } else if (decoded.role === 'CHILD') {
      // Find the child by ID
      const child = await Child.findById(decoded.id);
      if (child) {
        req.child = child; // Attach the authenticated child object to the request
      } else {
        console.log(`⚠️ AUTH WARNING: Child with ID ${decoded.id} not found in DB after token verification.`);
      }
    } else {
      console.log(`⚠️ AUTH WARNING: Unknown role '${decoded.role}' found in JWT for ID ${decoded.id}.`);
    }
  } catch (err) {
    // This catch block handles errors from jwt.verify (e.g., token expired, invalid signature, malformed token)
    console.log('❌ JWT VERIFICATION FAILED:', err.message);
    // Note: If the token is invalid/expired, `req.user`/`req.child` will simply not be set.
    // Your subsequent route handlers can then check for `req.user` or `req.child`
    // to determine if authentication is required for that specific route.
  }

  // Always call next() to pass control to the next middleware or route handler,
  // whether authentication was successful or not. This middleware only *attempts* to authenticate.
  next();
};

module.exports = authMiddleware;