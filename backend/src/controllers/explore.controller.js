const postModel = require('../models/post.model');
const userModel = require('../models/user.model');

// Get trending posts (most liked posts)
async function getTrendingPosts(req, res) {
    try {
        const { page = 1, limit = 20 } = req.query;
        const userId = req.userId || null;

        // Validate pagination
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
        const skip = (pageNum - 1) * limitNum;

        // Get trending posts sorted by likes and comments
        const trendingPosts = await postModel.find()
            .sort({ likesCount: -1, commentsCount: -1, createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('userId', 'userName profileName profilePic')
            .populate('likes', 'userName')
            .populate('comments')
            .populate('saves', 'userName');

        const totalPosts = await postModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / limitNum);

        // Format response
        const formattedPosts = trendingPosts.map(post => ({
            id: post._id,
            userId: post.userId,
            userName: post.userName,
            profileName: post.profileName,
            profilePic: post.profilePic,
            photos: post.photos,
            video: post.video,
            description: post.description,
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
            message: 'Trending posts retrieved successfully',
            totalPosts,
            totalPages,
            currentPage: pageNum,
            posts: formattedPosts
        });

    } catch (error) {
        console.error('Error retrieving trending posts:', error);
        return res.status(500).json({ message: 'Internal server error while retrieving trending posts.' });
    }
}

// Get suggested users to follow
async function getSuggestedUsers(req, res) {
    try {
        const userId = req.userId;
        const { limit = 10 } = req.query;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        // Validate limit
        const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));

        // Get current user
        const currentUser = await userModel.findById(userId);

        if (!currentUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Get IDs of users already followed
        const followingIds = currentUser.following.map(follow => follow.userId.toString());
        followingIds.push(userId); // Exclude self

        // Get suggested users - sorted by followers count (popular users)
        const suggestedUsers = await userModel.find({
            _id: { $nin: followingIds }
        })
            .select('_id userName profileName profilePic followersCount')
            .sort({ followersCount: -1 })
            .limit(limitNum);

        return res.status(200).json({
            message: 'Suggested users retrieved successfully',
            suggestedCount: suggestedUsers.length,
            suggestedUsers
        });

    } catch (error) {
        console.error('Error retrieving suggested users:', error);
        return res.status(500).json({ message: 'Internal server error while retrieving suggested users.' });
    }
}

// Get explore feed - mix of trending posts and reels
async function getExploreFeed(req, res) {
    try {
        const { page = 1, limit = 20 } = req.query;
        const userId = req.userId || null;

        // Validate pagination
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
        const skip = (pageNum - 1) * limitNum;

        // Get mix of trending posts and reels
        const explorePosts = await postModel.find()
            .sort({ likesCount: -1, commentsCount: -1, createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('userId', 'userName profileName profilePic')
            .populate('likes', 'userName')
            .populate('comments')
            .populate('saves', 'userName');

        const totalPosts = await postModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / limitNum);

        // Format response
        const formattedPosts = explorePosts.map(post => ({
            id: post._id,
            userId: post.userId,
            userName: post.userName,
            profileName: post.profileName,
            profilePic: post.profilePic,
            photos: post.photos,
            video: post.video,
            description: post.description,
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
            message: 'Explore feed retrieved successfully',
            totalPosts,
            totalPages,
            currentPage: pageNum,
            posts: formattedPosts
        });

    } catch (error) {
        console.error('Error retrieving explore feed:', error);
        return res.status(500).json({ message: 'Internal server error while retrieving explore feed.' });
    }
}

// Get reels (video posts only)
async function getReels(req, res) {
    try {
        const { page = 1, limit = 10 } = req.query;
        const userId = req.userId || null;

        // Validate pagination
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
        const skip = (pageNum - 1) * limitNum;

        // Get video posts (reels) sorted by likes
        const reels = await postModel.find({ isReel: true })
            .sort({ likesCount: -1, createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('userId', 'userName profileName profilePic')
            .populate('likes', 'userName')
            .populate('comments')
            .populate('saves', 'userName');

        const totalReels = await postModel.countDocuments({ isReel: true });
        const totalPages = Math.ceil(totalReels / limitNum);

        // Format response
        const formattedReels = reels.map(reel => ({
            id: reel._id,
            userId: reel.userId,
            userName: reel.userName,
            profileName: reel.profileName,
            profilePic: reel.profilePic,
            video: reel.video,
            description: reel.description,
            isReel: true,
            isLiked: userId ? reel.likes.some(like => like._id.toString() === userId) : false,
            likesCount: reel.likesCount,
            isSaved: userId ? reel.saves.some(save => save._id.toString() === userId) : false,
            savesCount: reel.savesCount,
            commentsCount: reel.commentsCount,
            sharesCount: reel.sharesCount,
            createdAt: reel.createdAt
        }));

        return res.status(200).json({
            message: 'Reels retrieved successfully',
            totalReels,
            totalPages,
            currentPage: pageNum,
            reels: formattedReels
        });

    } catch (error) {
        console.error('Error retrieving reels:', error);
        return res.status(500).json({ message: 'Internal server error while retrieving reels.' });
    }
}

module.exports = {
    getTrendingPosts,
    getSuggestedUsers,
    getExploreFeed,
    getReels
};
