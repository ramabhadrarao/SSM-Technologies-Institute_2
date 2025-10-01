require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const database = require('./config/database');
const { securityHeaders, sanitizeInput, requestLogger, errorHandler } = require('./middleware/security');

// Import routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const subjectRoutes = require('./routes/subjects');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact'); // New public contact route
const teamRoutes = require('./routes/team'); // Public team routes
const skillRoutes = require('./routes/skills');
const uploadRoutes = require('./routes/upload'); // General upload routes
const enrollmentRoutes = require('./routes/enrollments'); // Student enrollment routes
const materialRoutes = require('./routes/materials'); // Course materials routes
const sliderRoutes = require('./routes/sliders'); // Slider management routes
const settingsRoutes = require('./routes/settings'); // Public settings routes
const app = express();

// Connect to database
database.connect().catch(console.error);

// Security middleware
app.use(securityHeaders);

// CORS configuration
const corsOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://www.ssmtechnologies.co.in', 'https://ssmtechnologies.co.in']
  : [process.env.CORS_ORIGIN || 'http://localhost:5173'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware - Skip for multipart/form-data
app.use((req, res, next) => {
  if (req.get('Content-Type')?.includes('multipart/form-data')) {
    // Skip body parsing for multipart/form-data - let Multer handle it
    return next();
  }
  // Apply JSON and URL-encoded parsing for other content types
  express.json({ limit: '10mb' })(req, res, next);
});

app.use((req, res, next) => {
  if (req.get('Content-Type')?.includes('multipart/form-data')) {
    // Skip body parsing for multipart/form-data - let Multer handle it
    return next();
  }
  // Apply URL-encoded parsing for other content types
  express.urlencoded({ extended: true, limit: '10mb' })(req, res, next);
});

// Apply sanitization after JSON parsing
app.use(sanitizeInput);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Static file serving
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SSM Technologies API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: database.isHealthy() ? 'connected' : 'disconnected'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes); // Public contact form
app.use('/api/team', teamRoutes); // Public team members
app.use('/api/skills', skillRoutes);
app.use('/api/upload', uploadRoutes); // General file upload
app.use('/api/enrollments', enrollmentRoutes); // Student enrollment
app.use('/api/materials', materialRoutes); // Course materials
app.use('/api/sliders', sliderRoutes); // Slider management
app.use('/api/settings', settingsRoutes); // Public settings
// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await database.disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 3001;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;

// HTTPS Configuration for production
if (process.env.NODE_ENV === 'production') {
  const https = require('https');
  const fs = require('fs');
  
  try {
    // SSL Certificate paths - update these paths according to your SSL certificate location
    const sslOptions = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH || '/etc/ssl/private/server.key'),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH || '/etc/ssl/certs/server.crt'),
      // If you have a certificate chain file (intermediate certificates)
      ...(process.env.SSL_CA_PATH && { ca: fs.readFileSync(process.env.SSL_CA_PATH) })
    };

    // Create HTTPS server
    const httpsServer = https.createServer(sslOptions, app);
    
    httpsServer.listen(HTTPS_PORT, () => {
      console.log(`🔒 SSM Technologies HTTPS API server running on port ${HTTPS_PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN}`);
      console.log(`🔐 SSL/TLS: Enabled`);
      console.log(`📚 Available routes:`);
      console.log(`   GET  /health - Health check`);
      console.log(`   POST /api/auth/register - User registration`);
      console.log(`   POST /api/auth/login - User login`);
      console.log(`   GET  /api/courses - Get all courses`);
      console.log(`   GET  /api/subjects - Get all subjects`);
      console.log(`   GET  /api/dashboard/admin - Admin dashboard`);
      console.log(`   GET  /api/dashboard/student - Student dashboard`);
      console.log(`   GET  /api/dashboard/instructor - Instructor dashboard`);
      console.log(`   GET  /api/admin/users - Admin user management`);
      console.log(`   GET  /api/admin/courses - Admin course management`);
      console.log(`   GET  /api/admin/batches - Admin batch management`);
      console.log(`   GET  /api/admin/messages - Admin message management`);
      console.log(`   GET  /api/admin/analytics/* - Admin analytics & reports`);
      console.log(`   GET  /api/admin/settings - Admin system settings`);
      console.log(`   POST /api/contact - Public contact form`);
    });

    // Optional: Redirect HTTP to HTTPS
    if (process.env.REDIRECT_HTTP_TO_HTTPS === 'true') {
      const http = require('http');
      const httpApp = express();
      
      httpApp.use((req, res) => {
        const httpsUrl = `https://${req.headers.host}${req.url}`;
        res.redirect(301, httpsUrl);
      });
      
      httpApp.listen(PORT, () => {
        console.log(`🔄 HTTP to HTTPS redirect server running on port ${PORT}`);
      });
    }

  } catch (error) {
    console.error('❌ SSL Certificate Error:', error.message);
    console.log('📝 Falling back to HTTP server...');
    console.log('💡 To enable HTTPS, ensure SSL certificates are properly configured:');
    console.log('   - Set SSL_KEY_PATH environment variable');
    console.log('   - Set SSL_CERT_PATH environment variable');
    console.log('   - Optionally set SSL_CA_PATH for certificate chain');
    
    // Fallback to HTTP
    app.listen(PORT, () => {
      console.log(`⚠️  SSM Technologies HTTP API server running on port ${PORT} (HTTPS failed)`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN}`);
    });
  }
} else {
  // Development server (HTTP)
  app.listen(PORT, () => {
    console.log(`🚀 SSM Technologies API server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN}`);
    console.log(`📚 Available routes:`);
    console.log(`   GET  /health - Health check`);
    console.log(`   POST /api/auth/register - User registration`);
    console.log(`   POST /api/auth/login - User login`);
    console.log(`   GET  /api/courses - Get all courses`);
    console.log(`   GET  /api/subjects - Get all subjects`);
    console.log(`   GET  /api/dashboard/admin - Admin dashboard`);
    console.log(`   GET  /api/dashboard/student - Student dashboard`);
    console.log(`   GET  /api/dashboard/instructor - Instructor dashboard`);
    console.log(`   GET  /api/admin/users - Admin user management`);
    console.log(`   GET  /api/admin/courses - Admin course management`);
    console.log(`   GET  /api/admin/batches - Admin batch management`);
    console.log(`   GET  /api/admin/messages - Admin message management`);
    console.log(`   GET  /api/admin/analytics/* - Admin analytics & reports`);
    console.log(`   GET  /api/admin/settings - Admin system settings`);
    console.log(`   POST /api/contact - Public contact form`);
  });
}

module.exports = app;