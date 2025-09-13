const mongoose = require('mongoose');

const BudgetPlanSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    city: { type: String, required: true },
    places: { type: [String], required: true },
    hotel: { type: String, required: true },
    meals: { type: Object, required: true },
    totalBudget: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true } 
});

const BudgetPlanModel = mongoose.model('BudgetPlan', BudgetPlanSchema);

module.exports = BudgetPlanModel;
