const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details[0].message;
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: errorMessage
      });
    }
    
    next();
  };
};

// User validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: Joi.string().pattern(/^[+]?[\d\s-()]+$/).required(),
  whatsapp: Joi.string().pattern(/^[+]?[\d\s-()]+$/).optional(),
  role: Joi.string().valid('student', 'instructor').default('student')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().pattern(/^[+]?[\d\s-()]+$/).optional(),
  whatsapp: Joi.string().pattern(/^[+]?[\d\s-()]+$/).optional()
});

// Course validation schemas
const courseSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).required(),
  fees: Joi.number().min(0).required(),
  duration: Joi.string().required(),
  structure: Joi.array().items(Joi.string()).optional(),
  subjects: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).optional()
});

// Subject validation schemas
const subjectSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).required(),
  course: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional()
});

// Instructor validation schemas
const instructorSchema = Joi.object({
  bio: Joi.string().min(50).required(),
  designation: Joi.string().min(3).max(100).required(),
  experience: Joi.number().min(0).required(),
  skills: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).optional(),
  specializations: Joi.array().items(Joi.string()).optional(),
  education: Joi.array().items(Joi.object({
    degree: Joi.string().required(),
    institution: Joi.string().required(),
    year: Joi.number().integer().min(1950).max(new Date().getFullYear()).required(),
    grade: Joi.string().optional()
  })).optional(),
  socialLinks: Joi.object({
    linkedin: Joi.string().uri().optional(),
    github: Joi.string().uri().optional(),
    website: Joi.string().uri().optional(),
    twitter: Joi.string().uri().optional()
  }).optional()
});

// Batch validation schemas
const batchSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  course: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  instructor: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  maxStudents: Joi.number().integer().min(1).max(100).required(),
  startDate: Joi.date().min('now').required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  schedule: Joi.array().items(Joi.object({
    dayOfWeek: Joi.number().integer().min(0).max(6).required(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    subject: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional()
  })).required()
});

// Slider validation schemas
const sliderSchema = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().min(10).max(500).required(),
  buttonText: Joi.string().max(50).optional(),
  buttonLink: Joi.string().uri().optional(),
  order: Joi.number().integer().min(0).optional()
});

// About member validation schemas
const aboutMemberSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  designation: Joi.string().min(3).max(100).required(),
  bio: Joi.string().min(50).required(),
  order: Joi.number().integer().min(0).optional(),
  socialLinks: Joi.object({
    linkedin: Joi.string().uri().optional(),
    twitter: Joi.string().uri().optional(),
    facebook: Joi.string().uri().optional(),
    instagram: Joi.string().uri().optional()
  }).optional()
});

// Contact message validation schemas
const contactMessageSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[+]?[\d\s-()]+$/).required(),
  subject: Joi.string().min(5).max(200).required(),
  message: Joi.string().min(10).max(2000).required(),
  captchaToken: Joi.string().required(),
  formStartTime: Joi.string().required(),
  // Honeypot fields (should be empty)
  website: Joi.string().allow('').optional(),
  url: Joi.string().allow('').optional(),
  link: Joi.string().allow('').optional()
});

// Skill validation schemas
const skillSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(200).optional(),
  category: Joi.string().valid('programming', 'design', 'marketing', 'business', 'data-science', 'other').optional(),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced').optional()
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  courseSchema,
  subjectSchema,
  instructorSchema,
  batchSchema,
  sliderSchema,
  aboutMemberSchema,
  contactMessageSchema,
  skillSchema
};