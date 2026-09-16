const LRU = new Map();

// Simple in-memory rate limiter per IP. Not suitable for multi-instance deployments.
module.exports = function rateLimiter(options = {}) {
  const windowMs = options.windowMs || 60 * 60 * 1000; // 1 hour
  const max = options.max || 5;

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress || 'global';
    const now = Date.now();
    const entry = LRU.get(key) || { count: 0, first: now };

    if (now - entry.first > windowMs) {
      entry.count = 0;
      entry.first = now;
    }

    entry.count += 1;
    LRU.set(key, entry);

    if (entry.count > max) {
      return res.status(429).json({ detail: 'Too many requests, please try again later.' });
    }

    next();
  };
};
