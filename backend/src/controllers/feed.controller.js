const postModel = require('../models/post.model');
const userModel = require('../models/user.model');
const mongoose = require('mongoose');

// Get home feed - posts from users current user follows
async function getHomeFeed(req, res) {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        const { page = 1, limit = 10 } = req.query;

        // Validate pagination
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
        const skip = (pageNum - 1) * limitNum;

        // Get current user with following list
        const currentUser = await userModel.findById(userId);

        if (!currentUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Extract user IDs from following list
        const followingIds = currentUser.following.map(follow => follow.userId);

        // Also include own posts in feed
        followingIds.push(userId);

        // Get posts from followed users and own posts
        const posts = await postModel.find({ userId: { $in: followingIds } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('userId', 'userName profileName profilePic')
            .populate({
                path: 'likes',
                select: 'userName'
            })
            .populate({
                path: 'comments',
                populate: {
                    path: 'userId',
                    select: 'userName profilePic'
                }
            })
            .populate('saves', 'userName');

        // Get total count for pagination
        const totalPosts = await postModel.countDocuments({ userId: { $in: followingIds } });
        const totalPages = Math.ceil(totalPosts / limitNum);

        // Format response to include isLiked and isSaved for current user
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
            isLiked: post.likes.some(like => like._id.toString() === userId),
            likesCount: post.likesCount,
            isSaved: post.saves.some(save => save._id.toString() === userId),
            savesCount: post.savesCount,
            commentsCount: post.commentsCount,
            sharesCount: post.sharesCount,
            comments: post.comments,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
        }));

        return res.status(200).json({
            message: 'Home feed retrieved successfully',
            totalPosts,
            totalPages,
            currentPage: pageNum,
            posts: formattedPosts
        });

    } catch (error) {
        console.error('Error retrieving home feed:', error);
        return res.status(500).json({ message: 'Internal server error while retrieving home feed.' });
    }
}

// Get stories from users current user follows
async function getFollowingStories(req, res) {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        // Get current user with following list
        const currentUser = await userModel.findById(userId);

        if (!currentUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Get following users with story data
        const followingIds = currentUser.following.map(follow => follow.userId);

        // Also include own stories
        followingIds.push(userId);

        // Get users with their stories
        const usersWithStories = await userModel.find({ _id: { $in: followingIds } })
            .select('_id userName profileName profilePic story')
            .lean();

        // Filter users who have stories
        const storiesData = usersWithStories.map(user => ({
            userId: user._id,
            userName: user.userName,
            profileName: user.profileName,
            profilePic: user.profilePic,
            hasStory: user.story && user.story.length > 0,
            storyCount: user.story ? user.story.length : 0,
            stories: user.story || []
        }));

        // Sort to show users with stories first
        const storiesWithContent = storiesData.filter(s => s.hasStory);
        const storiesWithoutContent = storiesData.filter(s => !s.hasStory);

        const sortedStories = [...storiesWithContent, ...storiesWithoutContent];

        return res.status(200).json({
            message: 'Following stories retrieved successfully',
            totalUsers: followingIds.length,
            usersWithStories: storiesWithContent.length,
            stories: sortedStories
        });

    } catch (error) {
        console.error('Error retrieving following stories:', error);
        return res.status(500).json({ message: 'Internal server error while retrieving following stories.' });
    }
}

// Get specific user's story
async function getUserStory(req, res) {
    try {
        const { userName } = req.params;

        if (!userName || userName.trim() === '') {
            return res.status(400).json({ message: 'Username is required.' });
        }

        // Get user with story
        const user = await userModel.findOne({ userName: userName.toLowerCase() })
            .select('_id userName profileName profilePic story');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (!user.story || user.story.length === 0) {
            return res.status(404).json({ message: 'No stories available for this user.' });
        }

        return res.status(200).json({
            message: 'User story retrieved successfully',
            userId: user._id,
            userName: user.userName,
            profileName: user.profileName,
            profilePic: user.profilePic,
            stories: user.story,
            storyCount: user.story.length
        });

    } catch (error) {
        console.error('Error retrieving user story:', error);
        return res.status(500).json({ message: 'Internal server error while retrieving user story.' });
    }
}

// Add story to user (auth required)
async function addStory(req, res) {
    try {
        const userId = req.userId;
        const { storyImageOrVideo } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        // Validate story content
        if (!storyImageOrVideo || typeof storyImageOrVideo !== 'string' || storyImageOrVideo.trim() === '') {
            return res.status(400).json({ message: 'Story image or video URL is required.' });
        }

        // Get user
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Add story
        user.story.push({
            imageOrVideo: storyImageOrVideo.trim(),
            createdAt: new Date()
        });

        // Keep only stories from last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        user.story = user.story.filter(story => new Date(story.createdAt) > oneDayAgo);

        await user.save();

        return res.status(201).json({
            message: 'Story added successfully',
            story: {
                imageOrVideo: storyImageOrVideo.trim(),
                createdAt: new Date()
            },
            totalStories: user.story.length
        });

    } catch (error) {
        console.error('Error adding story:', error);
        return res.status(500).json({ message: 'Internal server error while adding story.' });
    }
}

// Delete specific story (auth required)
async function deleteStory(req, res) {
    try {
        const userId = req.userId;
        const { storyIndex } = req.params;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        // Validate story index
        if (storyIndex === undefined || isNaN(storyIndex) || storyIndex < 0) {
            return res.status(400).json({ message: 'Valid story index is required.' });
        }

        const index = parseInt(storyIndex);

        // Get user
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (!user.story || user.story.length === 0) {
            return res.status(400).json({ message: 'No stories to delete.' });
        }

        if (index >= user.story.length) {
            return res.status(400).json({ message: 'Story index out of range.' });
        }

        // Delete story
        user.story.splice(index, 1);
        await user.save();

        return res.status(200).json({
            message: 'Story deleted successfully',
            remainingStories: user.story.length
        });

    } catch (error) {
        console.error('Error deleting story:', error);
        return res.status(500).json({ message: 'Internal server error while deleting story.' });
    }
}

module.exports = {
    getHomeFeed,
    getFollowingStories,
    getUserStory,
    addStory,
    deleteStory
};
