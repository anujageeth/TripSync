const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    city: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'City' }
    ],

    address: { type: String, required: true, trim: true },

    googleMapLink: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/i, 'Invalid URL for Google Map link'],
    },
    imageUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/i, 'Invalid image URL'],
    },

    rating: { type: Number, min: 0, max: 5 },
    starRating: { type: Number, min: 1, max: 5 },

    hasPool: { type: Boolean, default: false },
    hasGym: { type: Boolean, default: false },

    description: { type: String, trim: true, default: '' },
    specialFeatures: {
      type: [String],
      default: [],
      set: (arr) =>
        Array.isArray(arr)
          ? arr.map((v) => String(v).trim()).filter(Boolean)
          : [],
    },

    roomPrice: { type: Number, required: true, min: 0 },

    phone: {
      type: String,
      trim: true,
      match: [/^\+?[0-9 ()-]{7,20}$/, 'Invalid phone number'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },

    availableMeals: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Meal' }
    ],

    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'BudgetPlan' },
  },
  { timestamps: true }
);

HotelSchema.index({ city: 1, starRating: -1 });
HotelSchema.index({ name: 'text', description: 'text', address: 'text' });

const HotelModel = mongoose.model('Hotel', HotelSchema);
module.exports = HotelModel;