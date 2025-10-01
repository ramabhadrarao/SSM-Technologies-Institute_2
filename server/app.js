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
const contactRoutes = require('./routes/contact');
const teamRoutes = require('./routes/team');
const skillRoutes = require('./routes/skills');
const uploadRoutes = require('./routes/upload');
const enrollmentRoutes = require('./routes/enrollments');
const materialRoutes = require('./routes/materials');
const sliderRoutes = require('./routes/sliders');
const settingsRoutes = require('./routes/settings');

const app = express();

// Connect to database
database.connect().catch(console.error);

// Trust proxy - IMPORTANT for production behind Nginx
app.set('trust proxy', 1);

// Security middleware
app.use(securityHeaders);

// CORS configuration
const corsOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://www.ssmtechnologies.co.in', 'https://ssmtechnologies.co.in', 'http://localhost:5173', 'http://127.0.0.1:5173']
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
} else {
  // Production logging format
  app.use(morgan('combined'));
}
app.use(requestLogger);

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SSM Technologies API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: database.isHealthy() ? 'connected' : 'disconnected',
    nodeVersion: process.version,
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/sliders', sliderRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
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

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const PORT = process.env.PORT || 3001;

// Simple HTTP server - Nginx handles HTTPS
app.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 SSM Technologies API Server Started');
  console.log('========================================');
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔌 Port: ${PORT}`);
  console.log(`🌐 Backend URL: ${process.env.BACKEND_URL}`);
  console.log(`🎨 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🔐 CORS Origin: ${corsOrigins.join(', ')}`);
  console.log(`💾 Database: ${database.isHealthy() ? '✅ Connected' : '❌ Disconnected'}`);
  console.log(`⚡ Node Version: ${process.version}`);
  console.log('========================================');
  console.log('📚 Available API Routes:');
  console.log('   GET  /health - Health check');
  console.log('   POST /api/auth/register - User registration');
  console.log('   POST /api/auth/login - User login');
  console.log('   GET  /api/courses - Get all courses');
  console.log('   GET  /api/subjects - Get all subjects');
  console.log('   GET  /api/dashboard/admin - Admin dashboard');
  console.log('   GET  /api/dashboard/student - Student dashboard');
  console.log('   GET  /api/dashboard/instructor - Instructor dashboard');
  console.log('   GET  /api/admin/users - Admin user management');
  console.log('   GET  /api/admin/courses - Admin course management');
  console.log('   GET  /api/admin/batches - Admin batch management');
  console.log('   GET  /api/admin/messages - Admin message management');
  console.log('   GET  /api/admin/analytics/* - Admin analytics & reports');
  console.log('   GET  /api/admin/settings - Admin system settings');
  console.log('   POST /api/contact - Public contact form');
  console.log('   GET  /api/team - Public team members');
  console.log('   GET  /api/sliders/active - Active sliders');
  console.log('========================================');
  console.log('✅ Server is ready to accept connections');
  console.log('========================================');
});

module.exports = app;