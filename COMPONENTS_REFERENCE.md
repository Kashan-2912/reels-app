# Frontend Components Quick Reference

## Component Location Map

### New Components Added (Phase 2)

#### 1. PostCard Component
**Location:** `src/components/PostCard.jsx`
**Type:** Reusable component
**Props:**
```javascript
{
  post: {
    id, description, photos[], video, likesCount, commentsCount, savesCount,
    isLiked, isSaved, userName, profileName, profilePic, createdAt, hashtags,
    comments[]
  }
}
```
**Usage:**
```jsx
<PostCard post={post} />
```
**Used In:**
- Home feed (`app/home/page.js`)
- Explore page (`app/explore/page.js`)
- Search page (`app/search/page.js`)
- Hashtag page (`app/hashtag/[hashtag]/page.js`)
- Post detail page (`app/post/[postId]/page.js`)
- Saved posts page (`app/saved/page.js`)

---

#### 2. CreatePostModal Component
**Location:** `src/components/CreatePostModal.jsx`
**Type:** Modal component
**Props:**
```javascript
{
  isOpen: boolean,
  onClose: function
}
```
**Usage:**
```jsx
<CreatePostModal isOpen={isOpen} onClose={handleClose} />
```
**Used In:**
- Layout component (`src/components/Layout.jsx`) - via Create button

**Features:**
- Photo upload (multiple)
- Video upload (single)
- Caption (100 char limit)
- Description (2000 char limit)
- Hashtag parsing and display
- File preview and removal

---

#### 3. StoriesSection Component
**Location:** `src/components/StoriesSection.jsx`
**Type:** Reusable component
**Props:**
```javascript
{
  stories: [
    {
      id, media, userName, profileName, profilePic,
      expiresAt, viewers[]
    }
  ],
  onAddStory: function
}
```
**Usage:**
```jsx
<StoriesSection stories={stories} onAddStory={handleAddStory} />
```
**Used In:**
- Home page (`app/home/page.js`)

**Features:**
- Horizontal scroll carousel
- Story thumbnails with duration bars
- Add story button
- 24-hour expiry countdown
- Unviewed indicator

---

## Page Location Map

### New Pages Added (Phase 2)

#### 1. Explore Page
**Location:** `app/explore/page.js`
**Route:** `/explore`
**Features:**
- Trending posts (grid)
- Suggested users (sidebar)
- Trending hashtags (sidebar)
- Search bar integration

---

#### 2. Search Page
**Location:** `app/search/page.js`
**Route:** `/search`
**Features:**
- Search input with debounce
- Tab filtering (Users, Posts, Hashtags)
- Recent search history
- Search result cards

---

#### 3. Notifications Page
**Location:** `app/notifications/page.js`
**Route:** `/notifications`
**Features:**
- Notification filtering (All, Likes, Comments, Follows)
- Mark as read functionality
- Delete notifications
- Unread count display

---

#### 4. Saved Posts Page
**Location:** `app/saved/page.js`
**Route:** `/saved`
**Features:**
- Grid and list view toggle
- Filter by media type (All, Photos, Videos)
- Remove from saves
- Post count display

---

#### 5. Hashtag Page
**Location:** `app/hashtag/[hashtag]/page.js`
**Route:** `/hashtag/[hashtag]`
**Dynamic Route:** Yes
**Features:**
- Hashtag stats display
- Follow/unfollow hashtag
- Posts by hashtag
- Back navigation

---

#### 6. Post Detail Page
**Location:** `app/post/[postId]/page.js`
**Route:** `/post/[postId]`
**Dynamic Route:** Yes
**Features:**
- Large post image/video
- Post details sidebar
- Comments section
- Comment add/delete
- Post delete (if owner)
- Engagement stats

---

#### 7. Reels Page
**Location:** `app/reels/page.js`
**Route:** `/reels`
**Features:**
- Full-screen vertical video
- Snap scroll between reels
- Right-side action buttons
- Engagement counts
- Auto-play current reel

---

## Component Hierarchy

```
Layout
├── Home Page
│   ├── StoriesSection
│   └── PostCard (multiple)
├── Explore Page
│   └── PostCard (multiple)
├── Search Page
│   ├── UserSearchResult
│   ├── PostSearchResult
│   └── HashtagSearchResult
├── Notifications Page
│   └── NotificationItem (multiple)
├── Saved Posts Page
│   └── PostCard (multiple)
├── Hashtag Page
│   └── PostCard (multiple)
├── Post Detail Page
│   ├── PostCard
│   └── CommentSection
├── Reels Page
│   └── ReelCard (inline)
├── Profile Page
│   └── PostCard (multiple in grid)
├── Login Page
├── Register Page
└── CreatePostModal
```

---

## State Management Integration

### Zustand Stores Used

#### Auth Store (`src/store/authStore.js`)
**Used In:**
- All protected pages (auth guard)
- Header for user info
- Profile link generation

**Exports:**
- `user` - Current user object
- `logout()` - Sign out function

#### Feed Store (`src/store/feedStore.js`)
**Used In:**
- Home feed (`app/home/page.js`)
- Explore page (`app/explore/page.js`)
- Search page (`app/search/page.js`)
- Saved posts page (`app/saved/page.js`)
- PostCard component

**Exports:**
- `getHomeFeed(page)` - Fetch paginated posts
- `likePost(postId)` - Like action
- `unlikePost(postId)` - Unlike action
- `savePost(postId)` - Save post
- `unsavePost(postId)` - Remove from saves

#### Profile Store (`src/store/profileStore.js`)
**Used In:**
- Profile page (`app/profile/[userName]/page.js`)
- Header user info

**Exports:**
- `getProfile(userName)` - Fetch user profile
- `followUser(userName)` - Follow action
- `unfollowUser(userName)` - Unfollow action

---

## Service Layer Integration

### API Services (`src/services/index.js`)

**Post Services:**
```javascript
postService.createPost(data)          // Create
postService.getPost(postId)           // Get single
postService.getUserPosts(userName)    // Get by user
postService.deletePost(postId)        // Delete
postService.likePost(postId)          // Like
postService.unlikePost(postId)        // Unlike
postService.savePost(postId)          // Save
postService.unsavePost(postId)        // Unsave
postService.addComment(postId, text)  // Comment
postService.deleteComment(postId, commentId)
postService.getPostComments(postId)
```

**Profile Services:**
```javascript
profileService.getProfile(userName)
profileService.updateProfile(data)
profileService.followUser(targetUserName)
profileService.unfollowUser(targetUserName)
```

**Feed Services:**
```javascript
feedService.getHomeFeed(page, limit)
feedService.getExplore(page, limit)
feedService.getTrendingHashtags()
```

---

## Navigation Structure

### Sidebar Navigation (Desktop)
```
Reel App (Logo)
├── Home → /home
├── Explore → /explore
├── Create → Opens CreatePostModal
├── Search → /search
├── Notifications → /notifications
├── Saved → /saved
├── Profile → /profile/[userName]
└── Logout
```

### Dynamic Routes
- `/profile/[userName]` - User profile
- `/hashtag/[hashtag]` - Hashtag results
- `/post/[postId]` - Post details

---

## Quick Start Guide for Developers

### Adding a New Feature

1. **Create Component:**
   ```bash
   touch src/components/YourComponent.jsx
   ```

2. **Create Page (if route-based):**
   ```bash
   touch app/yourpage/page.js
   ```

3. **Import Store if needed:**
   ```javascript
   import { useAuthStore } from '@/store/authStore';
   import { useFeedStore } from '@/store/feedStore';
   ```

4. **Import Services if needed:**
   ```javascript
   import { postService, profileService } from '@/services';
   ```

5. **Add Navigation (if applicable):**
   - Update `src/components/Layout.jsx`
   - Add to `navItems` array

6. **Use Toast for Feedback:**
   ```javascript
   import toast from 'react-hot-toast';
   
   toast.success('Success message');
   toast.error('Error message');
   ```

---

## Common Patterns

### Handling Auth Guard
```javascript
useEffect(() => {
  if (!user) {
    router.push('/login');
    return;
  }
  // Component logic
}, [user, router]);
```

### Infinite Scroll Implementation
```javascript
const observerTarget = useRef(null);

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && hasMore && !isLoading) {
        loadMore();
      }
    },
    { threshold: 0.1 }
  );

  if (observerTarget.current) {
    observer.observe(observerTarget.current);
  }

  return () => {
    if (observerTarget.current) {
      observer.unobserve(observerTarget.current);
    }
  };
}, [hasMore, isLoading, loadMore]);

// In JSX:
<div ref={observerTarget} className="py-8">
  {isLoading && <div>Loading...</div>}
</div>
```

### Using Store Actions
```javascript
const { likePost, unlikePost } = useFeedStore();

const handleLike = async () => {
  try {
    if (post.isLiked) {
      await unlikePost(post.id);
    } else {
      await likePost(post.id);
    }
  } catch (error) {
    toast.error('Failed to like post');
  }
};
```

---

## Styling Guide

### Colors
- **Primary Red:** `#EF4444` / `text-red-500`, `bg-red-500`
- **Dark Background:** `dark:bg-gray-900`
- **Dark Text:** `dark:text-white`
- **Borders:** `border-gray-200 dark:border-gray-800`

### Responsive Classes
```css
/* Mobile first */
md:col-span-2      /* Tablet and up */
lg:w-64            /* Desktop and up */
md:grid-cols-3     /* 3 columns on tablet */
```

### Common Utilities
```jsx
/* Hover Effects */
hover:opacity-80 transition
hover:bg-gray-100 dark:hover:bg-gray-800

/* Loading State */
disabled:opacity-50
animate-spin

/* Text Truncation */
line-clamp-2
truncate
```

---

## API Response Mock Structure

### Post Object
```javascript
{
  id: string,
  description: string,
  photos: string[],
  video: string | null,
  likesCount: number,
  commentsCount: number,
  savesCount: number,
  sharesCount: number,
  isLiked: boolean,
  isSaved: boolean,
  userName: string,
  profileName: string,
  profilePic: string,
  createdAt: date,
  hashtags: string[],
  comments: CommentObject[]
}
```

### Comment Object
```javascript
{
  _id: string,
  text: string,
  userName: string,
  profileName: string,
  profilePic: string,
  likesCount: number,
  createdAt: date
}
```

---

## Testing Checklist

### Component Tests
- [ ] PostCard renders correctly
- [ ] CreatePostModal opens/closes
- [ ] StoriesSection carousel scrolls
- [ ] Like/Unlike updates count
- [ ] Save/Unsave works
- [ ] Comment add/delete works
- [ ] Search filters by tab
- [ ] Notifications filter works

### Page Tests
- [ ] Home page loads posts
- [ ] Explore page loads trending
- [ ] Search page handles queries
- [ ] Notifications page displays
- [ ] Saved page shows saved posts
- [ ] Hashtag page loads posts
- [ ] Post detail page displays comments
- [ ] Reels page scrolls

### Navigation Tests
- [ ] Sidebar navigation works
- [ ] Dynamic routes load correctly
- [ ] Back buttons work
- [ ] Links navigate properly
- [ ] Auth guards redirect

---

## Debugging Tips

### Console Logs
```javascript
// Check store state
console.log('Posts:', posts);
console.log('User:', user);

// Check API responses
api.interceptors.response.use(response => {
  console.log('API Response:', response);
  return response;
});
```

### Common Issues
- **Posts not loading:** Check `getHomeFeed()` call and page number
- **Modal not opening:** Verify `isOpen` prop and state management
- **Images not showing:** Check placeholder URLs and image paths
- **Navigation broken:** Verify dynamic route file naming `[param]`
- **Auth redirecting:** Check user object in auth store

---

## Performance Notes

### Current Optimizations
- Reusable PostCard component
- Store-based state (no prop drilling)
- Intersection Observer for infinite scroll
- Modal for create (no separate page load)

### Future Optimizations
- Image lazy loading with blur placeholders
- Route-based code splitting
- Virtual scrolling for large lists
- Memoization of expensive components
- Image compression before upload

---

This reference guide will be updated as more features are implemented. For detailed implementation info, see `IMPLEMENTATION_SUMMARY_PHASE2.md`.
