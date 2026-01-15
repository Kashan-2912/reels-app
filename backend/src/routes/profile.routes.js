const express = require('express');
const {
    getProfile,
    updateProfile,
    followUser,
    unfollowUser,
    removeFollower,
    getFollowers,
    getFollowing,
    getOwnProfile
} = require('../controllers/profile.controller');
const verifyToken = require('../middleware/auth.middleware');

const router = express.Router();

// Protected routes (require authentication) - SPECIFIC ROUTES FIRST
router.get('/me/profile', verifyToken, getOwnProfile);
router.put('/edit', verifyToken, updateProfile);
router.post('/follow', verifyToken, followUser);
router.post('/unfollow', verifyToken, unfollowUser);
router.post('/remove-follower', verifyToken, removeFollower);

// Public routes - PARAMETERIZED ROUTES LAST
router.get('/view/:userName', getProfile);
router.get('/:userName/followers', getFollowers);
router.get('/:userName/following', getFollowing);

module.exports = router;
