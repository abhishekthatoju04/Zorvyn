const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleGuard');
const {
  getSummary,
  getCategoryTotals,
  getMonthlyTrends,
  getRecentActivity,
  getTopCategories,
} = require('../controllers/dashboardController');

// All roles can see summary and recent activity
router.get('/summary', protect, getSummary);
router.get('/recent',  protect, getRecentActivity);

// Only analyst and admin can see detailed insights
router.get('/categories',     protect, authorize('analyst', 'admin'), getCategoryTotals);
router.get('/trends',         protect, authorize('analyst', 'admin'), getMonthlyTrends);
router.get('/top-categories', protect, authorize('analyst', 'admin'), getTopCategories);

module.exports = router;