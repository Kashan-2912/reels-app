# Backend Code Audit Report

## Summary
Backend is well-structured but has several critical issues, missing validations, and edge cases that need handling before moving to frontend.

---

## 🔴 CRITICAL ISSUES

### 1. **User Model - Missing saves array**
**Location:** [backend/src/models/user.model.js](backend/src/models/user.model.js)
- **Issue:** User model doesn't have a `saves` array to track saved posts
- **Impact:** `getSavedPosts` controller tries to access `user.saves` which doesn't exist
- **Fix:** Add `saves` array to user model

```js
saves: {
    type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    }],
    default: []
}
```

### 2. **Profile Routes - Route Conflict**
**Location:** [backend/src/routes/profile.routes.js](backend/src/routes/profile.routes.js)
- **Issue:** `/me/profile` route will never match `/view/:userName` properly
- **Problem:** Express will try to match `/me/profile` against the pattern first, but `/me/profile` could also match `/view/:userName` if someone's username is "me"
- **Fix:** Reorder routes - specific routes should come before parameterized routes
```js
// Protected routes FIRST
router.get('/me/profile', verifyToken, getOwnProfile);
// Then public parameterized routes
router.get('/view/:userName', getProfile);
```

### 3. **Post Routes - Critical Route Ambiguity**
**Location:** [backend/src/routes/post.routes.js](backend/src/routes/post.routes.js)
- **Issue:** Multiple conflicting routes with same prefix
- **Problems:**
  - `/comment/:commentId/like` vs `/:postId/comment/:commentId` - unclear which matches
  - `/view` endpoint order matters with `/likes` and other endpoints
- **Fix:** Reorder routes - place specific routes before wildcard-like routes

### 4. **Missing Pagination Validation - Injection Risk**
**Location:** Multiple controllers (search, explore, post, etc.)
- **Issue:** `parseInt()` can return `NaN` without proper validation
- **Example:** `parseInt(undefined)` returns `NaN`, but Math.max() might not catch edge cases
- **Fix:** Add explicit validation: `if (isNaN(pageNum) || pageNum < 1)`

### 5. **Post Validation - Empty photos array**
**Location:** [backend/src/controllers/post.controller.js](backend/src/controllers/post.controller.js)
- **Issue:** Line ~60 accepts empty photos array but should reject it
- **Current:** `photos: photos || []` allows empty array to be created
- **Fix:** Already partially handled in createPost but model validation is inconsistent

### 6. **Notification Auto-creation Race Condition**
**Location:** [backend/src/controllers/post.controller.js](backend/src/controllers/post.controller.js)
- **Issue:** Multiple sequential queries for user info to get userName and profilePic
- **Example in likePost:**
  ```js
  const user = await userModel.findById(userId).select('userName');
  await notificationModel.create({...});
  // Second query for profilePic happens inside create
  ```
- **Fix:** Fetch all needed user data in single query

---

## 🟠 MAJOR ISSUES

### 7. **Duplicate Engagement Prevention - Not Comprehensive**
**Locations:** Multiple engagement operations
- **Issue:** Using `indexOf()` or `includes()` on ObjectId arrays is unreliable
- **Why:** ObjectIds are objects, comparison might fail
- **Example:** In `likePost`, `post.likes.includes(userId)` might not work correctly
- **Fix:** Use `post.likes.some(like => like.toString() === userId)` or use `.findIndex()`

### 8. **Follow Notification - No Duplicate Check**
**Location:** [backend/src/controllers/profile.controller.js](backend/src/controllers/profile.controller.js)
- **Issue:** followUser creates notification every time, even for duplicate follows
- **Fix:** Add check: `if (!isAlreadyFollowing)` before creating notification

### 9. **Story Auto-Cleanup Not Working on Every Operation**
**Location:** [backend/src/controllers/feed.controller.js](backend/src/controllers/feed.controller.js)
- **Issue:** 24-hour cleanup only runs in `addStory` and `deleteStory`
- **Problem:** Stories older than 24 hours might still be served via `getFollowingStories` or `getUserStory`
- **Fix:** Add cleanup logic to `getUserStory` and `getFollowingStories`

### 10. **User Count Desyncs**
**Locations:** profile.controller, post.controller
- **Issue:** `followersCount`, `followingCount`, `postsCount` can desync
- **Example:** If post deletion fails halfway, `postsCount` won't match actual posts
- **Why:** Manual counter increment/decrement without transactions
- **Fix:** Need database transactions or aggregation queries

### 11. **Delete Post - Comments Not Properly Cleaned**
**Location:** [backend/src/controllers/post.controller.js](backend/src/controllers/post.controller.js) line ~215
- **Issue:** Only deletes comment documents but doesn't check if deletion succeeded
- **Fix:** Add error handling and verification

### 12. **Memory Leak - Large Arrays in Memory**
**Location:** Model populate operations across controllers
- **Issue:** `.populate('likes', 'userName')` loads ALL likes into memory
- **Problem:** If post has 100k likes, will load all of them just to count
- **Fix:** For counts, use aggregation. For lists, use pagination with limit.

### 13. **No Input Sanitization**
**Locations:** All string inputs (description, text, etc.)
- **Issue:** No protection against XSS or script injection
- **Missing:** HTML sanitization for user inputs
- **Fix:** Use library like `xss` or `sanitize-html`

---

## 🟡 MODERATE ISSUES

### 14. **Error Handling - Generic 500 Errors**
**Locations:** All controllers
- **Issue:** All errors catch and return 500 with generic message
- **Problem:** Hard to debug; hides validation vs database errors
- **Fix:** Add error classification and specific error codes

### 15. **No Rate Limiting**
- **Issue:** No protection against spam (like 100 likes per second)
- **Fix:** Add rate limiting middleware (express-rate-limit)

### 16. **No Post Ownership Verification in Some Places**
**Location:** `trackPostView` in engagement.controller
- **Issue:** Any authenticated user can track view for any post (this is ok, but consider abuse)
- **Issue:** Anonymous views allowed but could be abused

### 17. **Profile Update - Self-Reference Issue**
**Location:** [backend/src/controllers/profile.controller.js](backend/src/controllers/profile.controller.js) line ~96
- **Issue:** `updateProfile` doesn't update followers/following arrays when user data changes
- **Problem:** If user changes profileName or profilePic, all follower lists still have old data
- **Impact:** Followers see stale profile info

### 18. **Hashtag Extraction - Case Inconsistency**
**Location:** Multiple files (post.controller, hashtag.controller)
- **Issue:** Hashtags stored lowercase `#hashtag` but search does `new RegExp(query, 'i')`
- **Inconsistency:** Already storing lowercase, so case-insensitive regex not needed
- **Fix:** Always use lowercase, simplify search

### 19. **Comments Array Mismatch in Share**
**Location:** [backend/src/controllers/post.controller.js](backend/src/controllers/post.controller.js) line ~475
- **Issue:** In search results, comments are populated but not returned with full data
- **Problem:** When user calls `sharePost`, comments array is included but might be large

### 20. **No Duplicate Comment Check**
**Location:** [backend/src/controllers/post.controller.js](backend/src/controllers/post.controller.js) - addComment
- **Issue:** Same user can comment identical text infinite times
- **Not a blocker but:** Instagram prevents rapid identical comments
- **Nice to have:** Add cooldown or duplicate detection

### 21. **Missing Email Validation Regex**
**Location:** [backend/src/controllers/auth.controller.js](backend/src/controllers/auth.controller.js)
- **Issue:** Line ~15: `!email.includes('@')` is not sufficient email validation
- **Fix:** Use proper regex or library like `email-validator`

### 22. **JWT Token Expiration Not Set**
**Location:** [backend/src/controllers/auth.controller.js](backend/src/controllers/auth.controller.js)
- **Issue:** JWT created without expiration: `jwt.sign({ id: newUser._id }, ...)`
- **Problem:** Tokens never expire; security risk
- **Fix:** Add `{ expiresIn: '7d' }` to jwt.sign

### 23. **Cookie Security Issues**
**Location:** [backend/src/controllers/auth.controller.js](backend/src/controllers/auth.controller.js)
- **Issue:** Cookies not set with secure options
- **Missing:** HttpOnly, Secure, SameSite flags
- **Fix:** `res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' })`

---

## 🔵 MINOR ISSUES

### 24. **Pagination Limit Too High**
**Multiple Locations:** `Math.min(100, ...)` allows 100 items per page
- **Issue:** Could load 100 posts × populated comments × populated likes = memory explosion
- **Fix:** Reduce to 50 or implement cursor-based pagination

### 25. **No Sorting Options for Lists**
**Location:** `getFollowers`, `getFollowing`, `getPostComments`
- **Issue:** No way to sort by date, name, etc.
- **Nice to have:** Add optional sort parameter

### 26. **Story Structure Inconsistency**
**Location:** [backend/src/models/user.model.js](backend/src/models/user.model.js)
- **Issue:** `story: { type: Array, default: [] }` - no schema definition
- **In feed.controller:** stories expected to have `createdAt` field
- **Fix:** Define schema for story objects

### 27. **Missing Validation for IDs in Body**
**Location:** profile.controller `followUser`
- **Issue:** `targetUserName` not validated as ObjectId even though endpoint expects it
- **Fix:** More specific validation needed

### 28. **Comments Populated Incorrectly in Some Endpoints**
**Locations:** Multiple
- **Issue:** `.populate('comments')` without limiting fields could return massive data
- **Fix:** Add `.select()` projection and pagination

### 29. **No Conflict Resolution for Follows**
**Location:** profile.controller
- **Issue:** If two users follow each other simultaneously, race condition possible
- **Fix:** Use database transactions

### 30. **Status Codes Inconsistency**
**Example:** 400 used for both validation errors and conflict errors
- **Better:** Use 409 (Conflict) for "already liked", 422 (Unprocessable) for validation

---

## ✅ SECURITY ISSUES

### 31. **Notification Leakage**
**Location:** [backend/src/controllers/notification.controller.js](backend/src/controllers/notification.controller.js)
- **Issue:** `getNotifications` filters by userId but doesn't verify deeply
- **Status:** Actually safe - middleware handles this
- **Note:** Good practice

### 32. **No CORS Headers Set**
**Location:** [backend/src/app.js](backend/src/app.js)
- **Issue:** CORS not configured; will fail from different origin
- **Fix:** Add `const cors = require('cors'); app.use(cors())`

### 33. **No Request Size Limit**
**Location:** Express middleware
- **Issue:** Large payloads could cause memory issues
- **Fix:** `app.use(express.json({ limit: '50mb' }))`

### 34. **MongoDB Injection Possible**
**Locations:** All MongoDB queries with user input
- **Status:** Mongoose provides protection but should be verified
- **Safe:** Using proper methods, not raw queries
- **Good:** Already protected

---

## 📋 MISSING FEATURES/EDGE CASES

### 35. **No Soft Delete**
- **Issue:** Deleted posts/comments are permanently gone
- **Better:** Add `deletedAt` field for recovery
- **Nice to have:** Not critical for MVP

### 36. **No Edit History for Posts**
- **Issue:** Can't see what was changed in a post
- **Fix:** Add `editedAt` field (already exists) and optionally previous versions

### 37. **No Post Privacy Levels**
- **Issue:** All posts are public
- **Missing:** Private/followers-only options

### 38. **No Mention System**
- **Issue:** Can't tag/mention users in comments
- **Missing:** @username parsing and notifications

### 39. **No Follow Request System**
- **Issue:** All follows are instant
- **Missing:** For private accounts, follow requests

### 40. **No Report/Block Functionality**
- **Missing:** Block users, report posts

---

## 🛠️ RECOMMENDED FIXES (Priority Order)

### BEFORE FRONTEND (Critical):
1. Add `saves` array to User model
2. Fix route ordering in profile.routes.js
3. Add JWT expiration and secure cookie flags
4. Fix ObjectId comparisons (use `.toString()`)
5. Add CORS configuration
6. Fix email validation
7. Add comprehensive input validation/sanitization

### Before Production:
8. Add rate limiting
9. Fix duplicate comment/notification handling
10. Update story structure schema
11. Add error classification
12. Fix user count desync (use transactions)
13. Update populate queries (limit data)
14. Add request size limits

### Nice to Have:
15. Add soft delete
16. Add follow requests
17. Add report/block system
18. Add mention system

---

## 📊 Files with Issues Summary

| File | Issues | Severity |
|------|--------|----------|
| models/user.model.js | Missing saves array, story schema | 🔴 |
| routes/profile.routes.js | Route ordering | 🔴 |
| routes/post.routes.js | Route ordering, ambiguity | 🔴 |
| controllers/auth.controller.js | JWT config, email validation, cookie security | 🔴🟠 |
| controllers/post.controller.js | ObjectId comparison, memory leaks, populate issues | 🟠🟡 |
| controllers/profile.controller.js | Follow notification, profile sync, user counts | 🟠🟡 |
| controllers/feed.controller.js | Story cleanup inconsistency | 🟠 |
| app.js | Missing CORS, request limits | 🔵 |
| All controllers | Generic error handling, pagination validation | 🟡 |

---

## Next Steps
Address critical issues before starting frontend development to prevent data integrity problems and security vulnerabilities.
