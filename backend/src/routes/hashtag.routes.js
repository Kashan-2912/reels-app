const express = require('express');
const {
    getPostsByHashtag,
    getTrendingHashtags,
    searchHashtags
} = require('../controllers/hashtag.controller');

const router = express.Router();

// Get posts by hashtag (public)
router.get('/posts', getPostsByHashtag);

// Get trending hashtags (public)
router.get('/trending', getTrendingHashtags);

// Search hashtags by prefix (public)
router.get('/search', searchHashtags);

module.exports = router;
