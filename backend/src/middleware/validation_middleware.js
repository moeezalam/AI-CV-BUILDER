const Joi = require('joi');
const { ValidationError } = require('./error_handler_middleware');

// Validation schemas
const schemas = {
  // Authentication schemas
  userRegistration: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required'
      }),
    firstName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters',
        'any.required': 'First name is required'
      }),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters',
        'any.required': 'Last name is required'
      })
  }),

  userLogin: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  }),

  passwordResetRequest: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      })
  }),

  passwordReset: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Reset token is required'
      }),
    password: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required'
      })
  }),

  passwordChange: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required'
      }),
    newPassword: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'New password is required'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required'
      })
  }),

  profileUpdate: Joi.object({
    firstName: Joi.string()
      .min(2)
      .max(50)
      .messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters'
      }),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters'
      })
  }),

  emailCheck: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      })
  }),

  jobDescription: Joi.object({
    title: Joi.string().required().max(150).trim(),
    company: Joi.string().required().max(100).trim(),
    description: Joi.string().required().min(50),
    location: Joi.string().max(100),
    salary_range: Joi.string().max(50),
    job_type: Joi.string().valid('full-time', 'part-time', 'contract', 'internship', 'remote').default('full-time'),
    experience_level: Joi.string().valid('entry', 'mid', 'senior', 'lead', 'executive')
  }),

  keywordAnalysis: Joi.object({
    userProfile: Joi.object().required(),
    jobKeywords: Joi.array().items(
      Joi.alternatives().try(
        Joi.string(),
        Joi.object({
          keyword: Joi.string().required(),
          weight: Joi.number().min(0).max(1).default(1),
          category: Joi.string().default('general')
        })
      )
    ).required()
  }),

  tailorContent: Joi.object({
    userProfile: Joi.object({
      personal: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string(),
        linkedIn: Joi.string().uri(),
        location: Joi.string()
      }).required(),
      work_experience: Joi.array().items(Joi.object()).required(),
      skills: Joi.array().items(Joi.object()),
      education: Joi.array().items(Joi.object()),
      projects: Joi.array().items(Joi.object())
    }).required(),
    jobDescription: Joi.object({
      title: Joi.string().required(),
      company: Joi.string().required(),
      description: Joi.string().required(),
      keywords: Joi.array().items(Joi.alternatives().try(Joi.string(), Joi.object()))
    }).required()
  }),

  generateSummary: Joi.object({
    userProfile: Joi.object().required(),
    jobDescription: Joi.object().required(),
    keywords: Joi.array().items(Joi.string()).required()
  }),

  enhanceExperience: Joi.object({
    experiences: Joi.array().items(
      Joi.object({
        company: Joi.string().required(),
        role: Joi.string().required(),
        bullets: Joi.array().items(Joi.string()).required()
      })
    ).required(),
    keywords: Joi.array().items(Joi.string()).required()
  }),

  optimizeContent: Joi.object({
    content: Joi.object().required(),
    jobKeywords: Joi.array().items(Joi.string()).required(),
    targetScore: Joi.number().min(0).max(100).default(80)
  }),

  renderCV: Joi.object({
    cvData: Joi.object({
      personal: Joi.object().required(),
      summary: Joi.string(),
      skills: Joi.array().items(Joi.string()),
      experience: Joi.array().items(Joi.object()),
      projects: Joi.array().items(Joi.object()),
      education: Joi.array().items(Joi.object())
    }).required(),
    template: Joi.string().valid('modern', 'classic').default('modern'),
    options: Joi.object({
      fontSize: Joi.number().min(8).max(14).default(11),
      margins: Joi.string().valid('narrow', 'normal', 'wide').default('normal'),
      colorScheme: Joi.string().valid('blue', 'black', 'green', 'red').default('blue')
    }).default({})
  }),

  batchKeywords: Joi.object({
    jobDescriptions: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        title: Joi.string().required(),
        description: Joi.string().required()
      })
    ).min(1).max(10).required()
  })
};

/**
 * Validation middleware factory
 * @param {string} schemaName - Name of the schema to validate against
 * @returns {Function} Express middleware function
 */
const validateRequest = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    
    if (!schema) {
      return next(new ValidationError(`Unknown validation schema: ${schemaName}`));
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return next(new ValidationError('Validation failed', details));
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

/**
 * Validate query parameters
 * @param {Joi.Schema} schema - Joi schema for query validation
 * @returns {Function} Express middleware function
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return next(new ValidationError('Query validation failed', details));
    }

    req.query = value;
    next();
  };
};

/**
 * Validate URL parameters
 * @param {Joi.Schema} schema - Joi schema for params validation
 * @returns {Function} Express middleware function
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return next(new ValidationError('Parameter validation failed', details));
    }

    req.params = value;
    next();
  };
};

module.exports = {
  validateRequest,
  validateQuery,
  validateParams,
  schemas
};