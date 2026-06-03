const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Support BOTH old (service) and new (services) for backward compatibility
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: false }, // Old field - optional now
  services: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Service'
  }], // New field - array of services
  pickupDate: { type: Date, required: true },
  deliveryDate: { type: Date, required: true },
  pickupAddress: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'picked-up', 'processing', 'ready', 'delivered', 'cancelled'],
    default: 'pending' 
  },
  notes: { type: String },
}, { timestamps: true });

// Pre-save hook to ensure at least one service is provided
bookingSchema.pre('save', async function() {
  // If old 'service' field is provided but not 'services', convert it
  if (this.service && (!this.services || this.services.length === 0)) {
    this.services = [this.service];
  }

  // Validate that at least one service exists
  if (!this.services || this.services.length === 0) {
    throw new Error('At least one service must be provided');
  }
});

// Virtual to get services regardless of old or new schema
bookingSchema.virtual('allServices').get(function() {
  if (this.services && this.services.length > 0) {
    return this.services;
  } else if (this.service) {
    return [this.service];
  }
  return [];
});

module.exports = mongoose.model('Booking', bookingSchema);