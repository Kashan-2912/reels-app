const userModel = require('../models/user.model');
const postModel = require('../models/post.model');

// Search users by username or profile name
async function searchUsers(req, res) {
    try {
        const { query, page = 1, limit = 20 } = req.query;

        if (!query || query.trim() === '') {
            return res.status(400).json({ message: 'Search query is required.' });
        }

        // Validate pagination
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
        const skip = (pageNum - 1) * limitNum;

        // Create regex for case-insensitive search
        const searchRegex = new RegExp(query.trim(), 'i');

        // Search users by username or profile name
        const users = await userModel.find({
            $or: [
                { userName: searchRegex },
                { profileName: searchRegex }
            ]
        })
            .select('_id userName profileName profilePic email followersCount followingCount')
            .skip(skip)
            .limit(limitNum)
            .sort({ followersCount: -1 }); // Sort by followers descending

        const totalUsers = await userModel.countDocuments({
            $or: [
                { userName: searchRegex },
                { profileName: searchRegex }
            ]
        });

        const totalPages = Math.ceil(totalUsers / limitNum);

        return res.status(200).json({
            message: 'Users found',
            query: query.trim(),
            totalResults: totalUsers,
            totalPages,
            currentPage: pageNum,
            results: users
        });

    } catch (error) {
        console.error('Error searching users:', error);
        return res.status(500).json({ message: 'Internal server error while searching users.' });
    }
}

// Search posts by description/caption
async function searchPosts(req, res) {
    try {
        const { query, page = 1, limit = 20 } = req.query;

        if (!query || query.trim() === '') {
            return res.status(400).json({ message: 'Search query is required.' });
        }

        // Validate pagination
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
        const skip = (pageNum - 1) * limitNum;

        // Create regex for case-insensitive search
        const searchRegex = new RegExp(query.trim(), 'i');

        // Search posts by description
        const posts = await postModel.find({
            description: searchRegex
        })
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 })
            .populate('userId', 'userName profileName profilePic')
            .populate('likes', 'userName')
            .populate('comments')
            .populate('saves', 'userName');

        const totalPosts = await postModel.countDocuments({
            description: searchRegex
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
            isReel: post.isReel,
            likesCount: post.likesCount,
            savesCount: post.savesCount,
            commentsCount: post.commentsCount,
            sharesCount: post.sharesCount,
            createdAt: post.createdAt
        }));

        return res.status(200).json({
            message: 'Posts found',
            query: query.trim(),
            totalResults: totalPosts,
            totalPages,
            currentPage: pageNum,
            results: formattedPosts
        });

    } catch (error) {
        console.error('Error searching posts:', error);
        return res.status(500).json({ message: 'Internal server error while searching posts.' });
    }
}

// Global search - search both users and posts
async function globalSearch(req, res) {
    try {
        const { query, page = 1, limit = 20 } = req.query;

        if (!query || query.trim() === '') {
            return res.status(400).json({ message: 'Search query is required.' });
        }

        // Validate pagination
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));
        const skip = (pageNum - 1) * limitNum;

        // Create regex for case-insensitive search
        const searchRegex = new RegExp(query.trim(), 'i');

        // Search users
        const users = await userModel.find({
            $or: [
                { userName: searchRegex },
                { profileName: searchRegex }
            ]
        })
            .select('_id userName profileName profilePic followersCount')
            .limit(5)
            .sort({ followersCount: -1 });

        // Search posts
        const posts = await postModel.find({
            description: searchRegex
        })
            .skip(skip)
            .limit(limitNum)
            .sort({ likesCount: -1 })
            .populate('userId', 'userName profileName profilePic')
            .select('_id userId userName profilePic photos video description likesCount commentsCount createdAt');

        const formattedPosts = posts.map(post => ({
            id: post._id,
            userId: post.userId,
            userName: post.userName,
            profilePic: post.profilePic,
            photos: post.photos,
            video: post.video,
            description: post.description,
            likesCount: post.likesCount,
            commentsCount: post.commentsCount,
            createdAt: post.createdAt
        }));

        return res.status(200).json({
            message: 'Search results',
            query: query.trim(),
            users,
            posts: formattedPosts
        });

    } catch (error) {
        console.error('Error performing global search:', error);
        return res.status(500).json({ message: 'Internal server error while performing global search.' });
    }
}

module.exports = {
    searchUsers,
    searchPosts,
    globalSearch
};
