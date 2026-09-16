const reportService = require("../services/reportService");

exports.getSummaryCategories = async (req, res) => {
  // Get user input
  const userId = req.user.id;
  const { accountId, dateFrom, dateTo } = req.query;

  // Perform logic
  const result = await reportService.getSummaryCategoriesReport(
    userId,
    accountId,
    dateFrom,
    dateTo,
  );

  // Send response
  res.status(200).json(result);
};

exports.getLiquidityCurve = async (req, res) => {
  // Get user input
  const userId = req.user.id;
  const { accountId, dateFrom, dateTo, pointLimit } = req.query;

  // Perform logic
  const result = await reportService.getLiquidityCurveReport(
    userId,
    accountId,
    dateFrom,
    dateTo,
    pointLimit,
  );

  // Send response
  res.status(200).json(result);
};

exports.getCashFlow = async (req, res) => {
  // Get user input
  const userId = req.user.id;
  const { accountId, dateFrom, dateTo, pointLimit } = req.query;

  // Perform logic
  const result = await reportService.getCashFlowReport(
    userId,
    accountId,
    dateFrom,
    dateTo,
    pointLimit,
  );

  // Send response
  res.status(200).json(result);
};
