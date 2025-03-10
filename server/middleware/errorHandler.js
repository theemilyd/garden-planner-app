/**
 * Centralized error handling middleware
 */

// Custom error class
class AppError extends Error {
  constructor(message, statusCode, errors = [], errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    this.errorCode = errorCode;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error caught in global handler:', err);
  
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let errors = err.errors || [];
  let errorCode = err.errorCode || 'INTERNAL_ERROR';
  
  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errorCode = 'VALIDATION_ERROR';
    errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
  }
  
  // Handle duplicate key errors
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate Field Value';
    errorCode = 'DUPLICATE_VALUE';
    const field = Object.keys(err.keyValue)[0];
    errors = [{
      field,
      message: `${field} already exists`,
      value: err.keyValue[field]
    }];
  }
  
  // Handle cast errors (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}`;
    errorCode = 'INVALID_FORMAT';
    errors = [{
      field: err.path,
      message: `Invalid format for ${err.path}`,
      value: err.value
    }];
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    errorCode = 'INVALID_TOKEN';
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    errorCode = 'TOKEN_EXPIRED';
  }
  
  // Handle file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File too large';
    errorCode = 'FILE_TOO_LARGE';
    errors = [{
      field: 'file',
      message: 'File size exceeds the limit'
    }];
  }
  
  // Handle rate limiting errors
  if (err.statusCode === 429) {
    message = 'Too many requests, please try again later';
    errorCode = 'RATE_LIMIT_EXCEEDED';
  }
  
  // Handle network/timeout errors
  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
    statusCode = 408;
    message = 'Request timeout';
    errorCode = 'REQUEST_TIMEOUT';
  }
  
  // Formulate response
  const errorResponse = {
    status: 'error',
    message,
    errorCode,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    ...(errors.length > 0 && { errors }),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err.toString()
    })
  };
  
  // Log severe errors to monitoring service
  if (statusCode >= 500) {
    // This would connect to a monitoring service in production
    console.error('SEVERE ERROR:', {
      statusCode,
      message,
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString(),
      stack: err.stack
    });
  }
  
  // Send error response
  res.status(statusCode).json(errorResponse);
};

module.exports = {
  AppError,
  errorHandler
};