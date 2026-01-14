const postModel = require('../models/post.model');
const userModel = require('../models/user.model');
const mongoose = require('mongoose');

// Get user's saved posts
async function getSavedPosts(req, res) {
    try {
        const userId = req.userId;
        const { page = 1, limit = 10 } = req.query;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        // Validate pagination
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
        const skip = (pageNum - 1) * limitNum;

        // Get user
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Get saved posts with pagination
        const savedPosts = await postModel.find({ _id: { $in: user.saves } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('userId', 'userName profileName profilePic')
            .populate('likes', 'userName')
            .populate({
                path: 'comments',
                populate: {
                    path: 'userId',
                    select: 'userName profilePic'
                }
            });

        const totalSaved = user.saves.length;
        const totalPages = Math.ceil(totalSaved / limitNum);

        // Format response to include isLiked and isSaved for current user
        const formattedPosts = savedPosts.map(post => ({
            id: post._id,
            userId: post.userId,
            userName: post.userName,
            profileName: post.profileName,
            profilePic: post.profilePic,
            photos: post.photos,
            video: post.video,
            description: post.description,
            isReel: post.isReel,
            isLiked: post.likes.some(like => like._id.toString() === userId),
            likesCount: post.likesCount,
            isSaved: true, // Current user always saved these
            savesCount: post.savesCount,
            commentsCount: post.commentsCount,
            sharesCount: post.sharesCount,
            comments: post.comments,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
        }));

        return res.status(200).json({
            message: 'Saved posts retrieved successfully',
            totalSaved,
            totalPages,
            currentPage: pageNum,
            posts: formattedPosts
        });

    } catch (error) {
        console.error('Error retrieving saved posts:', error);
        return res.status(500).json({ message: 'Internal server error while retrieving saved posts.' });
    }
}

module.exports = {
    getSavedPosts
};
