# Database Seeding Scripts

This directory contains scripts for seeding the database with initial data.

## Scripts

### 1. `seedAdmin.js` - Admin User Creation

Creates a secure admin user for the system with auto-generated or custom credentials.

#### Features:
- **Secure Password Generation**: Automatically generates a 20-character password with uppercase, lowercase, numbers, and symbols
- **Environment Variable Support**: Uses custom credentials from `.env` file if provided
- **Duplicate Prevention**: Checks for existing admin users to prevent duplicates
- **Security Best Practices**: Includes password complexity requirements and secure random generation

#### Usage:

```bash
# Run the admin seed script
npm run seed:admin

# Or directly with node
node scripts/seedAdmin.js
```

#### Environment Variables (Optional):

Add these to your `.env` file to customize admin credentials:

```env
ADMIN_EMAIL=admin@ssmtechnologies.co.in
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_FIRST_NAME=System
ADMIN_LAST_NAME=Administrator
ADMIN_PHONE=+91 98765 43210
ADMIN_WHATSAPP=+91 98765 43210
```

#### Output:
- ✅ Success message with admin email
- 🔑 Generated password (if not using environment variable)
- 📝 Environment variable template for future use
- ⚠️ Important security reminders

### 2. `seedDatabase.js` - Full Database Seeding

Seeds the entire database with sample data including users, courses, subjects, etc.

```bash
# Run the full database seed
npm run seed
```

## Security Notes

1. **Save Generated Passwords**: Auto-generated passwords are only shown once
2. **Use Environment Variables**: Store credentials in `.env` file for production
3. **Secure Storage**: Never commit passwords to version control
4. **Regular Updates**: Change default passwords in production environments

## Troubleshooting

- **"Admin already exists"**: The script prevents duplicate admin creation
- **Database connection errors**: Ensure MongoDB is running and connection string is correct
- **Permission errors**: Ensure the script has write access to the database