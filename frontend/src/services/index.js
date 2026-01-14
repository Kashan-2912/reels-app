import api from './api';

// Auth Services
export const authService = {
  register: (data) => api.post('/auth/user/register', data),
  login: (data) => api.post('/auth/user/login', data),
  logout: () => api.post('/auth/user/logout'),
};

// Profile Services
export const profileService = {
  getProfile: (userName) => api.get(`/profile/view/${userName}`),
  getOwnProfile: () => api.get('/profile/me/profile'),
  updateProfile: (data) => api.put('/profile/edit', data),
  followUser: (targetUserName) => api.post('/profile/follow', { targetUserName }),
  unfollowUser: (targetUserName) => api.post('/profile/unfollow', { targetUserName }),
  getFollowers: (userName) => api.get(`/profile/${userName}/followers`),
  getFollowing: (userName) => api.get(`/profile/${userName}/following`),
};

// Post Services
export const postService = {
  createPost: (data) => api.post('/posts/create', data),
  getPost: (postId) => api.get(`/posts/${postId}`),
  getUserPosts: (userName, page = 1, limit = 10) =>
    api.get(`/posts/user/${userName}?page=${page}&limit=${limit}`),
  updatePost: (postId, data) => api.put(`/posts/${postId}`, data),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  
  // Likes
  likePost: (postId) => api.post(`/posts/${postId}/like`),
  unlikePost: (postId) => api.post(`/posts/${postId}/unlike`),
  getPostLikes: (postId, page = 1, limit = 20) =>
    api.get(`/posts/${postId}/likes?page=${page}&limit=${limit}`),
  
  // Comments
  addComment: (postId, text) => api.post(`/posts/${postId}/comment`, { text }),
  deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comment/${commentId}`),
  getPostComments: (postId, page = 1, limit = 20) =>
    api.get(`/posts/${postId}/comments?page=${page}&limit=${limit}`),
  
  // Saves
  savePost: (postId) => api.post(`/posts/${postId}/save`),
  unsavePost: (postId) => api.post(`/posts/${postId}/unsave`),
  
  // Share
  sharePost: (postId) => api.post(`/posts/${postId}/share`),
  
  // Views
  trackView: (postId) => api.post(`/posts/${postId}/view`),
  getPostViews: (postId, page = 1, limit = 20) =>
    api.get(`/posts/${postId}/views?page=${page}&limit=${limit}`),
};

// Comment Services
export const commentService = {
  likeComment: (commentId) => api.post(`/posts/comment/${commentId}/like`),
  unlikeComment: (commentId) => api.post(`/posts/comment/${commentId}/unlike`),
  getCommentLikes: (commentId, page = 1, limit = 20) =>
    api.get(`/posts/comment/${commentId}/likes?page=${page}&limit=${limit}`),
};

// Feed Services
export const feedService = {
  getHomeFeed: (page = 1, limit = 10) =>
    api.get(`/feed/home?page=${page}&limit=${limit}`),
  getFollowingStories: () => api.get('/feed/stories'),
  getUserStory: (userName) => api.get(`/feed/stories/user/${userName}`),
  addStory: (storyImageOrVideo) =>
    api.post('/feed/stories/add', { storyImageOrVideo }),
  deleteStory: (storyIndex) => api.delete(`/feed/stories/${storyIndex}`),
};

// Saved Services
export const savedService = {
  getSavedPosts: (page = 1, limit = 10) =>
    api.get(`/saved/my-saves?page=${page}&limit=${limit}`),
};

// Search Services
export const searchService = {
  searchUsers: (query, page = 1, limit = 20) =>
    api.get(`/search/users?query=${query}&page=${page}&limit=${limit}`),
  searchPosts: (query, page = 1, limit = 20) =>
    api.get(`/search/posts?query=${query}&page=${page}&limit=${limit}`),
  globalSearch: (query, page = 1, limit = 20) =>
    api.get(`/search?query=${query}&page=${page}&limit=${limit}`),
};

// Explore Services
export const exploreService = {
  getExploreFeed: (page = 1, limit = 20) =>
    api.get(`/explore/feed?page=${page}&limit=${limit}`),
  getTrendingPosts: (page = 1, limit = 20) =>
    api.get(`/explore/trending?page=${page}&limit=${limit}`),
  getSuggestedUsers: (limit = 10) =>
    api.get(`/explore/suggested-users?limit=${limit}`),
  getReels: (page = 1, limit = 10) =>
    api.get(`/explore/reels?page=${page}&limit=${limit}`),
};

// Hashtag Services
export const hashtagService = {
  getPostsByHashtag: (hashtag, page = 1, limit = 20) =>
    api.get(`/hashtags/posts?hashtag=${hashtag}&page=${page}&limit=${limit}`),
  getTrendingHashtags: (limit = 20) =>
    api.get(`/hashtags/trending?limit=${limit}`),
  searchHashtags: (query, limit = 20) =>
    api.get(`/hashtags/search?query=${query}&limit=${limit}`),
};

// Notification Services
export const notificationService = {
  getNotifications: (page = 1, limit = 20, type = null, isRead = null) => {
    let url = `/notifications?page=${page}&limit=${limit}`;
    if (type) url += `&type=${type}`;
    if (isRead !== null) url += `&isRead=${isRead}`;
    return api.get(url);
  },
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAsRead: (notificationId) =>
    api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read/all'),
  deleteNotification: (notificationId) =>
    api.delete(`/notifications/${notificationId}`),
  deleteAllNotifications: () => api.delete('/notifications/delete/all'),
};
