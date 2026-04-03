const FinancialRecord = require('../models/FinancialRecord');
const getSummary = async (req, res) => {
  try {
    const result = await FinancialRecord.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);
    let totalIncome   = 0;
    let totalExpenses = 0;
    let incomeCount   = 0;
    let expenseCount  = 0;

    result.forEach((item) => {
      if (item._id === 'income') {
        totalIncome  = item.total;
        incomeCount  = item.count;
      } else if (item._id === 'expense') {
        totalExpenses = item.total;
        expenseCount  = item.count;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        totalRecords: incomeCount + expenseCount,
        incomeCount,
        expenseCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
const getCategoryTotals = async (req, res) => {
  try {
    const result = await FinancialRecord.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: {
            category: '$category',
            type: '$type',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },

      { $sort: { total: -1 } },

      {
        $project: {
          _id: 0,
          category: '$_id.category',
          type: '$_id.type',
          total: 1,
          count: 1,
        },
      },
    ]);

    const grouped = {};
    result.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = { category: item.category };
      }
      grouped[item.category][item.type] = {
        total: item.total,
        count: item.count,
      };
    });

    res.status(200).json({
      success: true,
      data: Object.values(grouped),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const getMonthlyTrends = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const result = await FinancialRecord.aggregate([
      { $match: { isDeleted: false } },
      {
        $match: {
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const trends = monthNames.map((month, index) => ({
      month,
      monthNumber: index + 1,
      income: 0,
      expense: 0,
    }));
    result.forEach((item) => {
      const monthIndex = item._id.month - 1;
      trends[monthIndex][item._id.type] = item.total;
    });
    res.status(200).json({
      success: true,
      year,
      data: trends,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const records = await FinancialRecord.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
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

const getTopCategories = async (req, res) => {
  try {
    const type  = req.query.type  || 'expense';
    const limit = parseInt(req.query.limit) || 5;
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be income or expense',
      });
    }
    const result = await FinancialRecord.aggregate([
      { $match: { isDeleted: false } },
      { $match: { type } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: 1,
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      type,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  getSummary,
  getCategoryTotals,
  getMonthlyTrends,
  getRecentActivity,
  getTopCategories,
};