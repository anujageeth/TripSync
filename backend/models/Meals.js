const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Other'],
    },
    include: {
      type: [String],
      default: [],
      set: (arr) =>
        Array.isArray(arr)
          ? arr.map((v) => String(v).trim()).filter(Boolean)
          : [],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BudgetPlan',
    },
  },
  { timestamps: true }
);

MealSchema.index({ userId: 1 });
MealSchema.index({ planId: 1, type: 1 });

const MealModel = mongoose.model('Meal', MealSchema);
module.exports = MealModel;