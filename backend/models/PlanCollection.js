const mongoose = require('mongoose');

const PlanCollectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    destinations: [{ type: String, trim: true }],
    tripStart: { type: Date },
    tripEnd: { type: Date },

    dayPlans: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BudgetPlan',
      },
    ],

    totalBudget: { type: Number, default: 0 },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

PlanCollectionSchema.index({ userId: 1, name: 1 }, { unique: true });

PlanCollectionSchema.pre('validate', function (next) {
  if (this.tripStart && this.tripEnd && this.tripEnd < this.tripStart) {
    return next(new Error('tripEnd cannot be earlier than tripStart'));
  }
  next();
});

PlanCollectionSchema.methods.recalculateTotalBudget = async function () {
  const BudgetPlan = mongoose.model('BudgetPlan');
  if (!this.dayPlans || this.dayPlans.length === 0) {
    this.totalBudget = 0;
    return this.totalBudget;
  }
  const plans = await BudgetPlan.find(
    { _id: { $in: this.dayPlans } },
    { totalBudget: 1 }
  ).lean();

  this.totalBudget = plans.reduce((sum, p) => sum + (p.totalBudget || 0), 0);
  return this.totalBudget;
};

PlanCollectionSchema.pre('save', async function (next) {
  if (this.isModified('dayPlans')) {
    try {
      await this.recalculateTotalBudget();
    } catch (err) {
      return next(err);
    }
  }
  next();
});

PlanCollectionSchema.methods.addDayPlan = async function (budgetPlanId) {
  const exists = this.dayPlans?.some((id) => id.equals(budgetPlanId));
  if (!exists) {
    this.dayPlans.push(budgetPlanId);
  }
  await this.recalculateTotalBudget();
  return this.save();
};

PlanCollectionSchema.statics.createTrip = async function ({
  name,
  userId,
  destinations = [],
  tripStart,
  tripEnd,
  dayPlanIds = [],
}) {
  const uniqueIds = [...new Set(dayPlanIds.map((id) => id.toString()))];

  const trip = new this({
    name,
    userId,
    destinations,
    tripStart,
    tripEnd,
    dayPlans: uniqueIds,
  });

  await trip.recalculateTotalBudget();
  return trip.save();
};

PlanCollectionSchema.statics.addDayPlanToTrip = async function (
  tripId,
  budgetPlanId
) {
  const trip = await this.findById(tripId);
  if (!trip) throw new Error('Trip not found');
  await trip.addDayPlan(budgetPlanId);
  return trip;
};

const PlanCollectionModel = mongoose.model(
  'PlanCollection',
  PlanCollectionSchema
);

module.exports = PlanCollectionModel;