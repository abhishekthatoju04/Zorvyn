const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleGuard');
const {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} = require('../controllers/recordController');

// Validation rules
const recordValidation = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0 }).withMessage('Amount must be a positive number'),

  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(['income', 'expense']).withMessage('Type must be income or expense'),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),

  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid date format'),

  body('notes')
    .optional()
    .trim(),
];

const updateValidation = [
  body('amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Amount must be a positive number'),

  body('type')
    .optional()
    .isIn(['income', 'expense']).withMessage('Type must be income or expense'),

  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid date format'),
];

// ─── ROUTES ───────────────────────────────────────────────
// protect    → must be logged in
// authorize  → must have correct role

// All roles can view records
router.get('/',    protect, getAllRecords);
router.get('/:id', protect, getRecordById);

// Only admin can create, update, delete
router.post('/',    protect, authorize('admin'), recordValidation, createRecord);
router.put('/:id',  protect, authorize('admin'), updateValidation, updateRecord);
router.delete('/:id', protect, authorize('admin'), deleteRecord);

module.exports = router;