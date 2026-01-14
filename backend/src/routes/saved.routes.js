const express = require('express');
const { getSavedPosts } = require('../controllers/saved.controller');
const verifyToken = require('../middleware/auth.middleware');

const router = express.Router();

// Get user's saved posts (protected)
router.get('/my-saves', verifyToken, getSavedPosts);

module.exports = router;
