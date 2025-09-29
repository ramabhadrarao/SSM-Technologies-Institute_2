const { RateLimiterMemory, RateLimiterRedis } = require('rate-limiter-flexible');
const crypto = require('crypto');

// Enhanced rate limiters for contact form
const contactRateLimiters = {
  // Per IP - Very strict for contact form
  perIP: new RateLimiterMemory({
    keyGenerator: (req) => req.ip,
    points: 3, // 3 attempts
    duration: 3600, // 1 hour
    blockDuration: 3600, // Block for 1 hour
  }),

  // Per email - Prevent spam from same email
  perEmail: new RateLimiterMemory({
    keyGenerator: (req) => req.body.email?.toLowerCase() || req.ip,
    points: 2, // 2 messages per email
    duration: 3600, // 1 hour
    blockDuration: 1800, // Block for 30 minutes
  }),

  // Per phone - Prevent spam from same phone
  perPhone: new RateLimiterMemory({
    keyGenerator: (req) => req.body.phone || req.ip,
    points: 2, // 2 messages per phone
    duration: 3600, // 1 hour
    blockDuration: 1800, // Block for 30 minutes
  }),

  // Global rate limiter - Prevent system overload
  global: new RateLimiterMemory({
    keyGenerator: () => 'global',
    points: 50, // 50 total messages per hour globally
    duration: 3600, // 1 hour
  }),

  // Suspicious activity detector
  suspicious: new RateLimiterMemory({
    keyGenerator: (req) => req.ip,
    points: 10, // 10 failed attempts
    duration: 86400, // 24 hours
    blockDuration: 86400, // Block for 24 hours
  })
};

// Honeypot field validation
const validateHoneypot = (req, res, next) => {
  // Check for honeypot field (should be empty)
  if (req.body.website || req.body.url || req.body.link) {
    console.log(`🚨 Honeypot triggered from IP: ${req.ip}`);
    
    // Silently fail - don't let bot know it was detected
    return res.json({
      success: true,
      message: 'Message sent successfully'
    });
  }
  next();
};

// Content validation and spam detection
const validateContent = (req, res, next) => {
  const { name, email, phone, subject, message } = req.body;
  
  // Spam keywords detection
  const spamKeywords = [
    'viagra', 'casino', 'lottery', 'winner', 'congratulations',
    'click here', 'free money', 'make money fast', 'work from home',
    'bitcoin', 'cryptocurrency', 'investment opportunity', 'loan',
    'weight loss', 'diet pills', 'enlargement', 'dating',
    'seo services', 'website promotion', 'backlinks'
  ];
  
  const fullText = `${name} ${email} ${subject} ${message}`.toLowerCase();
  const spamScore = spamKeywords.filter(keyword => fullText.includes(keyword)).length;
  
  if (spamScore >= 2) {
    console.log(`🚨 Spam detected from IP: ${req.ip}, Score: ${spamScore}`);
    
    // Log suspicious activity
    contactRateLimiters.suspicious.consume(req.ip).catch(() => {});
    
    return res.status(400).json({
      success: false,
      message: 'Message content appears to be spam'
    });
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /(.)\1{4,}/, // Repeated characters (aaaaa)
    /[A-Z]{10,}/, // Too many uppercase letters
    /\d{10,}/, // Too many consecutive numbers
    /https?:\/\/[^\s]+/gi, // Multiple URLs
  ];
  
  const suspiciousCount = suspiciousPatterns.filter(pattern => pattern.test(fullText)).length;
  
  if (suspiciousCount >= 2) {
    console.log(`🚨 Suspicious patterns detected from IP: ${req.ip}`);
    
    return res.status(400).json({
      success: false,
      message: 'Message content contains suspicious patterns'
    });
  }
  
  // Validate message length and quality
  if (message.length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Message is too short. Please provide more details.'
    });
  }
  
  if (message.length > 2000) {
    return res.status(400).json({
      success: false,
      message: 'Message is too long. Please keep it under 2000 characters.'
    });
  }
  
  next();
};

// Enhanced rate limiting middleware
const enhancedContactRateLimit = async (req, res, next) => {
  try {
    const ip = req.ip;
    const email = req.body.email?.toLowerCase();
    const phone = req.body.phone;
    
    // Check all rate limiters
    await Promise.all([
      contactRateLimiters.perIP.consume(ip),
      contactRateLimiters.perEmail.consume(email || ip),
      contactRateLimiters.perPhone.consume(phone || ip),
      contactRateLimiters.global.consume('global')
    ]);
    
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    
    console.log(`🚨 Rate limit exceeded from IP: ${req.ip}`);
    
    return res.status(429).json({
      success: false,
      message: 'Too many contact attempts. Please try again later.',
      retryAfter: secs,
      blockedUntil: new Date(Date.now() + rejRes.msBeforeNext).toISOString()
    });
  }
};

// CAPTCHA validation (server-side verification)
// CAPTCHA validation (server-side verification)
const validateCaptcha = async (req, res, next) => {
  const { captchaToken } = req.body;
  
  if (!captchaToken) {
    return res.status(400).json({
      success: false,
      message: 'CAPTCHA verification is required'
    });
  }
  
  try {
    // Verify reCAPTCHA with Google
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error('❌ reCAPTCHA secret key not configured');
      // In development, you might want to skip CAPTCHA
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ CAPTCHA verification skipped in development mode');
        return next();
      }
      return res.status(500).json({
        success: false,
        message: 'CAPTCHA verification service unavailable'
      });
    }
    
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify`;
    const response = await fetch(verificationURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${captchaToken}&remoteip=${req.ip}`
    });
    
    const verificationResult = await response.json();
    
    console.log('CAPTCHA verification result:', verificationResult); // Debug log
    
    if (!verificationResult.success) {
      console.log(`🚨 CAPTCHA verification failed from IP: ${req.ip}`);
      console.log('Error codes:', verificationResult['error-codes']);
      
      // Log suspicious activity
      contactRateLimiters.suspicious.consume(req.ip).catch(() => {});
      
      return res.status(400).json({
        success: false,
        message: 'CAPTCHA verification failed. Please try again.'
      });
    }
    
    // Check CAPTCHA score (v3 only, v2 doesn't have score)
    if (verificationResult.score && verificationResult.score < 0.5) {
      console.log(`🚨 Low CAPTCHA score from IP: ${req.ip}, Score: ${verificationResult.score}`);
      
      return res.status(400).json({
        success: false,
        message: 'Security verification failed. Please try again.'
      });
    }
    
    console.log('✅ CAPTCHA verified successfully');
    next();
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'CAPTCHA verification service error'
    });
  }
};
// Alternative CAPTCHA validation (for when reCAPTCHA is not available)
const validateAlternativeCaptcha = (req, res, next) => {
  const { captchaToken } = req.body;
  
  if (!captchaToken) {
    return res.status(400).json({
      success: false,
      message: 'CAPTCHA verification is required'
    });
  }

  // Check if it's an alternative CAPTCHA
  if (captchaToken.startsWith('alternative-captcha-')) {
    console.log('✅ Alternative CAPTCHA used:', captchaToken);
    // Alternative CAPTCHAs are already verified on frontend
    // Additional server-side checks can be added here if needed
    return next();
  }

  // If it's a Google reCAPTCHA token, continue with normal validation
  next();
};

// Enhanced CAPTCHA validation with fallback support
const validateCaptcha = async (req, res, next) => {
  const { captchaToken } = req.body;
  
  if (!captchaToken) {
    return res.status(400).json({
      success: false,
      message: 'CAPTCHA verification is required'
    });
  }

  try {
    // Check if it's an alternative CAPTCHA (frontend-verified)
    if (captchaToken.startsWith('alternative-captcha-')) {
      const captchaType = captchaToken.split('-')[2]; // math, slider, puzzle, text, time
      console.log(`✅ Alternative CAPTCHA verified (${captchaType})`);
      
      // Log for monitoring
      console.log({
        type: 'alternative-captcha',
        method: captchaType,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });
      
      return next();
    }

    // Google reCAPTCHA verification
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    if (!secretKey) {
      console.error('❌ reCAPTCHA secret key not configured');
      
      // In development, allow alternative CAPTCHAs
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ CAPTCHA verification skipped in development mode');
        return next();
      }
      
      return res.status(500).json({
        success: false,
        message: 'CAPTCHA verification service unavailable'
      });
    }
    
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify`;
    const response = await fetch(verificationURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${captchaToken}&remoteip=${req.ip}`
    });
    
    const verificationResult = await response.json();
    
    console.log('CAPTCHA verification result:', verificationResult);
    
    if (!verificationResult.success) {
      console.log(`🚨 CAPTCHA verification failed from IP: ${req.ip}`);
      console.log('Error codes:', verificationResult['error-codes']);
      
      // Log suspicious activity
      contactRateLimiters.suspicious.consume(req.ip).catch(() => {});
      
      return res.status(400).json({
        success: false,
        message: 'CAPTCHA verification failed. Please try again.'
      });
    }
    
    console.log('✅ Google reCAPTCHA verified successfully');
    next();
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    
    // In development, allow through on error
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ CAPTCHA verification error in development, allowing through');
      return next();
    }
    
    return res.status(500).json({
      success: false,
      message: 'CAPTCHA verification service error'
    });
  }
};
// IP geolocation and blocking
const checkIPReputation = async (req, res, next) => {
  const ip = req.ip;
  
  // List of blocked countries/regions (if needed)
  const blockedCountries = process.env.BLOCKED_COUNTRIES?.split(',') || [];
  
  // Check if IP is from localhost or private network
  const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.');
  
  if (isLocalhost) {
    return next(); // Allow localhost for development
  }
  
  // In production, you might want to integrate with IP reputation services
  // For now, we'll just log the IP for monitoring
  console.log(`📍 Contact form access from IP: ${ip}`);
  
  next();
};

// Request fingerprinting for additional security
const generateRequestFingerprint = (req, res, next) => {
  const fingerprint = crypto.createHash('sha256')
    .update(req.ip + req.get('User-Agent') + req.get('Accept-Language'))
    .digest('hex');
  
  req.fingerprint = fingerprint;
  next();
};

// Time-based validation (prevent automated submissions)
const validateSubmissionTiming = (req, res, next) => {
  const { formStartTime } = req.body;
  
  if (!formStartTime) {
    return res.status(400).json({
      success: false,
      message: 'Invalid form submission'
    });
  }
  
  const startTime = parseInt(formStartTime);
  const currentTime = Date.now();
  const timeDiff = currentTime - startTime;
  
  // Form filled too quickly (likely bot)
  if (timeDiff < 5000) { // Less than 5 seconds
    console.log(`🚨 Form submitted too quickly from IP: ${req.ip}, Time: ${timeDiff}ms`);
    
    return res.status(400).json({
      success: false,
      message: 'Please take more time to fill out the form'
    });
  }
  
  // Form took too long (session might be compromised)
  if (timeDiff > 1800000) { // More than 30 minutes
    return res.status(400).json({
      success: false,
      message: 'Form session expired. Please refresh and try again.'
    });
  }
  
  next();
};

// Enhanced input sanitization
const enhancedSanitization = (req, res, next) => {
  const sanitizeField = (value) => {
    if (typeof value !== 'string') return value;
    
    return value
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframes
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/data:text\/html/gi, '') // Remove data URLs
      .substring(0, 2000); // Limit length
  };
  
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeField(req.body[key]);
      }
    });
  }
  
  next();
};

// Security headers for contact endpoints
const contactSecurityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

module.exports = {
  contactRateLimiters,
  validateHoneypot,
  validateContent,
  enhancedContactRateLimit,
  validateCaptcha,
  validateAlternativeCaptcha,
  checkIPReputation,
  generateRequestFingerprint,
  validateSubmissionTiming,
  enhancedSanitization,
  contactSecurityHeaders
};