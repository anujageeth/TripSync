const mongoose = require('mongoose');
const PlanCollectionModel = require('../models/PlanCollection');
const BudgetPlanModel = require('../models/BudgetPlan');

function toUniqueValidIds(arr) {
  const ids = Array.isArray(arr) ? arr : [];
  const valid = [];
  const seen = new Set();
  for (const id of ids) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid dayPlan id: ${id}`);
    }
    const s = String(id);
    if (!seen.has(s)) {
      seen.add(s);
      valid.push(s);
    }
  }
  return valid;
}

async function loadPlansOrFail(dayPlanIds) {
  const plans = await BudgetPlanModel.find(
    { _id: { $in: dayPlanIds } },
    { _id: 1, city: 1, date: 1, userId: 1, totalBudget: 1 }
  ).lean();

  const foundIds = new Set(plans.map((p) => String(p._id)));
  const missing = dayPlanIds.filter((id) => !foundIds.has(String(id)));
  if (missing.length) {
    const err = new Error(`Some dayPlans not found: ${missing.join(', ')}`);
    err.status = 400;
    throw err;
  }
  return plans;
}

function deriveFromPlans(plans) {
  const destinations = [...new Set(plans.map((p) => p.city).filter(Boolean))];
  const dateVals = plans
    .map((p) => (p.date ? new Date(p.date).getTime() : null))
    .filter((t) => typeof t === 'number' && !Number.isNaN(t));

  const tripStart = dateVals.length ? new Date(Math.min(...dateVals)) : undefined;
  const tripEnd = dateVals.length ? new Date(Math.max(...dateVals)) : undefined;

  return { destinations, tripStart, tripEnd };
}

// Create
async function createCollection(req, res) {
  try {
    const { name, userId, dayPlanIds = [], destinations, tripStart, tripEnd, description } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'name is required' });
    }
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Valid userId is required' });
    }

    const uniqueIds = toUniqueValidIds(dayPlanIds);

    let derived = { destinations: [], tripStart: undefined, tripEnd: undefined };
    if (uniqueIds.length) {
      const plans = await loadPlansOrFail(uniqueIds);

      // Ensure all day plans belong to the same user
      const mismatch = plans.find((p) => String(p.userId) !== String(userId));
      if (mismatch) {
        return res
          .status(403)
          .json({ message: 'One or more day plans belong to a different user' });
      }

      derived = deriveFromPlans(plans);
    } else {
      derived = {
        destinations: Array.isArray(destinations) ? destinations : [],
        tripStart: tripStart ? new Date(tripStart) : undefined,
        tripEnd: tripEnd ? new Date(tripEnd) : undefined,
      };
    }

    const trip = await PlanCollectionModel.createTrip({
      name: String(name).trim(),
      userId,
      destinations: derived.destinations,
      tripStart: derived.tripStart,
      tripEnd: derived.tripEnd,
      dayPlanIds: uniqueIds,
    });

    if (typeof description !== 'undefined') {
      await PlanCollectionModel.findByIdAndUpdate(trip._id, {
        description: String(description).trim(),
      });
    }

    const populated = await PlanCollectionModel.findById(trip._id)
      .populate({ path: 'dayPlans', select: '_id date city totalBudget' })
      .lean();

    return res.status(201).json(populated);
  } catch (err) {
    if (err?.status) return res.status(err.status).json({ message: err.message });
    if (err?.name === 'ValidationError' || err?.name === 'CastError') {
      return res.status(400).json({ message: err.message });
    }
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'A collection with this name already exists for this user' });
    }
    console.error('Error creating collection:', err);
    return res.status(500).json({ message: 'Error creating collection', error: err?.message || err });
  }
}

// Update
async function updateCollection(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid collection id' });
    }

    const doc = await PlanCollectionModel.findById(id);
    if (!doc) return res.status(404).json({ message: 'Collection not found' });

    const { name, dayPlanIds, description } = req.body || {};

    if (typeof name !== 'undefined') {
      if (!String(name).trim()) {
        return res.status(400).json({ message: 'name cannot be empty' });
      }
      doc.name = String(name).trim();
    }

    if (typeof dayPlanIds !== 'undefined') {
      const uniqueIds = toUniqueValidIds(dayPlanIds);
      let derived = { destinations: [], tripStart: undefined, tripEnd: undefined };

      if (uniqueIds.length) {
        const plans = await loadPlansOrFail(uniqueIds);

        const mismatch = plans.find((p) => String(p.userId) !== String(doc.userId));
        if (mismatch) {
          return res
            .status(403)
            .json({ message: 'One or more day plans belong to a different user' });
        }
        derived = deriveFromPlans(plans);
      }

      doc.dayPlans = uniqueIds;
      doc.destinations = derived.destinations;
      doc.tripStart = derived.tripStart;
      doc.tripEnd = derived.tripEnd;
    }

    if (typeof description !== 'undefined') {
      doc.description = String(description).trim();
    }

    await doc.save();

    const populated = await PlanCollectionModel.findById(doc._id)
      .populate({ path: 'dayPlans', select: '_id date city totalBudget' })
      .lean();

    return res.json(populated);
  } catch (err) {
    if (err?.name === 'ValidationError' || err?.name === 'CastError') {
      return res.status(400).json({ message: err.message });
    }
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'A collection with this name already exists for this user' });
    }
    console.error('Error updating collection:', err);
    return res.status(500).json({ message: 'Error updating collection', error: err?.message || err });
  }
}

async function deleteCollection(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid collection id' });
    }
    const deleted = await PlanCollectionModel.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Collection not found' });
    return res.status(204).end();
  } catch (err) {
    console.error('Error deleting collection:', err);
    return res.status(500).json({ message: 'Error deleting collection', error: err?.message || err });
  }
}

async function getCollectionById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid collection id' });
    }
    const doc = await PlanCollectionModel.findById(id)
      .populate({ path: 'dayPlans', select: '_id date city totalBudget hotel meals' })
      .lean();
    if (!doc) return res.status(404).json({ message: 'Collection not found' });
    return res.json(doc);
  } catch (err) {
    console.error('Error retrieving collection:', err);
    return res.status(500).json({ message: 'Error retrieving collection', error: err?.message || err });
  }
}

async function listCollections(req, res) {
  try {
    const { userId } = req.query;
    const filter = {};
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user id' });
      }
      filter.userId = userId;
    }
    const docs = await PlanCollectionModel.find(filter)
      .sort({ createdAt: -1 })
      .populate({ path: 'dayPlans', select: '_id date city totalBudget' })
      .lean();
    return res.json(docs);
  } catch (err) {
    console.error('Error listing collections:', err);
    return res.status(500).json({ message: 'Error listing collections', error: err?.message || err });
  }
}

module.exports = {
  createCollection,
  updateCollection,
  deleteCollection,
  getCollectionById,
  listCollections,
};