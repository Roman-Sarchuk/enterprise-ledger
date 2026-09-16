const APIError = require("./APIError");

const SUPPORTED_CURRENCIES = ["UAH", "USD", "EUR"];
const DEFAULT_CURRENCY = "UAH";

const validateCurrency = (currency) => {
  if (!SUPPORTED_CURRENCIES.includes(currency)) {
    throw new APIError(
      400,
      "Incorrect parameters",
      "Incorrect currency. It should be ISO 4217: " + SUPPORTED_CURRENCIES.join(", "),
    );
  }
};

module.exports = {
  SUPPORTED_CURRENCIES,
  DEFAULT_CURRENCY,
  validateCurrency
};