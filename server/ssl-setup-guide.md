# SSL Certificate Setup Guide for SSM Technologies

## Overview
This guide explains how to set up SSL certificates for HTTPS support in the SSM Technologies backend server.

## SSL Certificate Requirements

### 1. Obtain SSL Certificates
You need the following files:
- **Private Key**: `ssmtechnologies.key`
- **Certificate**: `ssmtechnologies.crt`
- **Certificate Authority (CA) Bundle**: `ssmtechnologies-ca.crt` (optional, for intermediate certificates)

### 2. Certificate Sources
You can obtain SSL certificates from:
- **Let's Encrypt** (Free): Use Certbot for automatic certificate generation
- **Commercial CA**: GoDaddy, Namecheap, DigiCert, etc.
- **Cloudflare**: If using Cloudflare as a proxy

### 3. Certificate Placement
Place your SSL certificates in the following locations on your server:
```
/etc/ssl/private/ssmtechnologies.key    (Private key - 600 permissions)
/etc/ssl/certs/ssmtechnologies.crt      (Certificate - 644 permissions)
/etc/ssl/certs/ssmtechnologies-ca.crt   (CA bundle - 644 permissions)
```

## Let's Encrypt Setup (Recommended)

### Install Certbot
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot

# CentOS/RHEL
sudo yum install certbot
```

### Generate Certificate
```bash
# For domain validation
sudo certbot certonly --standalone -d www.ssmtechnologies.co.in -d ssmtechnologies.co.in

# The certificates will be generated in:
# /etc/letsencrypt/live/www.ssmtechnologies.co.in/
```

### Update Environment Variables
Update your `.env.production` file:
```env
SSL_KEY_PATH=/etc/letsencrypt/live/www.ssmtechnologies.co.in/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/www.ssmtechnologies.co.in/fullchain.pem
```

### Auto-renewal Setup
```bash
# Add to crontab for automatic renewal
sudo crontab -e

# Add this line to renew certificates twice daily
0 12 * * * /usr/bin/certbot renew --quiet
```

## Manual Certificate Setup

### 1. Generate Private Key
```bash
sudo openssl genrsa -out /etc/ssl/private/ssmtechnologies.key 2048
sudo chmod 600 /etc/ssl/private/ssmtechnologies.key
```

### 2. Generate Certificate Signing Request (CSR)
```bash
sudo openssl req -new -key /etc/ssl/private/ssmtechnologies.key -out ssmtechnologies.csr
```

### 3. Submit CSR to Certificate Authority
Submit the CSR to your chosen CA and download the issued certificate and CA bundle.

### 4. Install Certificates
```bash
sudo cp ssmtechnologies.crt /etc/ssl/certs/
sudo cp ssmtechnologies-ca.crt /etc/ssl/certs/
sudo chmod 644 /etc/ssl/certs/ssmtechnologies.crt
sudo chmod 644 /etc/ssl/certs/ssmtechnologies-ca.crt
```

## Testing HTTPS Configuration

### 1. Start the Server
```bash
cd /path/to/your/server
NODE_ENV=production npm start
```

### 2. Test HTTPS Endpoint
```bash
# Test HTTPS health endpoint
curl -k https://www.ssmtechnologies.co.in/health

# Test HTTP to HTTPS redirect
curl -I http://www.ssmtechnologies.co.in/health
```

### 3. Verify SSL Certificate
```bash
# Check certificate details
openssl s_client -connect www.ssmtechnologies.co.in:443 -servername www.ssmtechnologies.co.in
```

## Troubleshooting

### Common Issues

1. **Certificate Not Found Error**
   - Verify certificate file paths in `.env.production`
   - Check file permissions (private key should be 600)
   - Ensure certificates are valid and not expired

2. **Permission Denied**
   - Run server with appropriate permissions
   - Check file ownership and permissions

3. **Certificate Chain Issues**
   - Ensure CA bundle is properly configured
   - Use fullchain certificate from Let's Encrypt

4. **Port 443 Access**
   - Ensure port 443 is open in firewall
   - Run server with sudo if binding to port 443
   - Consider using a reverse proxy (nginx/Apache)

### Logs and Debugging
- Check server logs for SSL-related errors
- Use browser developer tools to inspect certificate issues
- Test with SSL testing tools like SSL Labs

## Production Deployment Notes

1. **Reverse Proxy Setup** (Recommended)
   - Use nginx or Apache as a reverse proxy
   - Handle SSL termination at the proxy level
   - Forward requests to Node.js app on internal port

2. **Process Management**
   - Use PM2 or similar for process management
   - Configure automatic restarts and monitoring

3. **Security Headers**
   - The server already includes Helmet.js for security headers
   - Consider additional security configurations

## Environment Variables Reference

```env
# SSL Configuration
SSL_KEY_PATH=/path/to/private/key
SSL_CERT_PATH=/path/to/certificate
SSL_CA_PATH=/path/to/ca/bundle
REDIRECT_HTTP_TO_HTTPS=true
HTTPS_PORT=443
PORT=80
```