const notificationModel = require('../models/notification.model');
const userModel = require('../models/user.model');
const postModel = require('../models/post.model');
const mongoose = require('mongoose');

// ==================== Notification Creation ====================

// Create notification (internal use)
async function createNotification(userId, fromUserId, type, message, postId = null, commentId = null) {
    try {
        // Don't create notification if user is notifying themselves
        if (userId.toString() === fromUserId.toString()) {
            return;
        }

        // Get from user info
        const fromUser = await userModel.findById(fromUserId).select('userName profilePic');
        if (!fromUser) return;

        // Create notification
        const notification = await notificationModel.create({
            userId,
            fromUserId,
            fromUserName: fromUser.userName,
            fromUserProfilePic: fromUser.profilePic || null,
            type,
            message,
            postId: postId || null,
            commentId: commentId || null
        });

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}

// ==================== Notification Retrieval ====================

// Get user notifications
async function getNotifications(req, res) {
    try {
        const userId = req.userId;
        const { page = 1, limit = 20, type = null, isRead = null } = req.query;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        // Validate pagination
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
        const skip = (pageNum - 1) * limitNum;

        // Build filter
        const filter = { userId };

        if (type && ['like', 'comment', 'follow', 'share'].includes(type)) {
            filter.type = type;
        }

        if (isRead !== null) {
            filter.isRead = isRead === 'true' || isRead === true;
        }

        // Get notifications
        const notifications = await notificationModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('fromUserId', 'userName profilePic')
            .populate('postId', '_id description')
            .lean();

        // Get total counts
        const totalNotifications = await notificationModel.countDocuments(filter);
        const unreadCount = await notificationModel.countDocuments({ userId, isRead: false });
        const totalPages = Math.ceil(totalNotifications / limitNum);

        return res.status(200).json({
            message: 'Notifications retrieved successfully',
            totalNotifications,
            unreadCount,
            totalPages,
            currentPage: pageNum,
            notifications
        });

    } catch (error) {
        console.error('Error retrieving notifications:', error);
        return res.status(500).json({ message: 'Internal server error while retrieving notifications.' });
    }
}

// Get unread notifications count
async function getUnreadCount(req, res) {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        const unreadCount = await notificationModel.countDocuments({ 
            userId, 
            isRead: false 
        });

        return res.status(200).json({
            message: 'Unread count retrieved successfully',
            unreadCount
        });

    } catch (error) {
        console.error('Error retrieving unread count:', error);
        return res.status(500).json({ message: 'Internal server error while retrieving unread count.' });
    }
}

// ==================== Notification Updates ====================

// Mark notification as read
async function markAsRead(req, res) {
    try {
        const userId = req.userId;
        const { notificationId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({ message: 'Valid notification ID is required.' });
        }

        // Get notification
        const notification = await notificationModel.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found.' });
        }

        // Authorization check
        if (notification.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You can only mark your own notifications as read.' });
        }

        // Update
        notification.isRead = true;
        await notification.save();

        return res.status(200).json({
            message: 'Notification marked as read',
            notification
        });

    } catch (error) {
        console.error('Error marking notification as read:', error);
        return res.status(500).json({ message: 'Internal server error while marking notification as read.' });
    }
}

// Mark all notifications as read
async function markAllAsRead(req, res) {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        // Update all unread notifications
        const result = await notificationModel.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );

        return res.status(200).json({
            message: 'All notifications marked as read',
            updatedCount: result.modifiedCount
        });

    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return res.status(500).json({ message: 'Internal server error while marking all notifications as read.' });
    }
}

// ==================== Notification Deletion ====================

// Delete notification
async function deleteNotification(req, res) {
    try {
        const userId = req.userId;
        const { notificationId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({ message: 'Valid notification ID is required.' });
        }

        // Get notification
        const notification = await notificationModel.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found.' });
        }

        // Authorization check
        if (notification.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You can only delete your own notifications.' });
        }

        // Delete
        await notificationModel.findByIdAndDelete(notificationId);

        return res.status(200).json({
            message: 'Notification deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting notification:', error);
        return res.status(500).json({ message: 'Internal server error while deleting notification.' });
    }
}

// Delete all notifications
async function deleteAllNotifications(req, res) {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        // Delete all notifications
        const result = await notificationModel.deleteMany({ userId });

        return res.status(200).json({
            message: 'All notifications deleted successfully',
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error('Error deleting all notifications:', error);
        return res.status(500).json({ message: 'Internal server error while deleting all notifications.' });
    }
}

module.exports = {
    // Creation (internal)
    createNotification,
    // Retrieval
    getNotifications,
    getUnreadCount,
    // Updates
    markAsRead,
    markAllAsRead,
    // Deletion
    deleteNotification,
    deleteAllNotifications
};
