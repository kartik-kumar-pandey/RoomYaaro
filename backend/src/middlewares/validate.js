import { validationResult } from 'express-validator';
import { AppError } from '../utils/helpers.js';
import logger from '../utils/logger.js';

/**
 * Validation middleware — runs after express-validator chains.
 * Returns structured field-level error details instead of swallowing them.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formatted,
    });
  }
  next();
};

/**
 * Global error handler — logs server errors and sends appropriate response.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (statusCode >= 500) {
    logger.error('Unhandled server error', {
      statusCode,
      message,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      stack: err.stack,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only expose stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};
