# SSM Technologies Coaching Institute Management System

A comprehensive management system for coaching institutes built with React, Node.js, Express, and MongoDB.

## 🚀 Features

### For Students
- Course browsing and enrollment
- Interactive dashboard with progress tracking
- Assignment submission and grading
- Live class attendance
- Certificate generation
- Performance analytics

### For Instructors
- Course and batch management
- Student progress monitoring
- Class scheduling and attendance tracking
- Assignment creation and grading
- Performance analytics

### For Administrators
- Complete user management (students, instructors, admins)
- Course and subject management
- Batch scheduling and management
- Contact message handling with advanced security
- Comprehensive analytics and reporting
- System settings and configuration
- File upload management

## 🔒 Security Features

### Contact Form Security
- **reCAPTCHA Integration**: Google reCAPTCHA v2 verification
- **Advanced Rate Limiting**: Multiple layers of rate limiting
  - 3 messages per hour per IP
  - 2 messages per hour per email/phone
  - Global rate limiting
- **Spam Detection**: Keyword-based spam filtering
- **Honeypot Fields**: Hidden fields to catch bots
- **Content Validation**: Pattern detection for suspicious content
- **IP Reputation**: IP monitoring and blocking capabilities
- **Form Timing**: Prevents too-fast automated submissions
- **Input Sanitization**: XSS and injection prevention

### General Security
- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on all endpoints
- Input validation and sanitization
- File upload security
- CORS protection
- Security headers (Helmet.js)

## 🛠 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd ssm-technologies-institute
```

2. **Install backend dependencies**
```bash
cd server
npm install
```

3. **Environment Configuration**
```bash
# Copy the example environment file
cp ../.env.example .env

# Edit .env file with your configuration
```

4. **Required Environment Variables**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/ssm_technologies

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-here
REFRESH_TOKEN_SECRET=your-refresh-token-secret-here

# reCAPTCHA (Required for contact form)
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

5. **Start MongoDB**
```bash
# Make sure MongoDB is running
mongod
```

6. **Seed the database**
```bash
npm run seed
```

7. **Start the backend server**
```bash
npm run dev
```

### Frontend Setup

1. **Install frontend dependencies**
```bash
# From project root
npm install
```

2. **Environment Configuration**
```bash
# Create frontend environment file
echo "VITE_API_URL=http://localhost:3001/api" > .env
echo "VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key" >> .env
```

3. **Start the frontend development server**
```bash
npm run dev
```

## 🔑 Default Login Credentials

### Admin Access
- **Email**: admin@ssmtechnologies.co.in
- **Password**: Admin@123456

### Instructor Access
- **Email**: john.doe@ssmtech.com
- **Password**: Instructor@123

### Student Access
- **Email**: student1@example.com
- **Password**: Student@123

## 🌐 reCAPTCHA Setup

### 1. Get reCAPTCHA Keys
1. Go to [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Create a new site
3. Choose reCAPTCHA v2 "I'm not a robot" checkbox
4. Add your domains (localhost for development)
5. Get your Site Key and Secret Key

### 2. Configure Environment Variables
```env
# Backend (.env)
RECAPTCHA_SECRET_KEY=your-secret-key-here

# Frontend (.env)
VITE_RECAPTCHA_SITE_KEY=your-site-key-here
```

## 📁 Project Structure

```
ssm-technologies-institute/
├── server/                 # Backend API
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── scripts/          # Database scripts
│   └── app.js           # Express app
├── src/                  # Frontend React app
│   ├── components/       # Reusable components
│   ├── contexts/         # React contexts
│   ├── lib/             # Utilities and API client
│   ├── pages/           # Page components
│   └── types/           # TypeScript types
└── public/              # Static assets
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (admin/instructor)
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Subjects
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get subject details
- `POST /api/subjects` - Create subject (admin/instructor)
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

### Admin Routes
- `GET /api/admin/users` - User management
- `GET /api/admin/courses` - Course management
- `GET /api/admin/subjects` - Subject management
- `GET /api/admin/batches` - Batch management
- `GET /api/admin/messages` - Message management
- `GET /api/admin/analytics/*` - Analytics and reports
- `GET /api/admin/settings` - System settings

### Contact (Secured)
- `POST /api/contact` - Submit contact message (with security)

## 🛡️ Security Best Practices

### Contact Form Protection
1. **Enable reCAPTCHA**: Always configure reCAPTCHA keys
2. **Monitor Rate Limits**: Check logs for suspicious activity
3. **Review Messages**: Regularly check for spam patterns
4. **IP Monitoring**: Monitor repeated failed attempts
5. **Content Filtering**: Update spam keywords as needed

### General Security
1. **Strong JWT Secrets**: Use long, random strings
2. **Regular Updates**: Keep dependencies updated
3. **Environment Variables**: Never commit secrets to git
4. **Database Security**: Use MongoDB authentication
5. **HTTPS**: Use HTTPS in production
6. **File Upload Limits**: Monitor upload sizes and types

## 📊 Monitoring

### Security Logs
The system logs security events including:
- Failed CAPTCHA attempts
- Rate limit violations
- Spam detection triggers
- Suspicious activity patterns
- IP-based blocking events

### Performance Monitoring
- API response times
- Database query performance
- File upload metrics
- User activity patterns

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-jwt-secret
RECAPTCHA_SECRET_KEY=your-production-recaptcha-secret
CORS_ORIGIN=https://your-domain.com
```

### Security Checklist for Production
- [ ] Configure strong JWT secrets
- [ ] Set up reCAPTCHA with production keys
- [ ] Enable HTTPS
- [ ] Configure MongoDB authentication
- [ ] Set up proper CORS origins
- [ ] Enable security headers
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Regular security updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support or questions:
- **Email**: support@ssmtechnologies.co.in
- **Phone**: +91 98765 43210
- **Documentation**: Check this README and code comments

## 🔄 Updates

### Version 1.0.0
- Initial release with complete management system
- Advanced security implementation
- Comprehensive admin panel
- Student and instructor dashboards
- Contact form with enterprise-level security