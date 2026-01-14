const express = require('express');
const {
    getHomeFeed,
    getFollowingStories,
    getUserStory,
    addStory,
    deleteStory
} = require('../controllers/feed.controller');
const verifyToken = require('../middleware/auth.middleware');

const router = express.Router();

// ==================== Feed Routes ====================

// Get home feed with posts from followed users (protected)
router.get('/home', verifyToken, getHomeFeed);

// ==================== Stories Routes ====================

// Get stories from followed users (protected)
router.get('/stories', verifyToken, getFollowingStories);

// Get specific user's story (public)
router.get('/stories/user/:userName', getUserStory);

// Add story (protected)
router.post('/stories/add', verifyToken, addStory);

// Delete specific story (protected)
router.delete('/stories/:storyIndex', verifyToken, deleteStory);

module.exports = router;
