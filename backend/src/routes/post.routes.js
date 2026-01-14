const express = require('express');
const {
    // CRUD
    createPost,
    getPost,
    getUserPosts,
    updatePost,
    deletePost,
    // Likes
    likePost,
    unlikePost,
    getPostLikes,
    // Comments
    addComment,
    deleteComment,
    getPostComments,
    // Saves
    savePost,
    unsavePost,
    // Share
    sharePost
} = require('../controllers/post.controller');
const verifyToken = require('../middleware/auth.middleware');

const router = express.Router();

// ==================== CRUD Routes ====================

// Create post (protected)
router.post('/create', verifyToken, createPost);

// Get single post (public)
router.get('/:postId', getPost);

// Get user posts (public)
router.get('/user/:userName', getUserPosts);

// Update post (protected)
router.put('/:postId', verifyToken, updatePost);

// Delete post (protected)
router.delete('/:postId', verifyToken, deletePost);

// ==================== Like Routes ====================

// Like post (protected)
router.post('/:postId/like', verifyToken, likePost);

// Unlike post (protected)
router.post('/:postId/unlike', verifyToken, unlikePost);

// Get post likes (public)
router.get('/:postId/likes', getPostLikes);

// ==================== Comment Routes ====================

// Add comment (protected)
router.post('/:postId/comment', verifyToken, addComment);

// Delete comment (protected)
router.delete('/:postId/comment/:commentId', verifyToken, deleteComment);

// Get post comments (public)
router.get('/:postId/comments', getPostComments);

// ==================== Save Routes ====================

// Save post (protected)
router.post('/:postId/save', verifyToken, savePost);

// Unsave post (protected)
router.post('/:postId/unsave', verifyToken, unsavePost);

// ==================== Share Routes ====================

// Share post (protected)
router.post('/:postId/share', verifyToken, sharePost);

module.exports = router;
