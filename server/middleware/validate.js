const { body, param, validationResult } = require('express-validator');

/**
 * Validation middleware for request validation
 */

// Common validation schemas
const validationSchemas = {
  // Garden validation
  garden: [
    body('name').trim().notEmpty().withMessage('Garden name is required'),
    body('width').isNumeric().withMessage('Width must be a number'),
    body('length').isNumeric().withMessage('Length must be a number'),
    body('soilType').optional().trim(),
    body('sunlight').optional().trim(),
    body('description').optional().trim(),
  ],
  
  // Plant validation
  plant: [
    body('name').trim().notEmpty().withMessage('Plant name is required'),
    body('scientificName').optional().trim(),
    body('plantingDepth').optional().isNumeric().withMessage('Planting depth must be a number'),
    body('spacing').optional().isNumeric().withMessage('Spacing must be a number'),
    body('daysToMaturity').optional().isNumeric().withMessage('Days to maturity must be a number'),
  ],
  
  // Task validation
  task: [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
    body('description').optional().trim(),
    body('completed').optional().isBoolean().withMessage('Completed must be a boolean'),
  ],
  
  // Auth validation
  register: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('zipCode').optional().trim(),
  ],
  
  login: [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  
  // ID parameter validation
  idParam: [
    param('id').isMongoId().withMessage('Invalid ID format'),
  ],
};

// Validation middleware factory
const validate = (schemas) => {
  return [
    ...(Array.isArray(schemas) ? schemas : [schemas]),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.array().map(err => ({
            field: err.param,
            message: err.msg
          }))
        });
      }
      next();
    }
  ];
};

module.exports = {
  validate,
  schemas: validationSchemas
};