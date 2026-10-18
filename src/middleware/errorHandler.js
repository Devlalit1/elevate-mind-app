const logger = require('../utils/logger');

/**
 * Centralized async error handler for Express routes.
 * Wraps async route handlers to catch unhandled promise rejections.
 *
 * @param {Function} fn - Async route handler function.
 * @returns {Function} Express middleware wrapper.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global Express error-handling middleware.
 * Must be registered AFTER all routes.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  logger.error(`${req.method} ${req.originalUrl} — ${err.message}`, { stack: err.stack });

  res.status(statusCode).json({
    success: false,
    error: {
      message: isProduction && statusCode === 500 ? 'Internal Server Error' : err.message,
      ...(isProduction ? {} : { stack: err.stack }),
    },
  });
};

/**
 * 404 handler for unknown routes.
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: { message: `Route ${req.method} ${req.originalUrl} not found` },
  });
};

module.exports = { asyncHandler, errorHandler, notFound };
