const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleGuard');
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  getMe,
} = require('../controllers/userController');

// Any logged in user
router.get('/me', protect, getMe);

// Admin only
router.get('/',    protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, authorize('admin'), getUserById);

router.patch('/:id/role',
  protect,
  authorize('admin'),
  [body('role').isIn(['viewer', 'analyst', 'admin']).withMessage('Invalid role')],
  updateUserRole
);

router.patch('/:id/status',
  protect,
  authorize('admin'),
  [body('isActive').isBoolean().withMessage('isActive must be true or false')],
  updateUserStatus
);

module.exports = router;