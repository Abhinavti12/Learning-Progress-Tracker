const express = require('express');
const router = express.Router();
const { getDashboardOverview } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboardOverview);

module.exports = router;
