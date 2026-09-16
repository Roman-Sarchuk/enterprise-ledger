const APIError = require('../utils/APIError');
require('dotenv').config();


module.exports = (err, req, res, next) => {
  const isAPIError = err.name === "APIError";
  const statusCode = isAPIError ? err.code : 500;

  if (statusCode === 500) {
    console.error(`[ERROR] ${err.message}`);
  }

  res.status(statusCode).json(
    isAPIError
      ? err.toJSON()
      : {
          detail: "Internal Server Error",
          ...(process.env.NODE_ENV !== "production" && { error: err.message }),
        },
  );
};
