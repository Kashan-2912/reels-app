const express = require('express');
const {
    getProfile,
    updateProfile,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getOwnProfile
} = require('../controllers/profile.controller');
const verifyToken = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/view/:userName', getProfile);
router.get('/:userName/followers', getFollowers);
router.get('/:userName/following', getFollowing);

// Protected routes (require authentication)
router.get('/me/profile', verifyToken, getOwnProfile);
router.put('/edit', verifyToken, updateProfile);
router.post('/follow', verifyToken, followUser);
router.post('/unfollow', verifyToken, unfollowUser);

module.exports = router;
