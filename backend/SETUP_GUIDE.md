# Backend Setup & Launch Guide

## ✅ Pre-Flight Checklist

Before starting, make sure you have:
- Node.js installed (v14+)
- MongoDB running locally or connection string ready
- npm or yarn package manager

---

## 📥 Installation

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

This will install:
- Express.js (web framework)
- Mongoose (MongoDB ODM)
- bcrypt (password hashing)
- jsonwebtoken (JWT auth)
- cookie-parser (cookie handling)
- cors (cross-origin support) ← NEW
- dotenv (environment variables)

### Step 2: Verify .env Configuration
```bash
cat .env
```

Should contain:
```
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
MONGODB_URI=mongodb://localhost:27017/reel-app
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**For Production:**
```
NODE_ENV=production
JWT_SECRET=[use strong random string]
MONGODB_URI=[use production DB]
FRONTEND_URL=[your production domain]
```

---

## 🚀 Starting the Backend

### Development Mode
```bash
npm start
```

Expected output:
```
Connected to MongoDB
Server is running on http://localhost:3000
```

### Watch Mode (Auto-restart on changes)
```bash
npm install -g nodemon
nodemon server.js
```

---

## 🧪 Quick API Test

Test the backend is working:

### Option 1: Using cURL

#### Register User
```bash
curl -X POST http://localhost:3000/api/auth/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "userName": "testuser",
    "profileName": "Test"
  }'
```

Expected response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "fullName": "Test User",
    "email": "test@example.com",
    "userName": "testuser",
    "profileName": "Test"
  }
}
```

#### Get Profile
```bash
curl -X GET http://localhost:3000/api/profile/view/testuser \
  -H "Content-Type: application/json"
```

### Option 2: Using Postman

1. Import this collection:
   - Method: POST
   - URL: http://localhost:3000/api/auth/user/register
   - Body (JSON):
   ```json
   {
     "fullName": "Test User",
     "email": "test@example.com",
     "password": "password123",
     "userName": "testuser",
     "profileName": "Test"
   }
   ```

2. Check cookie is set in Postman after login
3. Use cookie for subsequent requests

### Option 3: Using Frontend (React)

The frontend will automatically use the API when configured correctly.

---

## 🔄 Database Setup

### MongoDB Required

#### Option A: Local MongoDB
```bash
# Mac with Homebrew
brew services start mongodb-community

# Ubuntu/Linux
sudo systemctl start mongod

# Windows
# Download and install from: https://www.mongodb.com/try/download/community
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Update .env:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/reel-app
   ```

#### Option C: Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

### Verify Connection
```bash
# Connect to MongoDB shell
mongosh mongodb://localhost:27017/reel-app

# You should see:
# Current Mongosh Log ID: ...
# Connecting to: mongodb://localhost:27017/reel-app

# Exit with: exit()
```

---

## 📊 Database Collections

The following collections will be created automatically:

1. **users** - User profiles and authentication
2. **posts** - Posts/reels with media
3. **comments** - Post comments
4. **notifications** - User notifications
5. **posts_indices** - Automatically created

No manual setup needed - Mongoose creates them on first insert.

---

## 🔌 Environment Variables Explained

### JWT_SECRET
- Secret key for signing JWT tokens
- Change this in production to random strong string
- Example: `openssl rand -base64 32`

### MONGODB_URI
- Connection string to MongoDB
- Local: `mongodb://localhost:27017/reel-app`
- Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/db`

### NODE_ENV
- `development` - allows localhost, verbose logging
- `production` - enforces HTTPS, secure cookies

### FRONTEND_URL
- Where frontend is hosted
- Used for CORS configuration
- Default: `http://localhost:5173` (Vite)

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'cors'"
```bash
npm install cors
```

### Error: "Connection refused" (MongoDB)
```bash
# Make sure MongoDB is running
# Check with:
mongosh --eval "db.version()"

# If not running, start it:
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Error: "EADDRINUSE: address already in use :::3000"
```bash
# Another process is using port 3000
# Kill it:
lsof -i :3000
kill -9 <PID>

# Or change port in server.js
```

### Error: "JWT token expires immediately"
This was ✅ FIXED. Tokens now have 7-day expiration.

### Error: "CORS error from frontend"
```
Access to XMLHttpRequest at 'http://localhost:3000/api/auth/user/login'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

✅ FIXED. CORS is now configured. Make sure frontend uses:
```javascript
fetch(url, {
  credentials: 'include',  // This is important!
  headers: { 'Content-Type': 'application/json' }
})
```

### Error: "Unsaved posts query returns empty"
This was ✅ FIXED. User model now has `saves` array.

### Error: "Post won't save/unsave"
This was ✅ FIXED. Save operations now sync with `user.saves` array.

---

## 📚 File Structure

```
backend/
├── server.js                 ← Start here
├── package.json
├── .env                      ← Configuration
├── .gitignore
├── src/
│   ├── app.js               ← Express setup
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── models/              ← Database schemas
│   │   ├── user.model.js
│   │   ├── post.model.js
│   │   ├── comment.model.js
│   │   └── notification.model.js
│   ├── controllers/         ← Business logic
│   │   ├── auth.controller.js
│   │   ├── post.controller.js
│   │   ├── profile.controller.js
│   │   ├── feed.controller.js
│   │   ├── engagement.controller.js
│   │   ├── saved.controller.js
│   │   ├── search.controller.js
│   │   ├── explore.controller.js
│   │   ├── hashtag.controller.js
│   │   └── notification.controller.js
│   ├── routes/              ← API endpoints
│   │   ├── auth.routes.js
│   │   ├── post.routes.js
│   │   ├── profile.routes.js
│   │   ├── feed.routes.js
│   │   ├── engagement.routes.js
│   │   ├── saved.routes.js
│   │   ├── search.routes.js
│   │   ├── explore.routes.js
│   │   ├── hashtag.routes.js
│   │   └── notification.routes.js
│   └── db/
│       └── db.js            ← MongoDB connection
└── Documentation/
    ├── BACKEND_AUDIT_REPORT.md
    ├── FIXES_APPLIED.md
    ├── API_REFERENCE.md
    ├── VERIFICATION_CHECKLIST.md
    └── SETUP_GUIDE.md (this file)
```

---

## 🔐 Security Checklist for Production

Before deploying to production:

### Essential
- [ ] Change JWT_SECRET to strong random string
- [ ] Use production MongoDB URI (encrypted password)
- [ ] Set NODE_ENV=production
- [ ] Use HTTPS/SSL certificate
- [ ] Set FRONTEND_URL to production domain
- [ ] Enable MongoDB auth
- [ ] Use environment variables (never hardcode secrets)

### Highly Recommended
- [ ] Add rate limiting (prevent abuse)
- [ ] Add input sanitization (XSS prevention)
- [ ] Enable MongoDB backup
- [ ] Setup error logging (Sentry, LogRocket)
- [ ] Monitor API performance
- [ ] Setup CI/CD pipeline

### Optional but Useful
- [ ] Add request logging middleware
- [ ] Setup database indexes on frequently searched fields
- [ ] Implement caching (Redis)
- [ ] Add email notifications
- [ ] Setup monitoring dashboard

---

## 📈 Performance Tips

### For Development
- Leave logging as-is
- CORS accepts localhost
- No rate limiting needed

### For Production
```javascript
// Add rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

### Database Optimization
```bash
# Add indexes in MongoDB
db.users.createIndex({ userName: 1 })
db.posts.createIndex({ userId: 1 })
db.posts.createIndex({ createdAt: -1 })
db.notifications.createIndex({ userId: 1, isRead: 1 })
```

---

## 🎯 Deployment Options

### Option 1: Heroku
```bash
heroku create your-app-name
heroku config:set JWT_SECRET=your_secret
heroku config:set MONGODB_URI=your_mongodb_uri
git push heroku main
```

### Option 2: DigitalOcean
1. Create Ubuntu droplet
2. Install Node.js and MongoDB
3. Clone repository
4. Setup PM2 for process management
5. Configure reverse proxy with Nginx

### Option 3: AWS/GCP/Azure
Follow their Node.js deployment guides.

### Option 4: Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📞 Quick Support

### Check logs
```bash
# View recent logs
npm start

# All logs print to console

# For persistent logs, use:
npm start 2>&1 | tee app.log
```

### Test endpoint
```bash
# Replace with any endpoint
curl http://localhost:3000/api/search/users?query=test
```

### Database dump
```bash
# Export all data
mongodump --uri="mongodb://localhost:27017/reel-app"

# Import data
mongorestore --uri="mongodb://localhost:27017/reel-app" dump/
```

---

## ✅ Launch Checklist

Before starting frontend:

- [ ] npm install completed
- [ ] .env file configured
- [ ] MongoDB running (verify with mongosh)
- [ ] Backend started (npm start)
- [ ] GET /api/search/users?query=test returns 200
- [ ] CORS enabled (check in browser console)
- [ ] JWT working (can register and login)
- [ ] API reference read

---

## 🎉 You're Ready!

Backend is running and ready for frontend integration!

**Next Steps:**
1. Start frontend dev server
2. Follow API_REFERENCE.md for endpoint details
3. Use VERIFICATION_CHECKLIST.md to test endpoints
4. Begin building UI components

**Common Frontend Questions:**
- Q: How do I get JWT token?
  A: It's auto set in cookies after login/register
- Q: Do I need to pass token header?
  A: No, include `credentials: 'include'` in fetch
- Q: What's the base URL?
  A: `http://localhost:3000`
- Q: How do I handle file uploads?
  A: Send URLs from a file service (Firebase, Cloudinary, etc.)

Happy coding! 🚀
