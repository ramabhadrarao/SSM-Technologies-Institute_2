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

const app = express();

// Connect to database
database.connect().catch(console.error);

// Security middleware
app.use(securityHeaders);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

module.exports = app;