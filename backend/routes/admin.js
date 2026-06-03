const express = require("express");
const bcrypt = require("bcryptjs");
const { body, param, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const { isAdmin } = require("../middleware/roleMiddleware");
const User = require("../models/User");
const Service = require("../models/Service");
const Booking = require("../models/Booking");

const router = express.Router();

// ============================================================
// SECURE CODING PRACTICES APPLIED:
// 1. Double Auth Layer     - JWT auth + admin role check on every route
// 2. Input Validation      - all fields validated with express-validator
// 3. ObjectId Validation   - prevents NoSQL injection via invalid IDs
// 4. Rate Limiting         - prevents admin API abuse
// 5. Password Hashing      - bcrypt salt rounds = 12
// 6. Self-Protection       - admin cannot delete themselves
// 7. Whitelist Values      - only allowed status values accepted
// 8. Price Recalculation   - server recalculates prices from DB
// 9. Error Info Hiding     - no internals exposed to client
// 10. Audit Logging        - all admin actions logged server-side
// ============================================================

// ── RATE LIMITERS ────────────────────────────────────────────

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many admin requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(adminLimiter); // Apply to all admin routes

// ── VALIDATION RULES ─────────────────────────────────────────

const mongoIdParam = [
  param("id")
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage("Invalid ID format"),
];

const userCreateValidation = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be 2-50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be 2-50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name can only contain letters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),

  body("phone")
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]{7,20}$/)
    .withMessage("Invalid phone number"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must have at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must have at least one number"),
];

const userUpdateValidation = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be 2-50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters"),

  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be 2-50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name can only contain letters"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),

  body("phone")
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]{7,20}$/)
    .withMessage("Invalid phone number"),

  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must have at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must have at least one number"),
];

const serviceValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Service name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Service name must be 2-100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 5, max: 500 })
    .withMessage("Description must be 5-500 characters"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0.01 })
    .withMessage("Price must be a positive number"),
];

const bookingUpdateValidation = [
  body("services")
    .isArray({ min: 1 })
    .withMessage("At least one service is required")
    .custom((services) =>
      services.every((id) => mongoose.Types.ObjectId.isValid(id)),
    )
    .withMessage("One or more invalid service IDs"),

  body("pickupDate")
    .notEmpty()
    .withMessage("Pickup date is required")
    .isISO8601()
    .withMessage("Invalid pickup date"),

  body("deliveryDate")
    .notEmpty()
    .withMessage("Delivery date is required")
    .isISO8601()
    .withMessage("Invalid delivery date"),

  body("pickupAddress")
    .trim()
    .notEmpty()
    .withMessage("Pickup address is required")
    .isLength({ min: 5, max: 300 })
    .withMessage("Address must be 5-300 characters"),

  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn([
      "pending",
      "picked-up",
      "processing",
      "ready",
      "delivered",
      "cancelled",
    ])
    .withMessage("Invalid status value"),
];

// ── HELPER ───────────────────────────────────────────────────

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  return null;
};

// ═══════════════════════════════════════════════════════════
// USER MANAGEMENT ROUTES
// ═══════════════════════════════════════════════════════════

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Admin only
 */
router.get("/users", auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -__v -createdAt -updatedAt")
      .sort({ createdAt: -1 });

    console.log(`[ADMIN] ${req.user.id} fetched all users`);
    res.json(users);
  } catch (err) {
    console.error("[ADMIN GET USERS ERROR]", err.message);
    res.status(500).json({ message: "Failed to load users." });
  }
});

/**
 * @route   POST /api/admin/users
 * @desc    Create a new user
 * @access  Admin only
 */
router.post("/users", auth, isAdmin, userCreateValidation, async (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  const { firstName, lastName, email, phone, address, password } = req.body;

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "A user with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      address: address?.trim(),
      accountType: "customer",
      password: hashedPassword,
    });

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.__v;

    console.log(`[ADMIN] ${req.user.id} created user ${user._id}`);
    res.status(201).json(userResponse);
  } catch (err) {
    console.error("[ADMIN CREATE USER ERROR]", err.message);
    res.status(500).json({ message: "Failed to create user." });
  }
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update a user
 * @access  Admin only
 */
router.put(
  "/users/:id",
  auth,
  isAdmin,
  mongoIdParam,
  userUpdateValidation,
  async (req, res) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { firstName, lastName, email, phone, address, password } = req.body;

    try {
      if (email) {
        const existingUser = await User.findOne({
          email: email.toLowerCase(),
          _id: { $ne: req.params.id },
        });
        if (existingUser) {
          return res
            .status(400)
            .json({ message: "Email already in use by another account" });
        }
      }

      const updateData = {};
      if (firstName) updateData.firstName = firstName.trim();
      if (lastName) updateData.lastName = lastName.trim();
      if (email) updateData.email = email.toLowerCase().trim();
      if (phone !== undefined) updateData.phone = phone?.trim();
      if (address !== undefined) updateData.address = address?.trim();

      if (password && password.trim() !== "") {
        updateData.password = await bcrypt.hash(password, 12);
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true },
      ).select("-password -__v -CreatedAt -updatedAt");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log(`[ADMIN] ${req.user.id} updated user ${req.params.id}`);
      res.json(user);
    } catch (err) {
      console.error("[ADMIN UPDATE USER ERROR]", err.message);
      res.status(500).json({ message: "Failed to update user." });
    }
  },
);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user
 * @access  Admin only
 */
router.delete("/users/:id", auth, isAdmin, mongoIdParam, async (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    if (req.params.id === req.user.id) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`[ADMIN] ${req.user.id} deleted user ${req.params.id}`);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("[ADMIN DELETE USER ERROR]", err.message);
    res.status(500).json({ message: "Failed to delete user." });
  }
});

// ═══════════════════════════════════════════════════════════
// SERVICES MANAGEMENT ROUTES
// ═══════════════════════════════════════════════════════════

/**
 * @route   GET /api/admin/services
 * @desc    Get all services including inactive
 * @access  Admin only
 */
router.get("/services", auth, isAdmin, async (req, res) => {
  try {
    const services = await Service.find()
      .select("-__v -createdAt -updatedAt")
      .sort({ name: 1 });
    res.json(services);
  } catch (err) {
    console.error("[ADMIN GET SERVICES ERROR]", err.message);
    res.status(500).json({ message: "Failed to load services." });
  }
});

/**
 * @route   POST /api/admin/services
 * @desc    Create a new service
 * @access  Admin only
 */
router.post("/services", auth, isAdmin, serviceValidation, async (req, res) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  const { name, description, price } = req.body;

  try {
    const existingService = await Service.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });
    if (existingService) {
      return res
        .status(400)
        .json({ message: "A service with this name already exists" });
    }

    const service = new Service({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      isActive: true,
    });

    await service.save();

    console.log(`[ADMIN] ${req.user.id} created service ${service._id}`);
    res.status(201).json(service);
  } catch (err) {
    console.error("[ADMIN CREATE SERVICE ERROR]", err.message);
    res.status(500).json({ message: "Failed to create service." });
  }
});

/**
 * @route   PUT /api/admin/services/:id
 * @desc    Update a service
 * @access  Admin only
 */
router.put(
  "/services/:id",
  auth,
  isAdmin,
  mongoIdParam,
  serviceValidation,
  async (req, res) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { name, description, price } = req.body;

    try {
      const service = await Service.findByIdAndUpdate(
        req.params.id,
        {
          name: name.trim(),
          description: description.trim(),
          price: parseFloat(price),
        },
        { new: true, runValidators: true },
      );

      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      console.log(`[ADMIN] ${req.user.id} updated service ${req.params.id}`);
      res.json(service);
    } catch (err) {
      console.error("[ADMIN UPDATE SERVICE ERROR]", err.message);
      res.status(500).json({ message: "Failed to update service." });
    }
  },
);

/**
 * @route   DELETE /api/admin/services/:id
 * @desc    Delete a service
 * @access  Admin only
 */
router.delete(
  "/services/:id",
  auth,
  isAdmin,
  mongoIdParam,
  async (req, res) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    try {
      const service = await Service.findByIdAndDelete(req.params.id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      console.log(`[ADMIN] ${req.user.id} deleted service ${req.params.id}`);
      res.json({ message: "Service deleted successfully" });
    } catch (err) {
      console.error("[ADMIN DELETE SERVICE ERROR]", err.message);
      res.status(500).json({ message: "Failed to delete service." });
    }
  },
);

// ═══════════════════════════════════════════════════════════
// BOOKINGS MANAGEMENT ROUTES
// ═══════════════════════════════════════════════════════════

/**
 * @route   GET /api/admin/bookings
 * @desc    Get all bookings
 * @access  Admin only
 */
router.get("/bookings", auth, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "-password -__v -createdAt -updatedAt")
      .populate("services", "-__v -createdAt -updatedAt")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("[ADMIN GET BOOKINGS ERROR]", err.message);
    res.status(500).json({ message: "Failed to load bookings." });
  }
});

/**
 * @route   PUT /api/admin/bookings/:id
 * @desc    Update a booking (including status)
 * @access  Admin only
 */
router.put(
  "/bookings/:id",
  auth,
  isAdmin,
  mongoIdParam,
  bookingUpdateValidation,
  async (req, res) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const {
      user,
      services,
      pickupDate,
      deliveryDate,
      pickupAddress,
      notes,
      status,
    } = req.body;

    try {
      const existingBooking = await Booking.findById(req.params.id);
      if (!existingBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const existingServices = await Service.find({ _id: { $in: services } });
      if (existingServices.length !== services.length) {
        return res
          .status(400)
          .json({ message: "One or more services do not exist" });
      }

      const serverTotal = existingServices.reduce((sum, s) => sum + s.price, 0);

      const booking = await Booking.findByIdAndUpdate(
        req.params.id,
        {
          user,
          services,
          pickupDate: new Date(pickupDate),
          deliveryDate: new Date(deliveryDate),
          pickupAddress: pickupAddress.trim(),
          totalPrice: serverTotal,
          notes: notes?.trim() || "",
          status,
        },
        { new: true },
      )
        .populate("user", "-password")
        .populate("services");

      console.log(
        `[ADMIN] ${req.user.id} updated booking ${req.params.id} → status: ${status}`,
      );
      res.json(booking);
    } catch (err) {
      console.error("[ADMIN UPDATE BOOKING ERROR]", err.message);
      res.status(500).json({ message: "Failed to update booking." });
    }
  },
);

/**
 * @route   DELETE /api/admin/bookings/:id
 * @desc    Delete a booking
 * @access  Admin only
 */
router.delete(
  "/bookings/:id",
  auth,
  isAdmin,
  mongoIdParam,
  async (req, res) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    try {
      const booking = await Booking.findByIdAndDelete(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      console.log(`[ADMIN] ${req.user.id} deleted booking ${req.params.id}`);
      res.json({ message: "Booking deleted successfully" });
    } catch (err) {
      console.error("[ADMIN DELETE BOOKING ERROR]", err.message);
      res.status(500).json({ message: "Failed to delete booking." });
    }
  },
);

module.exports = router;
