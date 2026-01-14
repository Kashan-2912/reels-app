# Deployment Checklist & Quick Reference

## Pre-Deployment Checklist

### Code Quality ✅/❌
- [ ] All pages render without errors
- [ ] No console errors in browser
- [ ] No console warnings (acceptable)
- [ ] Linting passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] All imports are valid
- [ ] No hardcoded credentials in code

### Functionality Testing
- [ ] User can register
- [ ] User can login
- [ ] Auth guard redirects to login
- [ ] Profile page displays correctly
- [ ] Posts feed loads with mock data
- [ ] Like/unlike works
- [ ] Save/unsave works
- [ ] Comments can be added
- [ ] Search functionality works
- [ ] Navigation between pages works
- [ ] Dark mode toggle works
- [ ] Form validations work
- [ ] Error toasts display
- [ ] Success toasts display

### Responsive Design
- [ ] Mobile (375px): All pages readable
- [ ] Tablet (768px): Layout adjusts
- [ ] Desktop (1024px): Full layout used
- [ ] Sidebar collapses on mobile
- [ ] Buttons are touch-friendly (min 44px)
- [ ] Images scale properly
- [ ] Text remains readable at all sizes

### Performance
- [ ] Page load time acceptable
- [ ] No layout shifts
- [ ] Smooth scrolling
- [ ] Modal opens/closes smoothly
- [ ] Infinite scroll works smoothly
- [ ] Images load quickly

### Browser Compatibility
- [ ] Chrome/Edge latest
- [ ] Firefox latest
- [ ] Safari latest
- [ ] Mobile browsers

### Accessibility
- [ ] Keyboard navigation works
- [ ] Links are understandable
- [ ] Images have alt text
- [ ] Color contrast acceptable
- [ ] Form labels present

### Security
- [ ] No console errors with auth
- [ ] Tokens stored securely
- [ ] Protected routes redirect
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] API calls use HTTPS in production

---

## Environment Setup

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
touch .env.local

# Add to .env.local:
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_APP_NAME=Reel App
```

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env
touch .env

# Add to .env:
MONGODB_URI=mongodb://localhost:27017/reel-app
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
PORT=4000
```

---

## Development Server Commands

### Frontend
```bash
# Development mode
npm run dev
# Opens: http://localhost:3000

# Build for production
npm run build

# Start production build
npm run start

# Linting
npm run lint

# Format code
npm run format
```

### Backend
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start

# Linting
npm run lint
```

---

## Common Issues & Solutions

### Issue: "Module not found"
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port already in use"
**Solution:**
```bash
# Find process on port
lsof -i :3000  # Frontend
lsof -i :4000  # Backend

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Issue: "CORS error"
**Solution:**
1. Check backend CORS config in `app.js`
2. Verify frontend URL matches
3. Ensure credentials are included in API calls
4. Check `withCredentials` in axios instance

### Issue: "Token expired"
**Solution:**
1. Clear localStorage
2. Login again
3. Check JWT expiration in .env

### Issue: "Images not loading"
**Solution:**
1. Check image URLs
2. Verify placeholder URLs work
3. Check Cloudinary/Firebase config (if integrated)

### Issue: "Infinite scroll not working"
**Solution:**
1. Verify `IntersectionObserver` browser support
2. Check threshold value
3. Verify `ref` is attached to observer target
4. Check API response for `hasMore` flag

---

## Performance Optimization Tips

### Frontend
```javascript
// Use React.memo for expensive components
const PostCard = React.memo(({ post }) => {
  return <div>{post.title}</div>;
});

// Use useCallback for event handlers
const handleLike = useCallback(async () => {
  await likePost(id);
}, [id]);

// Lazy load routes
const ExplorePage = lazy(() => import('@/app/explore/page'));

// Optimize images
<Image
  src={url}
  alt="description"
  width={600}
  height={600}
  priority={false}
  placeholder="blur"
  blurDataURL={blurHash}
/>
```

### API Calls
```javascript
// Implement request debouncing
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (query) => {
  const results = await searchService.search(query);
}, 500);

// Implement response caching
const cache = new Map();

export const getPost = async (id) => {
  if (cache.has(id)) return cache.get(id);
  const post = await api.get(`/posts/${id}`);
  cache.set(id, post);
  return post;
};
```

---

## Monitoring & Logging

### Add Error Logging
```javascript
// src/services/api.js
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url
    });
    
    // Send to error tracking service
    // errorTracker.captureException(error);
    
    return Promise.reject(error);
  }
);
```

### Add Analytics
```javascript
// src/lib/analytics.js
export const trackEvent = (eventName, properties) => {
  // Send to analytics service (GA, Mixpanel, etc.)
  // window.gtag?.event(eventName, properties);
};

// Usage
trackEvent('post_created', { postId: '123' });
trackEvent('user_followed', { userId: '456' });
```

---

## Database Backup & Recovery

### MongoDB Backup
```bash
# Backup database
mongodump --uri="mongodb://localhost:27017/reel-app" --out=./backup

# Restore database
mongorestore --uri="mongodb://localhost:27017/reel-app" ./backup/reel-app
```

### Environment Backup
```bash
# Backup .env files
cp backend/.env backend/.env.backup
cp frontend/.env.local frontend/.env.local.backup
```

---

## Production Deployment

### Vercel (Frontend)
```bash
# Deploy frontend
vercel deploy --prod

# Env variables
vercel env add NEXT_PUBLIC_API_BASE_URL https://api.yourdomain.com
```

### Heroku/Railway (Backend)
```bash
# Deploy backend
git push heroku main

# Set env variables
heroku config:set JWT_SECRET=xxx
heroku config:set MONGODB_URI=xxx
```

### Docker Deployment
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

---

## Monitoring in Production

### Health Checks
```javascript
// Add health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Frontend health check
const checkHealth = async () => {
  try {
    const response = await fetch('/health', { method: 'GET' });
    return response.ok;
  } catch (error) {
    return false;
  }
};
```

### Error Tracking
```javascript
// Sentry integration (example)
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring
```javascript
// Web Vitals
import { reportWebVitals } from 'web-vitals';

reportWebVitals(({ name, delta, id }) => {
  console.log(`${name}: ${delta}ms`, id);
  // Send to analytics
});
```

---

## Rollback Procedure

### If Deployment Fails
```bash
# Frontend
vercel rollback

# Backend
git revert <commit-hash>
git push heroku main

# Or use previous version
heroku releases:info
heroku releases:rollback
```

### Manual Rollback
```bash
# Keep backup of stable versions
git tag -a v1.0.0 -m "Stable release"
git push origin v1.0.0

# Rollback to tag
git checkout v1.0.0
git push --force origin main
```

---

## Documentation Links

### Frontend
- Next.js: https://nextjs.org/docs
- React: https://react.dev
- Tailwind: https://tailwindcss.com/docs
- Zustand: https://github.com/pmndrs/zustand
- Axios: https://axios-http.com/docs/intro

### Backend
- Express: https://expressjs.com/
- Mongoose: https://mongoosejs.com/docs/
- MongoDB: https://docs.mongodb.com/

### Deployment
- Vercel: https://vercel.com/docs
- Heroku: https://devcenter.heroku.com/
- Docker: https://docs.docker.com/

---

## Contact & Support

### Development Team
- Frontend Lead: 
- Backend Lead: 
- DevOps: 

### Important URLs
- Frontend Repo: 
- Backend Repo: 
- Project Board: 
- Documentation: 

---

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 0.1.0 | 2024 | Initial setup | Beta |
| 0.2.0 | Current | Phase 2 features | Active |
| 1.0.0 | TBD | Production ready | Planned |

---

## Quick Reference Commands

```bash
# Frontend
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run linting
npm install              # Install dependencies

# Backend
npm run dev              # Start dev server
npm start                # Start production server
npm run lint             # Run linting

# Database
mongosh                  # Connect to MongoDB
db.posts.find()          # Query posts
db.posts.deleteMany()    # Clear collection

# Git
git clone <repo>         # Clone repository
git checkout -b feature  # Create new branch
git commit -m "message"  # Commit changes
git push origin feature  # Push to remote
```

---

## Future Enhancements

- [ ] WebSocket for real-time features
- [ ] Push notifications
- [ ] Video processing pipeline
- [ ] Machine learning recommendations
- [ ] Mobile app (React Native)
- [ ] Admin dashboard
- [ ] Analytics dashboard
- [ ] User moderation tools

---

*Last updated: After Phase 2*  
*Keep this document updated as the project evolves*
