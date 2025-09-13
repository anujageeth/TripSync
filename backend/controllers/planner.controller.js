const mongoose = require('mongoose');
const BudgetPlanModel = require('../models/BudgetPlan');

async function createPlan(req, res) {
  try {
    const { userId, ...budgetPlanData } = req.body;
    const budgetPlan = await BudgetPlanModel.create({ ...budgetPlanData, userId });
    res.json(budgetPlan);
  } catch (err) {
    console.error('Error saving budget plan:', err);
    res.status(500).json({ message: 'Error saving budget plan', error: err?.message || err });
  }
}

async function getPlansByUser(req, res) {
  const { userId } = req.params;
  try {
    const budgetPlans = await BudgetPlanModel.find({ userId });
    res.json(budgetPlans);
  } catch (err) {
    console.error('Error retrieving budget plans:', err);
    res.status(500).json({ message: 'Error retrieving budget plans', error: err?.message || err });
  }
}

async function getPlanById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid plan id' });
    }
    const doc = await BudgetPlanModel.findById(id);
    if (!doc) return res.status(404).json({ message: 'Plan not found' });
    res.json(doc);
  } catch (err) {
    console.error('Error retrieving plan:', err);
    res.status(500).json({ message: 'Error retrieving plan', error: err?.message || err });
  }
}

async function updatePlan(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid plan id' });
    }
    const { date, city, places, hotel, meals, totalBudget } = req.body;
    const update = {
      ...(date ? { date: new Date(date) } : {}),
      ...(city ? { city } : {}),
      ...(Array.isArray(places) ? { places } : {}),
      ...(hotel ? { hotel } : {}),
      ...(meals ? { meals } : {}),
      ...(typeof totalBudget !== 'undefined' ? { totalBudget } : {}),
    };

    const updated = await BudgetPlanModel.findOneAndUpdate(
      { _id: id },
      update,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: 'Plan not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating budget plan:', err);
    res.status(500).json({ message: 'Error updating budget plan', error: err?.message || err });
  }
}

async function deletePlan(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid plan id' });
    }
    const deleted = await BudgetPlanModel.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Plan not found' });
    // 204 is fine; frontend only checks res.ok. Use 200 if you want a message body.
    return res.status(204).end();
  } catch (err) {
    console.error('Error deleting budget plan:', err);
    res.status(500).json({ message: 'Error deleting budget plan', error: err?.message || err });
  }
}

module.exports = { createPlan, getPlansByUser, getPlanById, updatePlan, deletePlan };