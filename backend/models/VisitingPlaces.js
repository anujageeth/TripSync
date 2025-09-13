const mongoose = require('mongoose');

const VisitingPlaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
    distanceKm: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true, default: '' },
    googleMapLink: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/i, 'Invalid Google Maps URL'],
    },
    category: { type: String, trim: true, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  },
  { timestamps: true }
);

VisitingPlaceSchema.index({ cityId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('VisitingPlace', VisitingPlaceSchema);