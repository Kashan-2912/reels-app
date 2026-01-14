const express = require('express');
const {
    searchUsers,
    searchPosts,
    globalSearch
} = require('../controllers/search.controller');

const router = express.Router();

// Global search - users and posts (public)
router.get('/', globalSearch);

// Search users (public)
router.get('/users', searchUsers);

// Search posts (public)
router.get('/posts', searchPosts);

module.exports = router;
