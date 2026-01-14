const postModel = require('../models/post.model');

// Extract hashtags from text
function extractHashtags(text) {
    if (!text) return [];
    const hashtagRegex = /#[\w]+/g;
    const hashtags = text.match(hashtagRegex) || [];
    return hashtags.map(tag => tag.toLowerCase()); // Remove duplicates
}

// Search posts by hashtag
async function getPostsByHashtag(req, res) {
    try {
        const { hashtag, page = 1, limit = 20 } = req.query;
        const userId = req.userId || null;

        if (!hashtag || hashtag.trim() === '') {
            return res.status(400).json({ message: 'Hashtag is required.' });
        }

        // Validate pagination
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
        const skip = (pageNum - 1) * limitNum;

        // Normalize hashtag
        let searchHashtag = hashtag.trim().toLowerCase();
        if (!searchHashtag.startsWith('#')) {
            searchHashtag = '#' + searchHashtag;
        }

        // Search posts with hashtag
        const posts = await postModel.find({
            hashtags: searchHashtag
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('userId', 'userName profileName profilePic')
            .populate('likes', 'userName')
            .populate('comments')
            .populate('saves', 'userName');

        const totalPosts = await postModel.countDocuments({
            hashtags: searchHashtag
        });

        const totalPages = Math.ceil(totalPosts / limitNum);

        // Format response
        const formattedPosts = posts.map(post => ({
            id: post._id,
            userId: post.userId,
            userName: post.userName,
            profileName: post.profileName,
            profilePic: post.profilePic,
            photos: post.photos,
            video: post.video,
            description: post.description,
            hashtags: post.hashtags,
            isReel: post.isReel,
            isLiked: userId ? post.likes.some(like => like._id.toString() === userId) : false,
            likesCount: post.likesCount,
            isSaved: userId ? post.saves.some(save => save._id.toString() === userId) : false,
            savesCount: post.savesCount,
            commentsCount: post.commentsCount,
            sharesCount: post.sharesCount,
            createdAt: post.createdAt
        }));

        return res.status(200).json({
            message: `Posts with hashtag ${searchHashtag} retrieved successfully`,
            hashtag: searchHashtag,
            totalPosts,
            totalPages,
            currentPage: pageNum,
            posts: formattedPosts
        });

    } catch (error) {
        console.error('Error searching posts by hashtag:', error);
        return res.status(500).json({ message: 'Internal server error while searching posts by hashtag.' });
    }
}

// Get trending hashtags
async function getTrendingHashtags(req, res) {
    try {
        const { limit = 20 } = req.query;

        // Validate limit
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));

        // Aggregate hashtags with usage count
        const trendingHashtags = await postModel.aggregate([
            {
                $unwind: '$hashtags'
            },
            {
                $group: {
                    _id: '$hashtags',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: limitNum
            },
            {
                $project: {
                    _id: 0,
                    hashtag: '$_id',
                    postCount: '$count'
                }
            }
        ]);

        return res.status(200).json({
            message: 'Trending hashtags retrieved successfully',
            totalTrendingHashtags: trendingHashtags.length,
            hashtags: trendingHashtags
        });

    } catch (error) {
        console.error('Error retrieving trending hashtags:', error);
        return res.status(500).json({ message: 'Internal server error while retrieving trending hashtags.' });
    }
}

// Search hashtags by prefix
async function searchHashtags(req, res) {
    try {
        const { query, limit = 20 } = req.query;

        if (!query || query.trim() === '') {
            return res.status(400).json({ message: 'Search query is required.' });
        }

        // Validate limit
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));

        // Normalize search query
        let searchQuery = query.trim().toLowerCase();
        if (!searchQuery.startsWith('#')) {
            searchQuery = '#' + searchQuery;
        }

        // Create regex for prefix search
        const hashtagRegex = new RegExp('^' + searchQuery, 'i');

        // Aggregate hashtags matching the prefix
        const matchingHashtags = await postModel.aggregate([
            {
                $unwind: '$hashtags'
            },
            {
                $match: {
                    hashtags: hashtagRegex
                }
            },
            {
                $group: {
                    _id: '$hashtags',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: limitNum
            },
            {
                $project: {
                    _id: 0,
                    hashtag: '$_id',
                    postCount: '$count'
                }
            }
        ]);

        return res.status(200).json({
            message: 'Hashtags found',
            query: searchQuery,
            totalResults: matchingHashtags.length,
            hashtags: matchingHashtags
        });

    } catch (error) {
        console.error('Error searching hashtags:', error);
        return res.status(500).json({ message: 'Internal server error while searching hashtags.' });
    }
}

module.exports = {
    extractHashtags,
    getPostsByHashtag,
    getTrendingHashtags,
    searchHashtags
};
