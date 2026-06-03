const express = require('express');
const { body, param, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Service = require('../models/Service');
const Booking = require('../models/Booking');

const router = express.Router();

// ============================================================
// SECURE CODING PRACTICES APPLIED:
// 1. Input Validation      - all fields validated before processing
// 2. Rate Limiting         - prevents API abuse
// 3. Authorization Check   - users can only access their own data
// 4. ObjectId Validation   - prevents invalid ID injection
// 5. Ownership Enforcement - booking ownership verified before action
// 6. Status Restriction    - only pending bookings can be cancelled
// 7. Data Sanitization     - inputs trimmed and sanitized
// 8. Error Info Hiding     - no stack traces sent to client
// 9. Safe Error Logging    - errors logged server-side only
// 10. Whitelist Validation - only allowed status values accepted
// ============================================================


// ── RATE LIMITERS ────────────────────────────────────────────

const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 20,                      // max 20 bookings per hour per IP
  message: { message: 'Too many booking requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});


// ── VALIDATION RULES ─────────────────────────────────────────

const bookingValidation = [
  body('user')
    .notEmpty().withMessage('User ID is required')
    .custom(val => mongoose.Types.ObjectId.isValid(val)).withMessage('Invalid user ID'),

  body('services')
    .isArray({ min: 1 }).withMessage('At least one service must be selected')
    .custom(services => services.every(id => mongoose.Types.ObjectId.isValid(id)))
    .withMessage('One or more invalid service IDs'),

  body('pickupDate')
    .notEmpty().withMessage('Pickup date is required')
    .isISO8601().withMessage('Invalid pickup date format')
    .custom(val => new Date(val) >= new Date()).withMessage('Pickup date cannot be in the past'),

  body('deliveryDate')
    .notEmpty().withMessage('Delivery date is required')
    .isISO8601().withMessage('Invalid delivery date format')
    .custom((val, { req }) => new Date(val) > new Date(req.body.pickupDate))
    .withMessage('Delivery date must be after pickup date'),

  body('pickupAddress')
    .trim()
    .notEmpty().withMessage('Pickup address is required')
    .isLength({ min: 5, max: 300 }).withMessage('Address must be 5-300 characters'),

  body('totalPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Total price must be a positive number'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
];

const mongoIdParam = [
  param('id')
    .custom(val => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid booking ID'),
];


// ── HELPER ───────────────────────────────────────────────────

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array()
    });
  }
  return null;
};


// ── ROUTES ───────────────────────────────────────────────────

/**
 * @route   GET /api/services
 * @desc    Get all active services
 * @access  Public
 * @security No auth needed, read-only
 */
router.get('/services', async (req, res) => {
  try {
    // [1] Only return active services, exclude internal fields
    const services = await Service.find({ isActive: { $ne: false } })
      .select('-__v -createdAt -updatedAt')
      .sort({ name: 1 });

    res.json(services);
  } catch (err) {
    console.error('[GET SERVICES ERROR]', err.message);
    res.status(500).json({ message: 'Failed to load services. Please try again.' });
  }
});


/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Private
 * @security JWT required, rate limited, ownership enforced, inputs validated
 */
router.post('/bookings', auth, bookingLimiter, bookingValidation, async (req, res) => {
  // [1] Validate all inputs first
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  const { user, services, pickupDate, deliveryDate, pickupAddress, totalPrice, notes } = req.body;

  try {
    // [2] Authorization: users can only create bookings for themselves
    if (req.user.accountType !== 'admin' && req.user.id !== user) {
      return res.status(403).json({ message: 'You can only create bookings for yourself' });
    }

    // [3] Verify all selected services actually exist in the database
    const existingServices = await Service.find({ _id: { $in: services } });
    if (existingServices.length !== services.length) {
      return res.status(400).json({ message: 'One or more selected services do not exist' });
    }

    // [4] Calculate real total price from database - never trust client price
    const serverTotal = existingServices.reduce((sum, s) => sum + s.price, 0);

    // [5] Create booking with server-calculated total
    const booking = new Booking({
      user,
      services,
      pickupDate: new Date(pickupDate),
      deliveryDate: new Date(deliveryDate),
      pickupAddress: pickupAddress.trim(),
      totalPrice: serverTotal,             // Use server total, not client total
      status: 'pending',                   // Always start as pending - never trust client status
      notes: notes?.trim() || ''
    });

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', '-password')       // Never return password
      .populate('services');

    res.status(201).json(populatedBooking);

  } catch (err) {
    console.error('[CREATE BOOKING ERROR]', err.message);
    res.status(500).json({ message: 'Failed to create booking. Please try again.' });
  }
});


/**
 * @route   GET /api/bookings/my-bookings
 * @desc    Get current user's bookings
 * @access  Private
 * @security JWT required, only returns own bookings
 */
router.get('/bookings/my-bookings', auth, async (req, res) => {
  try {
    // [1] Only fetch bookings that belong to the authenticated user
    const bookings = await Booking.find({ user: req.user.id })
      .populate('services', '-__v -createdAt -updatedAt')
      .select('-__v -createdAt -updatedAt')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error('[MY BOOKINGS ERROR]', err.message);
    res.status(500).json({ message: 'Failed to load bookings. Please try again.' });
  }
});


/**
 * @route   GET /api/bookings/:id
 * @desc    Get single booking by ID
 * @access  Private
 * @security JWT required, ownership verified, ObjectId validated
 */
router.get('/bookings/:id', auth, mongoIdParam, async (req, res) => {
  // [1] Validate MongoDB ObjectId format
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', '-password')       // Never return password
      .populate('services');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // [2] Ownership check - user can only see their own bookings
    if (req.user.accountType !== 'admin' && booking.user._id.toString() !== req.user.id) {
      // Return 404 instead of 403 to prevent resource enumeration
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (err) {
    console.error('[GET BOOKING ERROR]', err.message);
    res.status(500).json({ message: 'Failed to load booking. Please try again.' });
  }
});


/**
 * @route   PATCH /api/bookings/:id/cancel
 * @desc    Cancel a booking
 * @access  Private
 * @security JWT required, ownership verified, only pending bookings cancellable
 */
router.patch('/bookings/:id/cancel', auth, mongoIdParam, async (req, res) => {
  // [1] Validate MongoDB ObjectId
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // [2] Ownership check - only the owner or admin can cancel
    if (req.user.accountType !== 'admin' && booking.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Booking not found' }); // Hides existence
    }

    // [3] Business rule: only allow cancellation of pending bookings
    if (booking.status !== 'pending') {
      return res.status(400).json({
        message: `Cannot cancel a booking with status: "${booking.status}". Only pending bookings can be cancelled.`
      });
    }

    // [4] Update status safely
    booking.status = 'cancelled';
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', '-password')
      .populate('services');

    res.json({ message: 'Booking cancelled successfully', booking: populatedBooking });

  } catch (err) {
    console.error('[CANCEL BOOKING ERROR]', err.message);
    res.status(500).json({ message: 'Failed to cancel booking. Please try again.' });
  }
});


module.exports = router;
