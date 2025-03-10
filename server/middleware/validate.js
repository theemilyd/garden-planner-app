const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

/**
 * Enhanced validation middleware for request validation
 */

// Common validation schemas
const validationSchemas = {
  // Garden validation
  garden: [
    body('name')
      .trim()
      .notEmpty().withMessage('Garden name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Garden name must be between 2 and 100 characters'),
    body('width')
      .isNumeric().withMessage('Width must be a number')
      .isFloat({ min: 0.1, max: 1000 }).withMessage('Width must be between 0.1 and 1000'),
    body('length')
      .isNumeric().withMessage('Length must be a number')
      .isFloat({ min: 0.1, max: 1000 }).withMessage('Length must be between 0.1 and 1000'),
    body('soilType')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Soil type must be less than 100 characters'),
    body('sunlight')
      .optional()
      .trim()
      .isIn(['Full Sun', 'Partial Sun', 'Partial Shade', 'Full Shade']).withMessage('Invalid sunlight value'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  ],
  
  // Plant validation
  plant: [
    body('name')
      .trim()
      .notEmpty().withMessage('Plant name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Plant name must be between 2 and 100 characters'),
    body('scientificName')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Scientific name must be less than 100 characters'),
    body('plantingDepth')
      .optional()
      .isNumeric().withMessage('Planting depth must be a number')
      .isFloat({ min: 0, max: 100 }).withMessage('Planting depth must be between 0 and 100'),
    body('spacing')
      .optional()
      .isNumeric().withMessage('Spacing must be a number')
      .isFloat({ min: 0, max: 1000 }).withMessage('Spacing must be between 0 and 1000'),
    body('daysToMaturity')
      .optional()
      .isInt({ min: 1, max: 365 }).withMessage('Days to maturity must be between 1 and 365'),
    body('growingZones')
      .optional()
      .isArray().withMessage('Growing zones must be an array'),
    body('growingZones.*')
      .optional()
      .isInt({ min: 1, max: 13 }).withMessage('Growing zone must be between 1 and 13'),
    body('sunRequirements')
      .optional()
      .isIn(['Full Sun', 'Partial Sun', 'Partial Shade', 'Full Shade']).withMessage('Invalid sun requirements'),
    body('waterRequirements')
      .optional()
      .isIn(['Low', 'Medium', 'High']).withMessage('Invalid water requirements'),
  ],
  
  // Task validation
  task: [
    body('title')
      .trim()
      .notEmpty().withMessage('Task title is required')
      .isLength({ min: 2, max: 100 }).withMessage('Task title must be between 2 and 100 characters'),
    body('dueDate')
      .optional()
      .isISO8601().withMessage('Invalid date format')
      .toDate(),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('completed')
      .optional()
      .isBoolean().withMessage('Completed must be a boolean')
      .toBoolean(),
    body('priority')
      .optional()
      .isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority value'),
  ],
  
  // Auth validation
  register: [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z0-9 ]+$/).withMessage('Name can only contain letters, numbers, and spaces'),
    body('email')
      .isEmail().withMessage('Valid email is required')
      .normalizeEmail()
      .trim(),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('zipCode')
      .optional()
      .trim()
      .matches(/^\d{5}(-\d{4})?$/).withMessage('Invalid US zip code format'),
  ],
  
  login: [
    body('email')
      .isEmail().withMessage('Valid email is required')
      .normalizeEmail()
      .trim(),
    body('password')
      .notEmpty().withMessage('Password is required'),
  ],
  
  // Search validation
  search: [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 }).withMessage('Search query must be between 1 and 100 characters'),
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
      .toInt(),
    query('sort')
      .optional()
      .isString().withMessage('Sort must be a string'),
  ],
  
  // ID parameter validation
  idParam: [
    param('id')
      .isMongoId().withMessage('Invalid ID format'),
  ],
  
  // Zone validation
  zone: [
    body('zipCode')
      .optional()
      .trim()
      .matches(/^\d{5}(-\d{4})?$/).withMessage('Invalid US zip code format'),
    body('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    body('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  ],
};

// Validation middleware factory with enhanced error handling
const validate = (schemas) => {
  return [
    ...(Array.isArray(schemas) ? schemas : [schemas]),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
          field: err.param,
          message: err.msg,
          value: err.value
        }));
        
        // Throw a custom error with validation details
        return next(new AppError('Validation failed', 400, formattedErrors, 'VALIDATION_ERROR'));
      }
      next();
    }
  ];
};

// Sanitize middleware to clean input data
const sanitize = (fields) => {
  const sanitizers = fields.map(field => {
    return body(field).trim().escape();
  });
  
  return sanitizers;
};

module.exports = {
  validate,
  sanitize,
  schemas: validationSchemas
};