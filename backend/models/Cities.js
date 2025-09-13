const mongoose = require('mongoose');

const VisitingPlaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    distanceKm: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true, default: '' },
    googleMapLink: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/i, 'Invalid Google Maps URL'],
    },
    category: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const CitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    district: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: 'Sri Lanka' },
    places: {
      type: [VisitingPlaceSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one visiting place is required',
      },
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  },
  { timestamps: true }
);

// Indexes
CitySchema.index({ name: 1 }, { unique: true });
CitySchema.index({ country: 1, district: 1, name: 1 });
CitySchema.index({ 'places.name': 1 });

module.exports = mongoose.model('City', CitySchema);