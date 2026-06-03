const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  icon: { type: String } // Base64 image or icon path
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);