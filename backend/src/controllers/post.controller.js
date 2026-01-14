const postModel = require('../models/post.model');
const commentModel = require('../models/comment.model');
const userModel = require('../models/user.model');
const mongoose = require('mongoose');

// Extract hashtags from text
function extractHashtags(text) {
    if (!text) return [];
    const hashtagRegex = /#[\w]+/g;
    const hashtags = text.match(hashtagRegex) || [];
    return [...new Set(hashtags.map(tag => tag.toLowerCase()))]; // Remove duplicates
}

// ==================== CRUD Operations ====================

// Create a new post
async function createPost(req, res) {
    try {
        const userId = req.userId;
        const { photos, video, description } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        // Validation
        if (!photos && !video) {
            return res.status(400).json({ message: 'Post must contain either photos or video.' });
        }

        if (photos && video) {
            return res.status(400).json({ message: 'Post cannot contain both photos and video.' });
        }

        // Validate photos
        if (photos) {
            if (photos.length === 0) {
                return res.status(400).json({ message: 'Photos array cannot be empty.' });
            }

            if (photos.length > 10) {
                return res.status(400).json({ message: 'Post can contain maximum 10 photos.' });
            }

            for (let photo of photos) {
                if (typeof photo !== 'string' || photo.trim() === '') {
                    return res.status(400).json({ message: 'Each photo must be a valid string URL.' });
                }
            }
        }

        // Validate video
        if (video) {
            if (typeof video !== 'string' || video.trim() === '') {
                return res.status(400).json({ message: 'Video must be a valid string URL.' });
            }
        }

        // Validate description
        if (description) {
            if (typeof description !== 'string') {
                return res.status(400).json({ message: 'Description must be a string.' });
            }

            if (description.length > 2200) {
                return res.status(400).json({ message: 'Description must be 2200 characters or less.' });
            }
        }

        // Get user info
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Extract hashtags from description
        const hashtags = extractHashtags(description);

        // Create post
        const newPost = await postModel.create({
            userId,
            userName: user.userName,
            profileName: user.profileName,
            profilePic: user.profilePic || null,
            photos: photos || [],
            video: video || null,
            description: description?.trim() || '',
            hashtags: hashtags
        });

        // Increment user's post count
        user.postsCount = (user.postsCount || 0) + 1;
        await user.save();

        return res.status(201).json({
            message: 'Post created successfully',
            post: {
                id: newPost._id,
                userId: newPost.userId,
                userName: newPost.userName,
                profileName: newPost.profileName,
                profilePic: newPost.profilePic,
                photos: newPost.photos,
                video: newPost.video,
                description: newPost.description,
                hashtags: newPost.hashtags,
                isReel: newPost.isReel,
                likesCount: newPost.likesCount,
                commentsCount: newPost.commentsCount,
                savesCount: newPost.savesCount,
                sharesCount: newPost.sharesCount,
                viewsCount: newPost.viewsCount,
                createdAt: newPost.createdAt,
                updatedAt: newPost.updatedAt
            }
        });

    } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json({ message: 'Internal server error while creating post.' });
    }
}

// Get single post by ID
async function getPost(req, res) {
    try {
        const { postId } = req.params;

        if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Valid post ID is required.' });
        }

        const post = await postModel.findById(postId)
            .populate('userId', 'userName profileName profilePic')
            .populate('likes', 'userName profilePic')
            .populate('comments')
            .populate('saves', 'userName');

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        return res.status(200).json({
            message: 'Post retrieved successfully',
            post
        });

    } catch (error) {
        console.error('Error retrieving post:', error);
        return res.status(500).json({ message: 'Internal server error while retrieving post.' });
    }
}

// Get all posts of a user
async function getUserPosts(req, res) {
    try {
        const { userName } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!userName || userName.trim() === '') {
            return res.status(400).json({ message: 'Username is required.' });
        }

        // Validate pagination
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
        const skip = (pageNum - 1) * limitNum;

        // Get user
        const user = await userModel.findOne({ userName: userName.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Get posts
        const posts = await postModel.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('userId', 'userName profileName profilePic')
            .populate('likes', 'userName')
            .populate('comments')
            .populate('saves', 'userName');

        const totalPosts = await postModel.countDocuments({ userId: user._id });
        const totalPages = Math.ceil(totalPosts / limitNum);

        return res.status(200).json({
            message: 'User posts retrieved successfully',
            userName: user.userName,
            totalPosts,
            totalPages,
            currentPage: pageNum,
            posts
        });

    } catch (error) {
        console.error('Error retrieving user posts:', error);
        return res.status(500).json({ message: 'Internal server error while retrieving user posts.' });
    }
}

// Update post (description only - photos/video cannot be changed)
async function updatePost(req, res) {
    try {
        const userId = req.userId;
        const { postId } = req.params;
        const { description } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Valid post ID is required.' });
        }

        // Get post
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Authorization check
        if (post.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You can only edit your own posts.' });
        }

        // Validate description
        if (description !== undefined) {
            if (typeof description !== 'string') {
                return res.status(400).json({ message: 'Description must be a string.' });
            }

            if (description.length > 2200) {
                return res.status(400).json({ message: 'Description must be 2200 characters or less.' });
            }

            post.description = description.trim();
            // Extract and update hashtags
            post.hashtags = extractHashtags(description);
        }

        post.updatedAt = new Date();
        await post.save();

        return res.status(200).json({
            message: 'Post updated successfully',
            post: {
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
                likesCount: post.likesCount,
                commentsCount: post.commentsCount,
                savesCount: post.savesCount,
                sharesCount: post.sharesCount,
                viewsCount: post.viewsCount,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
            }
        });

    } catch (error) {
        console.error('Error updating post:', error);
        return res.status(500).json({ message: 'Internal server error while updating post.' });
    }
}

// Delete post
async function deletePost(req, res) {
    try {
        const userId = req.userId;
        const { postId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Valid post ID is required.' });
        }

        // Get post
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Authorization check
        if (post.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You can only delete your own posts.' });
        }

        // Delete all comments associated with the post
        await commentModel.deleteMany({ _id: { $in: post.comments } });

        // Delete post
        await postModel.findByIdAndDelete(postId);

        // Decrement user's post count
        const user = await userModel.findById(userId);
        if (user) {
            user.postsCount = Math.max(0, (user.postsCount || 1) - 1);
            await user.save();
        }

        return res.status(200).json({
            message: 'Post deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting post:', error);
        return res.status(500).json({ message: 'Internal server error while deleting post.' });
    }
}

// ==================== Like Functionality ====================

// Like a post
async function likePost(req, res) {
    try {
        const userId = req.userId;
        const { postId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Valid post ID is required.' });
        }

        // Get post
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Check if already liked
        if (post.likes.includes(userId)) {
            return res.status(400).json({ message: 'Post already liked.' });
        }

        // Add like
        post.likes.push(userId);
        post.likesCount = post.likes.length;
        await post.save();

        return res.status(200).json({
            message: 'Post liked successfully',
            likesCount: post.likesCount
        });

    } catch (error) {
        console.error('Error liking post:', error);
        return res.status(500).json({ message: 'Internal server error while liking post.' });
    }
}

// Unlike a post
async function unlikePost(req, res) {
    try {
        const userId = req.userId;
        const { postId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Valid post ID is required.' });
        }

        // Get post
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Check if liked
        const likeIndex = post.likes.indexOf(userId);
        if (likeIndex === -1) {
            return res.status(400).json({ message: 'Post not liked yet.' });
        }

        // Remove like
        post.likes.splice(likeIndex, 1);
        post.likesCount = post.likes.length;
        await post.save();

        return res.status(200).json({
            message: 'Post unliked successfully',
            likesCount: post.likesCount
        });

    } catch (error) {
        console.error('Error unliking post:', error);
        return res.status(500).json({ message: 'Internal server error while unliking post.' });
    }
}

// Get post likes
async function getPostLikes(req, res) {
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

        // Get likes with pagination
        const likes = await postModel.findById(postId)
            .select('likes')
            .populate({
                path: 'likes',
                select: 'userName profileName profilePic',
                options: { skip, limit: limitNum }
            });

        const totalLikes = post.likes.length;
        const totalPages = Math.ceil(totalLikes / limitNum);

        return res.status(200).json({
            message: 'Post likes retrieved successfully',
            totalLikes,
            totalPages,
            currentPage: pageNum,
            likes: likes.likes
        });

    } catch (error) {
        console.error('Error retrieving post likes:', error);
        return res.status(500).json({ message: 'Internal server error while retrieving post likes.' });
    }
}

// ==================== Comment Functionality ====================

// Add comment to post
async function addComment(req, res) {
    try {
        const userId = req.userId;
        const { postId } = req.params;
        const { text } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Valid post ID is required.' });
        }

        // Validate comment text
        if (!text || typeof text !== 'string' || text.trim() === '') {
            return res.status(400).json({ message: 'Comment text is required.' });
        }

        if (text.length > 1000) {
            return res.status(400).json({ message: 'Comment must be 1000 characters or less.' });
        }

        // Get post
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Get user info
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Create comment
        const newComment = await commentModel.create({
            userId,
            userName: user.userName,
            profilePic: user.profilePic || null,
            text: text.trim()
        });

        // Add comment to post
        post.comments.push(newComment._id);
        post.commentsCount = post.comments.length;
        await post.save();

        return res.status(201).json({
            message: 'Comment added successfully',
            comment: {
                id: newComment._id,
                userId: newComment.userId,
                userName: newComment.userName,
                profilePic: newComment.profilePic,
                text: newComment.text,
                likesCount: newComment.likesCount,
                createdAt: newComment.createdAt
            },
            commentsCount: post.commentsCount
        });

    } catch (error) {
        console.error('Error adding comment:', error);
        return res.status(500).json({ message: 'Internal server error while adding comment.' });
    }
}

// Delete comment from post
async function deleteComment(req, res) {
    try {
        const userId = req.userId;
        const { postId, commentId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Valid post ID is required.' });
        }

        if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ message: 'Valid comment ID is required.' });
        }

        // Get comment
        const comment = await commentModel.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        // Authorization check
        if (comment.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You can only delete your own comments.' });
        }

        // Get post
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Remove comment from post
        const commentIndex = post.comments.indexOf(commentId);
        if (commentIndex !== -1) {
            post.comments.splice(commentIndex, 1);
            post.commentsCount = post.comments.length;
            await post.save();
        }

        // Delete comment
        await commentModel.findByIdAndDelete(commentId);

        return res.status(200).json({
            message: 'Comment deleted successfully',
            commentsCount: post.commentsCount
        });

    } catch (error) {
        console.error('Error deleting comment:', error);
        return res.status(500).json({ message: 'Internal server error while deleting comment.' });
    }
}

// Get post comments
async function getPostComments(req, res) {
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

        // Get comments with pagination
        const comments = await commentModel.find({ _id: { $in: post.comments } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const totalComments = post.comments.length;
        const totalPages = Math.ceil(totalComments / limitNum);

        return res.status(200).json({
            message: 'Post comments retrieved successfully',
            totalComments,
            totalPages,
            currentPage: pageNum,
            comments
        });

    } catch (error) {
        console.error('Error retrieving post comments:', error);
        return res.status(500).json({ message: 'Internal server error while retrieving post comments.' });
    }
}

// ==================== Save Functionality ====================

// Save post
async function savePost(req, res) {
    try {
        const userId = req.userId;
        const { postId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Valid post ID is required.' });
        }

        // Get post
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Check if already saved
        if (post.saves.includes(userId)) {
            return res.status(400).json({ message: 'Post already saved.' });
        }

        // Save post
        post.saves.push(userId);
        post.savesCount = post.saves.length;
        await post.save();

        return res.status(200).json({
            message: 'Post saved successfully',
            savesCount: post.savesCount
        });

    } catch (error) {
        console.error('Error saving post:', error);
        return res.status(500).json({ message: 'Internal server error while saving post.' });
    }
}

// Unsave post
async function unsavePost(req, res) {
    try {
        const userId = req.userId;
        const { postId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Valid post ID is required.' });
        }

        // Get post
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Check if saved
        const saveIndex = post.saves.indexOf(userId);
        if (saveIndex === -1) {
            return res.status(400).json({ message: 'Post not saved yet.' });
        }

        // Unsave post
        post.saves.splice(saveIndex, 1);
        post.savesCount = post.saves.length;
        await post.save();

        return res.status(200).json({
            message: 'Post unsaved successfully',
            savesCount: post.savesCount
        });

    } catch (error) {
        console.error('Error unsaving post:', error);
        return res.status(500).json({ message: 'Internal server error while unsaving post.' });
    }
}

// ==================== Share Functionality ====================

// Share post (track shares)
async function sharePost(req, res) {
    try {
        const userId = req.userId;
        const { postId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Valid post ID is required.' });
        }

        // Get post
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Add share
        post.shares.push({
            userId,
            sharedAt: new Date()
        });
        post.sharesCount = post.shares.length;
        await post.save();

        // Generate share URL
        const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/post/${postId}`;

        return res.status(200).json({
            message: 'Post shared successfully',
            shareUrl,
            sharesCount: post.sharesCount
        });

    } catch (error) {
        console.error('Error sharing post:', error);
        return res.status(500).json({ message: 'Internal server error while sharing post.' });
    }
}

module.exports = {
    // CRUD
    createPost,
    getPost,
    getUserPosts,
    updatePost,
    deletePost,
    // Likes
    likePost,
    unlikePost,
    getPostLikes,
    // Comments
    addComment,
    deleteComment,
    getPostComments,
    // Saves
    savePost,
    unsavePost,
    // Share
    sharePost
};
