// ============================================================
// roleMiddleware.js
// Handles role-based access control (RBAC) for all routes
//
// USAGE:
//   const { isAdmin, isCustomer, isOwnerOrAdmin } = require('../middleware/roleMiddleware');
//
//   router.get('/admin/users',   auth, isAdmin,    ...)  // Admin only
//   router.get('/my-bookings',   auth, isCustomer, ...)  // Customer only
//   router.delete('/booking/:id',auth, isOwnerOrAdmin, ...) // Owner or Admin
// ============================================================


// ── ROLE: Admin Only ─────────────────────────────────────────
/**
 * Allows only users with accountType === 'admin'
 * Used for: admin dashboard, managing users, services, bookings
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.accountType !== 'admin') {
    console.warn(`[ROLE BLOCKED] User ${req.user.id} (${req.user.accountType}) tried to access admin route`);
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }

  next();
};


// ── ROLE: Customer Only ──────────────────────────────────────
/**
 * Allows only users with accountType === 'customer'
 * Used for: creating bookings, viewing own bookings
 */
const isCustomer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.accountType !== 'customer') {
    return res.status(403).json({ message: 'Access denied. Customer account required.' });
  }

  next();
};


// ── ROLE: Admin OR Customer (any logged-in user) ─────────────
/**
 * Allows any authenticated user regardless of role
 * Used for: viewing services, updating own profile
 */
const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  next();
};


// ── ROLE: Owner OR Admin ─────────────────────────────────────
/**
 * Allows the resource owner OR any admin
 * Requires req.resourceOwnerId to be set in the route before calling this
 *
 * Usage in route:
 *   router.delete('/:id', auth, async (req, res, next) => {
 *     const booking = await Booking.findById(req.params.id);
 *     req.resourceOwnerId = booking.user.toString();  // ← set owner ID
 *     next();
 *   }, isOwnerOrAdmin, ...)
 */
const isOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const isAdmin = req.user.accountType === 'admin';
  const isOwner = req.resourceOwnerId && req.resourceOwnerId === req.user.id;

  if (!isAdmin && !isOwner) {
    // Return 404 instead of 403 to prevent resource enumeration
    return res.status(404).json({ message: 'Resource not found' });
  }

  next();
};


// ── ROLE: Multiple Allowed Roles ─────────────────────────────
/**
 * Factory function - allows specific roles
 * Usage: router.get('/route', auth, allowRoles('admin', 'customer'), ...)
 */
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.accountType)) {
      console.warn(`[ROLE BLOCKED] User ${req.user.id} role "${req.user.accountType}" not in allowed: [${roles.join(', ')}]`);
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};


module.exports = {
  isAdmin,
  isCustomer,
  isAuthenticated,
  isOwnerOrAdmin,
  allowRoles
};
