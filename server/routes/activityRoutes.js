const express = require('express');
const router = express.Router();
const {
  getActivitiesByGoal,
  createActivity,
  updateActivity,
  toggleActivityComplete,
  deleteActivity
} = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createActivity);
router.get('/goal/:goalId', getActivitiesByGoal);
router.put('/:id', updateActivity);
router.patch('/:id/toggle', toggleActivityComplete);
router.delete('/:id', deleteActivity);

module.exports = router;
