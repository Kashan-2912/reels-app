# Complete Deployment Guide

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Frontend Deployment](#frontend-deployment)
3. [Backend Deployment](#backend-deployment)
4. [Database Setup](#database-setup)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment](#post-deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Pre-Deployment Checklist

### Code Quality
- [ ] Run ESLint: `npm run lint`
- [ ] Run tests: `npm test`
- [ ] Check for console errors/warnings
- [ ] Verify dark mode works correctly
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices

### Performance
- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Verify image optimization
- [ ] Check bundle size: `npm run build`
- [ ] Test lazy loading
- [ ] Verify API response times

### Security
- [ ] Remove sensitive data from code
- [ ] Check environment variables
- [ ] Verify JWT token handling
- [ ] Check CORS configuration
- [ ] Verify input validation
- [ ] Update dependencies: `npm audit`

### Functionality
- [ ] Test authentication flow
- [ ] Test post creation and engagement
- [ ] Test search functionality
- [ ] Test pagination/infinite scroll
- [ ] Test notifications
- [ ] Test image/video uploads
- [ ] Test profile editing
- [ ] Test follow/unfollow

### Content & Copy
- [ ] Update meta tags
- [ ] Review error messages
- [ ] Check for broken links
- [ ] Verify all page titles

---

## Frontend Deployment

### Option 1: Deploy to Vercel (Recommended)

**Advantages:**
- Easy integration with GitHub
- Automatic deployments on push
- Built-in CI/CD
- Free tier available
- Excellent performance

**Steps:**

1. **Create Vercel account**
   ```bash
   # Visit https://vercel.com/signup
   ```

2. **Connect GitHub repository**
   - Import project from GitHub
   - Select frontend directory: `/frontend`

3. **Configure environment variables**
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend.com/api
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
   NEXT_PUBLIC_GA_ID=your_ga_id
   ```

4. **Set build command**
   ```
   npm run build
   ```

5. **Set install command**
   ```
   npm ci
   ```

6. **Deploy**
   ```bash
   # Automatic on push, or manual via CLI
   npm install -g vercel
   vercel deploy
   ```

### Option 2: Deploy to Netlify

1. **Connect GitHub**
   - Visit https://app.netlify.com
   - Click "New site from Git"
   - Select repository

2. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18.x

3. **Add environment variables**
   - Site settings → Environment

4. **Deploy**
   - Automatic on push

### Option 3: Deploy to Self-Hosted (AWS, DigitalOcean, etc.)

```bash
# 1. Build the application
npm run build

# 2. Install production dependencies only
npm ci --production

# 3. Start the server
npm start
# or use PM2
pm2 start npm --name "reelapp" -- start
```

**Server Requirements:**
- Node.js 18.x or higher
- 512MB RAM minimum
- 2GB disk space
- Port 3000 available

---

## Backend Deployment

### Option 1: Deploy to Railway

**Steps:**

1. **Create Railway account**
   ```bash
   # Visit https://railway.app
   ```

2. **Connect GitHub repository**
   - New project → Deploy from GitHub

3. **Configure environment variables**
   ```
   PORT=4000
   NODE_ENV=production
   DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/reelapp
   JWT_SECRET=your_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   FRONTEND_URL=https://your-frontend.com
   ```

4. **Set build command**
   ```
   npm ci
   ```

5. **Set start command**
   ```
   npm start
   ```

6. **Deploy**
   - Automatic on push

### Option 2: Deploy to Heroku

```bash
# 1. Login to Heroku
heroku login

# 2. Create new app
heroku create your-app-name

# 3. Set environment variables
heroku config:set DATABASE_URL=mongodb+srv://...
heroku config:set JWT_SECRET=your_secret

# 4. Deploy
git push heroku main
```

### Option 3: Deploy to Self-Hosted (EC2, DigitalOcean, etc.)

**Ubuntu/Debian Setup:**

```bash
# 1. SSH into server
ssh -i key.pem ubuntu@your-server.com

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2 (process manager)
npm install -g pm2

# 4. Clone repository
git clone your-repo-url
cd your-repo/backend

# 5. Install dependencies
npm ci --production

# 6. Create .env file
nano .env
# Add environment variables

# 7. Start with PM2
pm2 start server.js --name "reelapp-backend"
pm2 save
pm2 startup

# 8. Setup reverse proxy (Nginx)
sudo apt-get install nginx
# Configure /etc/nginx/sites-available/default
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-backend-domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Database Setup

### MongoDB Atlas (Cloud)

**Recommended for most deployments**

1. **Create account**
   - Visit https://www.mongodb.com/cloud/atlas

2. **Create cluster**
   - Select region close to your users
   - Choose M0 (free) for testing

3. **Configure security**
   - Add whitelist IPs
   - Create database user
   - Generate connection string

4. **Connection string format**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/reelapp?retryWrites=true&w=majority
   ```

### MongoDB Local (Development)

```bash
# Install MongoDB
# macOS
brew install mongodb-community

# Ubuntu
sudo apt-get install -y mongodb-org

# Start service
sudo systemctl start mongod

# Connection string
MONGODB_URI=mongodb://localhost:27017/reelapp
```

### Database Backup Strategy

```bash
# Monthly backup
0 0 1 * * mongodump --uri=$MONGODB_URI --out=/backups/$(date +\%Y\%m\%d)

# Upload to cloud storage
0 1 1 * * aws s3 sync /backups s3://your-bucket/backups/
```

---

## Environment Variables

### Frontend (.env.local)

```env
# API
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset

# Analytics
NEXT_PUBLIC_GA_ID=UA-XXXXXXXXX-X

# App config
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_MAX_IMAGE_SIZE=5242880
NEXT_PUBLIC_MAX_VIDEO_SIZE=104857600
```

### Backend (.env)

```env
# Server
PORT=4000
NODE_ENV=production

# Database
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/reelapp

# JWT
JWT_SECRET=your_super_secret_key_min_32_chars_long

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
FRONTEND_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## Post-Deployment

### SSL Certificate Setup

```bash
# Using Let's Encrypt (free)
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### DNS Configuration

```
A Record: yourdomain.com -> Your-Server-IP
CNAME: api.yourdomain.com -> your-backend-url
CNAME: www.yourdomain.com -> your-frontend-url
```

### Verify Deployment

```bash
# Frontend health check
curl https://yourdomain.com

# Backend health check
curl https://api.yourdomain.com/api/health

# Database connection
npm test -- database
```

---

## Monitoring & Maintenance

### Performance Monitoring

```javascript
// Setup Sentry for error tracking
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
});
```

### Log Aggregation

```bash
# Using PM2 Plus (recommended)
pm2 plus

# Or use ELK Stack
# Elasticsearch, Logstash, Kibana
```

### Regular Maintenance

**Daily:**
- [ ] Check error logs
- [ ] Monitor API response times
- [ ] Verify backup completion

**Weekly:**
- [ ] Review user feedback
- [ ] Check database performance
- [ ] Update dependencies security patches

**Monthly:**
- [ ] Review analytics
- [ ] Performance audit
- [ ] Security audit
- [ ] Database cleanup
- [ ] Full backup verification

### Scaling Strategy

**When to scale:**
- API response time > 500ms
- CPU usage > 80%
- Memory usage > 85%
- Concurrent users > 1000

**Scaling options:**
1. Increase server resources
2. Add load balancer
3. Horizontal scaling with multiple servers
4. CDN for static assets
5. Database read replicas

---

## Troubleshooting

### Common Issues

**1. API Connection Errors**
```bash
# Check backend is running
curl https://api.yourdomain.com/api/health

# Check CORS headers
curl -H "Origin: https://yourdomain.com" -v https://api.yourdomain.com
```

**2. Database Connection Issues**
```bash
# Test MongoDB connection
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/"
```

**3. Image Upload Failures**
```bash
# Verify Cloudinary credentials
curl -X POST https://api.cloudinary.com/v1_1/{cloud_name}/image/upload
```

**4. Performance Issues**
```bash
# Check build size
npm run build
ls -lh .next

# Analyze bundle
npm run analyze
```

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Express.js Docs**: https://expressjs.com
- **MongoDB Docs**: https://docs.mongodb.com
- **Cloudinary Docs**: https://cloudinary.com/documentation

---

**Deployment Checklist Complete!** 🚀

Your ReelApp is now ready for production deployment.
