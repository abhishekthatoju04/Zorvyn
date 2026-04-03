const FinancialRecord = require('../models/FinancialRecord');
const { validationResult } = require('express-validator');
const createRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    const { amount, type, category, date, notes } = req.body;
    const record = await FinancialRecord.create({
      amount,
      type,
      category,
      date: date || Date.now(),
      notes,
      createdBy: req.user._id, 
    });

    res.status(201).json({
      success: true,
      message: 'Record created successfully',
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
const getAllRecords = async (req, res) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;
    const filter = { isDeleted: false };

    if (type) {
      filter.type = type; 
    }

    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(endDate);
    }
    const pageNum  = parseInt(page);
    const limitNum = parseInt(limit);
    const skip     = (pageNum - 1) * limitNum;
    const [records, total] = await Promise.all([
      FinancialRecord.find(filter)
        .populate('createdBy', 'name email') 
        .sort({ date: -1 })                  
        .skip(skip)
        .limit(limitNum),
      FinancialRecord.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
const getRecordById = async (req, res) => {
  try {
    const record = await FinancialRecord.findById(req.params.id).where({ isDeleted: false })
      .populate('createdBy', 'name email');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
const updateRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    const { amount, type, category, date, notes } = req.body;
    const record = await FinancialRecord.findById(req.params.id).where({ isDeleted: false })
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }
    if (amount   !== undefined) record.amount   = amount;
    if (type     !== undefined) record.type     = type;
    if (category !== undefined) record.category = category;
    if (date     !== undefined) record.date     = date;
    if (notes    !== undefined) record.notes    = notes;
    await record.save();
    res.status(200).json({
      success: true,
      message: 'Record updated successfully',
      data: record,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const record = await FinancialRecord.findById(req.params.id).where({ isDeleted: false })
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }
    record.isDeleted = true;
    await record.save();
    res.status(200).json({
      success: true,
      message: 'Record deleted successfully',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};