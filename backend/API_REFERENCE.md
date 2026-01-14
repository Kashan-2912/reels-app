# Backend API Quick Reference

## Base URL
```
http://localhost:3000
```

## Authentication
- All protected endpoints require `Authorization` header with JWT token
- JWT token is automatically set in HTTP-only cookies on login/register
- Token expires after 7 days
- CORS enabled with credentials

---

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Register
```
POST /api/auth/user/register
Body: {
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "userName": "johndoe",
  "profileName": "John"
}
Response: { user: {...}, message: "User registered successfully" }
```

#### Login
```
POST /api/auth/user/login
Body: { "email": "john@example.com", "password": "password123" }
Response: { user: {...}, message: "User logged in successfully" }
```

#### Logout
```
POST /api/auth/user/logout
Response: { message: "User logged out successfully" }
```

---

### Profile Routes (`/api/profile`)

#### Get Profile
```
GET /api/profile/view/:userName
Response: { user: {...} }
```

#### Get Own Profile (Protected)
```
GET /api/profile/me/profile
Response: { user: {...} }
```

#### Update Profile (Protected)
```
PUT /api/profile/edit
Body: {
  "profileName": "John Updated",
  "description": "I love coding",
  "profilePic": "url",
  "story": [...]
}
Response: { user: {...}, message: "Profile updated successfully" }
```

#### Follow User (Protected)
```
POST /api/profile/follow
Body: { "targetUserName": "jane" }
Response: { message: "Successfully followed jane", followingCount: 5, targetUserFollowersCount: 10 }
```

#### Unfollow User (Protected)
```
POST /api/profile/unfollow
Body: { "targetUserName": "jane" }
Response: { message: "Successfully unfollowed jane", followingCount: 4, targetUserFollowersCount: 9 }
```

#### Get Followers/Following
```
GET /api/profile/:userName/followers
GET /api/profile/:userName/following
Response: { followers: [...], followersCount: 5 }
```

---

### Post Routes (`/api/posts`)

#### Create Post (Protected)
```
POST /api/posts/create
Body: {
  "photos": ["url1", "url2"],  // OR video (not both)
  "video": null,
  "description": "My awesome post #hashtag #coding"
}
Response: { post: {...}, message: "Post created successfully" }
```

#### Get Single Post
```
GET /api/posts/:postId
Response: { post: {...} }
```

#### Get User Posts
```
GET /api/posts/user/:userName?page=1&limit=10
Response: { posts: [...], totalPages: 5, currentPage: 1 }
```

#### Update Post (Protected) - Description Only
```
PUT /api/posts/:postId
Body: { "description": "Updated caption #newtag" }
Response: { post: {...} }
```

#### Delete Post (Protected)
```
DELETE /api/posts/:postId
Response: { message: "Post deleted successfully" }
```

---

### Engagement Routes (`/api/posts`)

#### Like Post (Protected)
```
POST /api/posts/:postId/like
Response: { message: "Post liked successfully", likesCount: 42 }
```

#### Unlike Post (Protected)
```
POST /api/posts/:postId/unlike
Response: { message: "Post unliked successfully", likesCount: 41 }
```

#### Get Post Likes
```
GET /api/posts/:postId/likes?page=1&limit=20
Response: { likes: [...], totalLikes: 42, totalPages: 3 }
```

#### Add Comment (Protected)
```
POST /api/posts/:postId/comment
Body: { "text": "Amazing post!" }
Response: { comment: {...}, commentsCount: 5 }
```

#### Delete Comment (Protected)
```
DELETE /api/posts/:postId/comment/:commentId
Response: { message: "Comment deleted successfully", commentsCount: 4 }
```

#### Get Post Comments
```
GET /api/posts/:postId/comments?page=1&limit=20
Response: { comments: [...], totalComments: 5, totalPages: 1 }
```

#### Save Post (Protected)
```
POST /api/posts/:postId/save
Response: { message: "Post saved successfully", savesCount: 3 }
```

#### Unsave Post (Protected)
```
POST /api/posts/:postId/unsave
Response: { message: "Post unsaved successfully", savesCount: 2 }
```

#### Share Post (Protected)
```
POST /api/posts/:postId/share
Response: { message: "Post shared successfully", shareUrl: "...", sharesCount: 5 }
```

---

### Post Views (`/api/posts`)

#### Track View (Protected)
```
POST /api/posts/:postId/view
Response: { message: "View tracked successfully", viewsCount: 150 }
```

#### Get Post Views
```
GET /api/posts/:postId/views?page=1&limit=20
Response: { views: [...], totalViews: 150, totalPages: 8 }
```

---

### Comment Likes (`/api/posts`)

#### Like Comment (Protected)
```
POST /api/posts/comment/:commentId/like
Response: { message: "Comment liked successfully", likesCount: 3 }
```

#### Unlike Comment (Protected)
```
POST /api/posts/comment/:commentId/unlike
Response: { message: "Comment unliked successfully", likesCount: 2 }
```

#### Get Comment Likes
```
GET /api/posts/comment/:commentId/likes?page=1&limit=20
Response: { likes: [...], totalLikes: 3 }
```

---

### Feed Routes (`/api/feed`)

#### Get Home Feed (Protected)
```
GET /api/feed/home?page=1&limit=10
Response: { 
  posts: [...posts from following + own posts], 
  totalPosts: 50,
  totalPages: 5,
  currentPage: 1
}
```

#### Get Following Stories (Protected)
```
GET /api/feed/stories
Response: { 
  stories: [{ userId, userName, profilePic, stories: [...] }],
  usersWithStories: 3,
  totalUsers: 10
}
```

#### Get User Story
```
GET /api/feed/stories/user/:userName
Response: { stories: [...], storyCount: 2 }
```

#### Add Story (Protected)
```
POST /api/feed/stories/add
Body: { "storyImageOrVideo": "url" }
Response: { story: {...}, totalStories: 3 }
```

#### Delete Story (Protected)
```
DELETE /api/feed/stories/:storyIndex
Response: { message: "Story deleted successfully", remainingStories: 2 }
```

---

### Saved Posts Routes (`/api/saved`)

#### Get Saved Posts (Protected)
```
GET /api/saved/my-saves?page=1&limit=10
Response: { 
  posts: [...saved posts], 
  totalSaved: 25,
  totalPages: 3,
  currentPage: 1
}
```

---

### Search Routes (`/api/search`)

#### Search Users
```
GET /api/search/users?query=john&page=1&limit=20
Response: { results: [...users], totalResults: 5, totalPages: 1 }
```

#### Search Posts
```
GET /api/search/posts?query=photography&page=1&limit=20
Response: { results: [...posts], totalResults: 15, totalPages: 1 }
```

#### Global Search
```
GET /api/search?query=travel&page=1&limit=20
Response: { 
  users: [...top 5 users],
  posts: [...posts matching query]
}
```

---

### Explore Routes (`/api/explore`)

#### Get Explore Feed
```
GET /api/explore/feed?page=1&limit=20
Response: { 
  posts: [...trending posts],
  totalPosts: 1000,
  totalPages: 50,
  currentPage: 1
}
```

#### Get Trending Posts
```
GET /api/explore/trending?page=1&limit=20
Response: { 
  posts: [...sorted by likes + comments],
  totalPosts: 1000,
  totalPages: 50
}
```

#### Get Suggested Users (Protected)
```
GET /api/explore/suggested-users?limit=10
Response: { 
  suggestedUsers: [...popular users not following],
  suggestedCount: 10
}
```

#### Get Reels
```
GET /api/explore/reels?page=1&limit=10
Response: { 
  reels: [...video posts],
  totalReels: 500,
  totalPages: 50,
  currentPage: 1
}
```

---

### Hashtag Routes (`/api/hashtags`)

#### Get Posts by Hashtag
```
GET /api/hashtags/posts?hashtag=coding&page=1&limit=20
Response: { 
  posts: [...posts with #coding],
  totalPosts: 150,
  totalPages: 8
}
```

#### Get Trending Hashtags
```
GET /api/hashtags/trending?limit=20
Response: { 
  hashtags: [
    { hashtag: "#coding", postCount: 1500 },
    ...
  ],
  totalTrendingHashtags: 20
}
```

#### Search Hashtags
```
GET /api/hashtags/search?query=cod&limit=20
Response: { 
  hashtags: [
    { hashtag: "#coding", postCount: 1500 },
    { hashtag: "#code", postCount: 800 },
    ...
  ],
  totalResults: 5
}
```

---

### Notification Routes (`/api/notifications`)

#### Get Notifications (Protected)
```
GET /api/notifications?page=1&limit=20&type=like&isRead=false
Query Params:
  - page: number (default: 1)
  - limit: number (default: 20)
  - type: 'like' | 'comment' | 'follow' | 'share' (optional)
  - isRead: true | false (optional)

Response: { 
  notifications: [...],
  totalNotifications: 50,
  unreadCount: 5,
  totalPages: 3,
  currentPage: 1
}
```

#### Get Unread Count (Protected)
```
GET /api/notifications/unread/count
Response: { unreadCount: 5 }
```

#### Mark Notification as Read (Protected)
```
PUT /api/notifications/:notificationId/read
Response: { notification: {...}, message: "Notification marked as read" }
```

#### Mark All as Read (Protected)
```
PUT /api/notifications/read/all
Response: { message: "All notifications marked as read", updatedCount: 5 }
```

#### Delete Notification (Protected)
```
DELETE /api/notifications/:notificationId
Response: { message: "Notification deleted successfully" }
```

#### Delete All Notifications (Protected)
```
DELETE /api/notifications/delete/all
Response: { message: "All notifications deleted successfully", deletedCount: 50 }
```

---

## Error Responses

All errors follow this format:
```json
{
  "message": "Error description"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `500` - Internal Server Error

---

## Pagination

Most list endpoints support pagination:
```
?page=1&limit=20
```
- `page` - 1-indexed page number (default: 1)
- `limit` - Items per page (default: varies, max: 100)

Response includes:
```json
{
  "totalItems": 500,
  "totalPages": 25,
  "currentPage": 1,
  "items": [...]
}
```

---

## CORS Headers

Requests automatically include:
```
credentials: 'include'
headers: {
  'Content-Type': 'application/json'
}
```

Token is stored in HTTP-only cookie - no need to manually handle JWT.

---

## Testing with cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/user/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John","email":"john@example.com","password":"pass123","userName":"john","profileName":"John"}'

# Get own profile (after login, cookie is set)
curl -X GET http://localhost:3000/api/profile/me/profile \
  -H "Content-Type: application/json" \
  --cookie "token=TOKEN_VALUE_HERE"
```

---

## Notes

- All timestamps are in ISO 8601 format
- User IDs and post IDs are MongoDB ObjectIds
- Images/videos should be hosted externally and passed as URLs
- Hashtags are auto-extracted from post descriptions
- Stories auto-cleanup after 24 hours
- Maximum 10 photos per post, OR 1 video (not both)
