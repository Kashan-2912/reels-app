const userModel = require('../models/user.model');
const mongoose = require('mongoose');

// Get user profile by userName
async function getProfile(req, res) {
    try {
        const { userName } = req.params;

        if (!userName || userName.trim() === '') {
            return res.status(400).json({ message: 'Username is required.' });
        }

        const user = await userModel.findOne({ userName: userName.toLowerCase() }).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json({
            message: 'Profile retrieved successfully',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                profileName: user.profileName,
                userName: user.userName,
                profilePic: user.profilePic,
                description: user.description,
                story: user.story,
                postsCount: user.postsCount,
                followersCount: user.followersCount,
                followingCount: user.followingCount,
                followers: user.followers,
                following: user.following,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });

    } catch (error) {
        console.error('Error retrieving profile:', error);
        return res.status(500).json({ message: 'Internal server error while retrieving profile.' });
    }
}

// Update own profile (requires authentication)
async function updateProfile(req, res) {
    try {
        const userId = req.userId;
        const { profileName, description, profilePic, story } = req.body;

        // Validate that user is updating their own profile
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        // Check if user exists
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Build update object with only provided fields
        const updateData = {};

        if (profileName !== undefined) {
            if (typeof profileName !== 'string' || profileName.trim() === '') {
                return res.status(400).json({ message: 'Profile name must be a non-empty string.' });
            }
            updateData.profileName = profileName.trim();
        }

        if (description !== undefined) {
            if (typeof description !== 'string') {
                return res.status(400).json({ message: 'Description must be a string.' });
            }
            if (description.length > 500) {
                return res.status(400).json({ message: 'Description must be 500 characters or less.' });
            }
            updateData.description = description.trim();
        }

        if (profilePic !== undefined) {
            if (typeof profilePic !== 'string' && profilePic !== null) {
                return res.status(400).json({ message: 'Profile picture must be a string or null.' });
            }
            updateData.profilePic = profilePic;
        }

        if (story !== undefined) {
            if (!Array.isArray(story)) {
                return res.status(400).json({ message: 'Story must be an array.' });
            }
            updateData.story = story;
        }

        // Update user document
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        return res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser._id,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                profileName: updatedUser.profileName,
                userName: updatedUser.userName,
                profilePic: updatedUser.profilePic,
                description: updatedUser.description,
                story: updatedUser.story,
                postsCount: updatedUser.postsCount,
                followersCount: updatedUser.followersCount,
                followingCount: updatedUser.followingCount,
                followers: updatedUser.followers,
                following: updatedUser.following
            }
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ message: 'Internal server error while updating profile.' });
    }
}

// Follow a user
async function followUser(req, res) {
    try {
        const currentUserId = req.userId;
        const { targetUserName } = req.body;

        if (!targetUserName || targetUserName.trim() === '') {
            return res.status(400).json({ message: 'Target username is required.' });
        }

        // Get current user
        const currentUser = await userModel.findById(currentUserId);

        if (!currentUser) {
            return res.status(404).json({ message: 'Current user not found.' });
        }

        // Get target user
        const targetUser = await userModel.findOne({ userName: targetUserName.toLowerCase() });

        if (!targetUser) {
            return res.status(404).json({ message: 'Target user not found.' });
        }

        // Check if already following
        const isAlreadyFollowing = currentUser.following.some(
            follow => follow.userId.toString() === targetUser._id.toString()
        );

        if (isAlreadyFollowing) {
            return res.status(400).json({ message: 'Already following this user.' });
        }

        // Prevent self-follow
        if (currentUser._id.toString() === targetUser._id.toString()) {
            return res.status(400).json({ message: 'You cannot follow yourself.' });
        }

        // Add to current user's following list
        currentUser.following.push({
            userId: targetUser._id,
            userName: targetUser.userName,
            profileName: targetUser.profileName,
            profilePic: targetUser.profilePic
        });
        currentUser.followingCount += 1;

        // Add to target user's followers list
        targetUser.followers.push({
            userId: currentUser._id,
            userName: currentUser.userName,
            profileName: currentUser.profileName,
            profilePic: currentUser.profilePic
        });
        targetUser.followersCount += 1;

        // Save both users
        await currentUser.save();
        await targetUser.save();

        return res.status(200).json({
            message: `Successfully followed ${targetUser.userName}`,
            followingCount: currentUser.followingCount,
            targetUserFollowersCount: targetUser.followersCount
        });

    } catch (error) {
        console.error('Error following user:', error);
        return res.status(500).json({ message: 'Internal server error while following user.' });
    }
}

// Unfollow a user
async function unfollowUser(req, res) {
    try {
        const currentUserId = req.userId;
        const { targetUserName } = req.body;

        if (!targetUserName || targetUserName.trim() === '') {
            return res.status(400).json({ message: 'Target username is required.' });
        }

        // Get current user
        const currentUser = await userModel.findById(currentUserId);

        if (!currentUser) {
            return res.status(404).json({ message: 'Current user not found.' });
        }

        // Get target user
        const targetUser = await userModel.findOne({ userName: targetUserName.toLowerCase() });

        if (!targetUser) {
            return res.status(404).json({ message: 'Target user not found.' });
        }

        // Check if currently following
        const followingIndex = currentUser.following.findIndex(
            follow => follow.userId.toString() === targetUser._id.toString()
        );

        if (followingIndex === -1) {
            return res.status(400).json({ message: 'You are not following this user.' });
        }

        // Remove from following
        currentUser.following.splice(followingIndex, 1);
        currentUser.followingCount = Math.max(0, currentUser.followingCount - 1);

        // Remove from followers
        const followerIndex = targetUser.followers.findIndex(
            follower => follower.userId.toString() === currentUser._id.toString()
        );

        if (followerIndex !== -1) {
            targetUser.followers.splice(followerIndex, 1);
            targetUser.followersCount = Math.max(0, targetUser.followersCount - 1);
        }

        // Save both users
        await currentUser.save();
        await targetUser.save();

        return res.status(200).json({
            message: `Successfully unfollowed ${targetUser.userName}`,
            followingCount: currentUser.followingCount,
            targetUserFollowersCount: targetUser.followersCount
        });

    } catch (error) {
        console.error('Error unfollowing user:', error);
        return res.status(500).json({ message: 'Internal server error while unfollowing user.' });
    }
}

// Get followers list
async function getFollowers(req, res) {
    try {
        const { userName } = req.params;

        if (!userName || userName.trim() === '') {
            return res.status(400).json({ message: 'Username is required.' });
        }

        const user = await userModel.findOne({ userName: userName.toLowerCase() });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json({
            message: 'Followers list retrieved successfully',
            userName: user.userName,
            followersCount: user.followersCount,
            followers: user.followers
        });

    } catch (error) {
        console.error('Error retrieving followers:', error);
        return res.status(500).json({ message: 'Internal server error while retrieving followers.' });
    }
}

// Get following list
async function getFollowing(req, res) {
    try {
        const { userName } = req.params;

        if (!userName || userName.trim() === '') {
            return res.status(400).json({ message: 'Username is required.' });
        }

        const user = await userModel.findOne({ userName: userName.toLowerCase() });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json({
            message: 'Following list retrieved successfully',
            userName: user.userName,
            followingCount: user.followingCount,
            following: user.following
        });

    } catch (error) {
        console.error('Error retrieving following list:', error);
        return res.status(500).json({ message: 'Internal server error while retrieving following list.' });
    }
}

// Get own profile (requires authentication)
async function getOwnProfile(req, res) {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        const user = await userModel.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json({
            message: 'Own profile retrieved successfully',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                profileName: user.profileName,
                userName: user.userName,
                profilePic: user.profilePic,
                description: user.description,
                story: user.story,
                postsCount: user.postsCount,
                followersCount: user.followersCount,
                followingCount: user.followingCount,
                followers: user.followers,
                following: user.following,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });

    } catch (error) {
        console.error('Error retrieving own profile:', error);
        return res.status(500).json({ message: 'Internal server error while retrieving own profile.' });
    }
}

module.exports = {
    getProfile,
    updateProfile,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getOwnProfile
};
