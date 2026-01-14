const postModel = require('../models/post.model');
const commentModel = require('../models/comment.model');
const mongoose = require('mongoose');

// ==================== Post Views ====================

// Track post view
async function trackPostView(req, res) {
    try {
        const userId = req.userId;
        const { postId } = req.params;

        if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Valid post ID is required.' });
        }

        // Get post
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Check if user already viewed this post
        const alreadyViewed = post.views.some(view => 
            view.userId && view.userId.toString() === userId
        );

        if (!alreadyViewed && userId) {
            // Add view
            post.views.push({
                userId,
                viewedAt: new Date()
            });
            post.viewsCount = post.views.length;
            await post.save();
        } else if (!alreadyViewed && !userId) {
            // Anonymous view
            post.views.push({
                userId: null,
                viewedAt: new Date()
            });
            post.viewsCount = post.views.length;
            await post.save();
        }

        return res.status(200).json({
            message: 'View tracked successfully',
            viewsCount: post.viewsCount
        });

    } catch (error) {
        console.error('Error tracking post view:', error);
        return res.status(500).json({ message: 'Internal server error while tracking post view.' });
    }
}

// Get post views
async function getPostViews(req, res) {
    try {
        const { postId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Valid post ID is required.' });
        }

        // Validate pagination
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
        const skip = (pageNum - 1) * limitNum;

        // Get post
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Get views with pagination
        const views = await postModel.findById(postId)
            .select('views')
            .populate({
                path: 'views.userId',
                select: 'userName profileName profilePic',
                options: { skip, limit: limitNum }
            });

        // Filter out null userId views
        const validViews = views.views.filter(view => view.userId !== null);

        const totalViews = post.viewsCount;
        const totalPages = Math.ceil(totalViews / limitNum);

        return res.status(200).json({
            message: 'Post views retrieved successfully',
            totalViews,
            totalPages,
            currentPage: pageNum,
            views: validViews
        });

    } catch (error) {
        console.error('Error retrieving post views:', error);
        return res.status(500).json({ message: 'Internal server error while retrieving post views.' });
    }
}

// ==================== Comment Likes ====================

// Like a comment
async function likeComment(req, res) {
    try {
        const userId = req.userId;
        const { commentId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ message: 'Valid comment ID is required.' });
        }

        // Get comment
        const comment = await commentModel.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        // Check if already liked
        if (comment.likes.some(like => like.toString() === userId)) {
            return res.status(400).json({ message: 'Comment already liked.' });
        }

        // Add like
        comment.likes.push(userId);
        comment.likesCount = comment.likes.length;
        await comment.save();

        return res.status(200).json({
            message: 'Comment liked successfully',
            likesCount: comment.likesCount
        });

    } catch (error) {
        console.error('Error liking comment:', error);
        return res.status(500).json({ message: 'Internal server error while liking comment.' });
    }
}

// Unlike a comment
async function unlikeComment(req, res) {
    try {
        const userId = req.userId;
        const { commentId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ message: 'Valid comment ID is required.' });
        }

        // Get comment
        const comment = await commentModel.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        // Check if liked
        const likeIndex = comment.likes.indexOf(userId);
        if (likeIndex === -1) {
            return res.status(400).json({ message: 'Comment not liked yet.' });
        }

        // Remove like
        comment.likes.splice(likeIndex, 1);
        comment.likesCount = comment.likes.length;
        await comment.save();

        return res.status(200).json({
            message: 'Comment unliked successfully',
            likesCount: comment.likesCount
        });

    } catch (error) {
        console.error('Error unliking comment:', error);
        return res.status(500).json({ message: 'Internal server error while unliking comment.' });
    }
}

// Get comment likes
async function getCommentLikes(req, res) {
    try {
        const { commentId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ message: 'Valid comment ID is required.' });
        }

        // Validate pagination
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
        const skip = (pageNum - 1) * limitNum;

        // Get comment
        const comment = await commentModel.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        // Get likes with pagination
        const likes = await commentModel.findById(commentId)
            .select('likes')
            .populate({
                path: 'likes',
                select: 'userName profileName profilePic',
                options: { skip, limit: limitNum }
            });

        const totalLikes = comment.likes.length;
        const totalPages = Math.ceil(totalLikes / limitNum);

        return res.status(200).json({
            message: 'Comment likes retrieved successfully',
            totalLikes,
            totalPages,
            currentPage: pageNum,
            likes: likes.likes
        });

    } catch (error) {
        console.error('Error retrieving comment likes:', error);
        return res.status(500).json({ message: 'Internal server error while retrieving comment likes.' });
    }
}

module.exports = {
    // Post Views
    trackPostView,
    getPostViews,
    // Comment Likes
    likeComment,
    unlikeComment,
    getCommentLikes
};
