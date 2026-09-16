const mongoose = require("mongoose");
const APIError = require("./APIError");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const parsePagePagination = (pageRaw, limitRaw) => {
  const page = pageRaw === undefined ? DEFAULT_PAGE : Number(pageRaw);
  const limit = limitRaw === undefined ? DEFAULT_LIMIT : Number(limitRaw);

  if (!Number.isInteger(page) || page <= 0) {
    throw new APIError(400, "Incorrect parameters", "Invalid page value");
  }

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new APIError(400, "Incorrect parameters", "Invalid limit value");
  }

  return {
    page,
    limit: Math.min(limit, MAX_LIMIT),
  };
};

const parseCursorPagination = (nextCursorRaw, limitRaw) => {
  const limit = limitRaw === undefined ? DEFAULT_LIMIT : Number(limitRaw);
  let nextCursor = null;

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new APIError(400, "Incorrect parameters", "Invalid limit value");
  }

  if (nextCursorRaw) {
    if (!mongoose.Types.ObjectId.isValid(nextCursorRaw)) {
      throw new APIError(400, "Incorrect parameters", "Invalid cursor format. Must be a valid ObjectId");
    }
    nextCursor = nextCursorRaw;
  }

  return {
    nextCursor,
    limit: Math.min(limit, MAX_LIMIT),
  };
};

module.exports = {
  parsePagePagination,
  parseCursorPagination
};