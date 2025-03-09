/**
 * Form validation utility functions
 */

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password validation regex - at least 8 chars, 1 uppercase, 1 lowercase, 1 number
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

// Form validation rules
const validate = {
  // String validators
  required: (value) => {
    if (!value) return 'This field is required';
    if (typeof value === 'string' && value.trim() === '') return 'This field is required';
    return null;
  },
  
  minLength: (min) => (value) => {
    if (!value) return null;
    if (value.length < min) return `Must be at least ${min} characters`;
    return null;
  },
  
  maxLength: (max) => (value) => {
    if (!value) return null;
    if (value.length > max) return `Must be at most ${max} characters`;
    return null;
  },
  
  email: (value) => {
    if (!value) return null;
    if (!EMAIL_REGEX.test(value)) return 'Invalid email address';
    return null;
  },
  
  password: (value) => {
    if (!value) return null;
    if (!PASSWORD_REGEX.test(value)) {
      return 'Password must be at least 8 characters and include uppercase, lowercase, and number';
    }
    return null;
  },
  
  // Matches another field (e.g., password confirmation)
  matches: (field, fieldName) => (value, formValues) => {
    if (!value) return null;
    if (value !== formValues[field]) return `Must match ${fieldName || field}`;
    return null;
  },
  
  // Number validators
  isNumber: (value) => {
    if (!value) return null;
    if (isNaN(Number(value))) return 'Must be a number';
    return null;
  },
  
  min: (min) => (value) => {
    if (!value) return null;
    if (Number(value) < min) return `Must be at least ${min}`;
    return null;
  },
  
  max: (max) => (value) => {
    if (!value) return null;
    if (Number(value) > max) return `Must be at most ${max}`;
    return null;
  },
  
  // Date validators
  isDate: (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) return 'Invalid date';
    return null;
  },
  
  dateAfter: (minDate, fieldName) => (value) => {
    if (!value) return null;
    const date = new Date(value);
    const min = new Date(minDate);
    if (date < min) return `Must be after ${fieldName || minDate}`;
    return null;
  },
  
  dateBefore: (maxDate, fieldName) => (value) => {
    if (!value) return null;
    const date = new Date(value);
    const max = new Date(maxDate);
    if (date > max) return `Must be before ${fieldName || maxDate}`;
    return null;
  },
  
  // Validate form using a schema
  validateForm: (values, schema) => {
    const errors = {};
    
    Object.keys(schema).forEach(field => {
      const fieldValidators = schema[field];
      
      if (Array.isArray(fieldValidators)) {
        for (const validator of fieldValidators) {
          const error = validator(values[field], values);
          if (error) {
            errors[field] = error;
            break;
          }
        }
      } else {
        const error = fieldValidators(values[field], values);
        if (error) {
          errors[field] = error;
        }
      }
    });
    
    return errors;
  }
};

export default validate;