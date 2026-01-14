const express = require('express');
const {
    getTrendingPosts,
    getSuggestedUsers,
    getExploreFeed,
    getReels
} = require('../controllers/explore.controller');
const verifyToken = require('../middleware/auth.middleware');

const router = express.Router();

// Get explore feed (public)
router.get('/feed', getExploreFeed);

// Get trending posts (public)
router.get('/trending', getTrendingPosts);

// Get suggested users to follow (protected)
router.get('/suggested-users', verifyToken, getSuggestedUsers);

// Get reels / video posts (public)
router.get('/reels', getReels);

module.exports = router;
