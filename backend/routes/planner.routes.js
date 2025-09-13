const express = require('express');
const {
  createPlan,
  getPlansByUser,
  getPlanById,
  updatePlan,
  deletePlan,
} = require('../controllers/planner.controller');

const router = express.Router();

router.post('/planner', createPlan);
router.get('/planner/:userId', getPlansByUser);
router.get('/planner/plan/:id', getPlanById);
router.put('/planner/:id', updatePlan);
router.delete('/planner/:id', deletePlan);

module.exports = router;