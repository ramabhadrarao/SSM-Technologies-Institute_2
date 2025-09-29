const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { 
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true  // Remove unknown fields
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    next();
  };
};

// Enhanced phone validation pattern
const phonePattern = /^[+]?[\d\s\-()]{10,20}$/;

// Enhanced email validation pattern
const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// User validation schemas
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(emailPattern)
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.pattern.base': 'Email format is invalid',
      'any.required': 'Email is required'
    }),
    
  password: Joi.string()
    .min(6)
    .required()
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.pattern.base': 'Password must contain at least one letter and one number',
      'any.required': 'Password is required'
    }),
    
  firstName: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
      'string.pattern.base': 'First name can only contain letters',
      'any.required': 'First name is required'
    }),
    
  lastName: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
      'string.pattern.base': 'Last name can only contain letters',
      'any.required': 'Last name is required'
    }),
    
  phone: Joi.string()
    .pattern(phonePattern)
    .required()
    .custom((value, helpers) => {
      // Remove spaces, dashes, parentheses for validation
      const cleanPhone = value.replace(/[\s\-()]/g, '');
      
      // Check if it has valid length (10-15 digits)
      if (!/^\+?\d{10,15}$/.test(cleanPhone)) {
        return helpers.error('string.pattern.base');
      }
      
      return value;
    })
    .messages({
      'string.pattern.base': 'Please provide a valid phone number (10-15 digits)',
      'any.required': 'Phone number is required'
    }),
    
  whatsapp: Joi.string()
    .pattern(phonePattern)
    .allow('')
    .optional()
    .custom((value, helpers) => {
      // Skip validation if empty
      if (!value || value.trim() === '') {
        return value;
      }
      
      // Remove spaces, dashes, parentheses for validation
      const cleanPhone = value.replace(/[\s\-()]/g, '');
      
      // Check if it has valid length (10-15 digits)
      if (!/^\+?\d{10,15}$/.test(cleanPhone)) {
        return helpers.error('string.pattern.base');
      }
      
      return value;
    })
    .messages({
      'string.pattern.base': 'Please provide a valid WhatsApp number (10-15 digits)'
    }),
    
  role: Joi.string()
    .valid('student', 'instructor')
    .required()
    .messages({
      'any.only': 'Role must be either student or instructor',
      'any.required': 'Role is required'
    })
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
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
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .pattern(/^[a-zA-Z\s]+$/)
    .optional()
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
      'string.pattern.base': 'First name can only contain letters'
    }),
    
  lastName: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .pattern(/^[a-zA-Z\s]+$/)
    .optional()
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
      'string.pattern.base': 'Last name can only contain letters'
    }),
    
  phone: Joi.string()
    .pattern(phonePattern)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),
    
  whatsapp: Joi.string()
    .pattern(phonePattern)
    .allow('')
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid WhatsApp number'
    })
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
    
  newPassword: Joi.string()
    .min(6)
    .required()
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
    .invalid(Joi.ref('currentPassword'))
    .messages({
      'string.min': 'New password must be at least 6 characters long',
      'string.pattern.base': 'New password must contain at least one letter and one number',
      'any.invalid': 'New password must be different from current password',
      'any.required': 'New password is required'
    })
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
});

const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Reset token is required'
    }),
    
  newPassword: Joi.string()
    .min(6)
    .required()
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.pattern.base': 'Password must contain at least one letter and one number',
      'any.required': 'New password is required'
    })
});

// Course validation schemas
const courseSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Course name must be at least 3 characters',
      'string.max': 'Course name cannot exceed 100 characters',
      'any.required': 'Course name is required'
    }),
    
  description: Joi.string()
    .min(10)
    .required()
    .messages({
      'string.min': 'Description must be at least 10 characters',
      'any.required': 'Description is required'
    }),
    
  fees: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Course fees cannot be negative',
      'any.required': 'Course fees is required'
    }),
    
  duration: Joi.string()
    .required()
    .messages({
      'any.required': 'Course duration is required'
    }),
    
  structure: Joi.array()
    .items(Joi.string())
    .optional(),
    
  subjects: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
    .messages({
      'string.pattern.base': 'Invalid subject ID format'
    })
});

// Subject validation schemas
const subjectSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Subject name must be at least 3 characters',
      'string.max': 'Subject name cannot exceed 100 characters',
      'any.required': 'Subject name is required'
    }),
    
  description: Joi.string()
    .min(10)
    .required()
    .messages({
      'string.min': 'Description must be at least 10 characters',
      'any.required': 'Description is required'
    }),
    
  course: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .allow(null, '')
    .optional()
    .messages({
      'string.pattern.base': 'Invalid course ID format'
    })
});

// Instructor validation schemas
const instructorSchema = Joi.object({
  bio: Joi.string()
    .min(50)
    .required()
    .messages({
      'string.min': 'Bio must be at least 50 characters',
      'any.required': 'Bio is required'
    }),
    
  designation: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Designation must be at least 3 characters',
      'string.max': 'Designation cannot exceed 100 characters',
      'any.required': 'Designation is required'
    }),
    
  experience: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Experience cannot be negative',
      'any.required': 'Experience is required'
    }),
    
  skills: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional(),
    
  specializations: Joi.array()
    .items(Joi.string())
    .optional(),
    
  education: Joi.array()
    .items(Joi.object({
      degree: Joi.string().required(),
      institution: Joi.string().required(),
      year: Joi.number().integer().min(1950).max(new Date().getFullYear()).required(),
      grade: Joi.string().optional()
    }))
    .optional(),
    
  socialLinks: Joi.object({
    linkedin: Joi.string().uri().allow('').optional(),
    github: Joi.string().uri().allow('').optional(),
    website: Joi.string().uri().allow('').optional(),
    twitter: Joi.string().uri().allow('').optional()
  }).optional()
});

// Batch validation schemas
const batchSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Batch name must be at least 3 characters',
      'string.max': 'Batch name cannot exceed 100 characters',
      'any.required': 'Batch name is required'
    }),
    
  course: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid course ID format',
      'any.required': 'Course is required'
    }),
    
  instructor: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid instructor ID format',
      'any.required': 'Instructor is required'
    }),
    
  maxStudents: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .required()
    .messages({
      'number.min': 'Batch must have at least 1 student capacity',
      'number.max': 'Batch cannot exceed 100 students',
      'any.required': 'Maximum students is required'
    }),
    
  startDate: Joi.date()
    .min('now')
    .required()
    .messages({
      'date.min': 'Start date cannot be in the past',
      'any.required': 'Start date is required'
    }),
    
  endDate: Joi.date()
    .greater(Joi.ref('startDate'))
    .required()
    .messages({
      'date.greater': 'End date must be after start date',
      'any.required': 'End date is required'
    }),
    
  schedule: Joi.array()
    .items(Joi.object({
      dayOfWeek: Joi.number().integer().min(0).max(6).required(),
      startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      subject: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional()
    }))
    .required()
    .messages({
      'any.required': 'Schedule is required'
    })
});

// Contact message validation schemas
const contactMessageSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Name must be at least 3 characters',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
    
  email: Joi.string()
    .email()
    .pattern(emailPattern)
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.pattern.base': 'Email format is invalid',
      'any.required': 'Email is required'
    }),
    
  phone: Joi.string()
    .pattern(phonePattern)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
      'any.required': 'Phone number is required'
    }),
    
  subject: Joi.string()
    .min(5)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.min': 'Subject must be at least 5 characters',
      'string.max': 'Subject cannot exceed 200 characters',
      'any.required': 'Subject is required'
    }),
    
  message: Joi.string()
    .min(10)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Message must be at least 10 characters',
      'string.max': 'Message cannot exceed 2000 characters',
      'any.required': 'Message is required'
    }),
    
  captchaToken: Joi.string()
    .required()
    .messages({
      'any.required': 'CAPTCHA verification is required'
    }),
    
  formStartTime: Joi.string()
    .required()
    .messages({
      'any.required': 'Form submission time is required'
    }),
    
  // Honeypot fields (should be empty)
  website: Joi.string().allow('').optional(),
  url: Joi.string().allow('').optional(),
  link: Joi.string().allow('').optional(),
  
  agreeToTerms: Joi.boolean().optional()
});

// Skill validation schemas
const skillSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Skill name must be at least 2 characters',
      'string.max': 'Skill name cannot exceed 50 characters',
      'any.required': 'Skill name is required'
    }),
    
  description: Joi.string()
    .max(200)
    .allow('')
    .optional(),
    
  category: Joi.string()
    .valid('programming', 'design', 'marketing', 'business', 'data-science', 'other')
    .optional(),
    
  level: Joi.string()
    .valid('beginner', 'intermediate', 'advanced')
    .optional()
});

// Team member validation schemas
const teamMemberSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Name must be at least 3 characters',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
    
  designation: Joi.string()
    .min(3)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Designation must be at least 3 characters',
      'string.max': 'Designation cannot exceed 100 characters',
      'any.required': 'Designation is required'
    }),
    
  bio: Joi.string()
    .min(20)
    .required()
    .messages({
      'string.min': 'Bio must be at least 20 characters',
      'any.required': 'Bio is required'
    }),
    
  department: Joi.string()
    .valid('Leadership', 'Academic', 'Technical', 'Administration', 'Marketing')
    .optional(),
    
  experience: Joi.string()
    .allow('')
    .optional(),
    
  email: Joi.string()
    .email()
    .allow('')
    .optional(),
    
  phone: Joi.string()
    .pattern(phonePattern)
    .allow('')
    .optional(),
    
  order: Joi.number()
    .integer()
    .min(0)
    .optional(),
    
  isActive: Joi.boolean()
    .optional(),
    
  socialLinks: Joi.string()
    .allow('')
    .optional()
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  courseSchema,
  subjectSchema,
  instructorSchema,
  batchSchema,
  contactMessageSchema,
  skillSchema,
  teamMemberSchema
};