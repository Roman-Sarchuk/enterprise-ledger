const { ALLOWED_TYPES } = require("../models/Category");

const getTransactionBalanceChange = (categoryType, amount) => {
  if (categoryType === ALLOWED_TYPES[0]) {
    return amount;
  }

  if (categoryType === ALLOWED_TYPES[1]) {
    return -amount;
  }

  throw new Error(`Unsupported category type: ${categoryType}`);
};

module.exports = {
  getTransactionBalanceChange,
};