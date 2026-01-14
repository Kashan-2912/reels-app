const express = require('express');
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
} = require('../controllers/notification.controller');
const verifyToken = require('../middleware/auth.middleware');

const router = express.Router();

// Get user notifications (protected)
router.get('/', verifyToken, getNotifications);

// Get unread notifications count (protected)
router.get('/unread/count', verifyToken, getUnreadCount);

// Mark notification as read (protected)
router.put('/:notificationId/read', verifyToken, markAsRead);

// Mark all notifications as read (protected)
router.put('/read/all', verifyToken, markAllAsRead);

// Delete notification (protected)
router.delete('/:notificationId', verifyToken, deleteNotification);

// Delete all notifications (protected)
router.delete('/delete/all', verifyToken, deleteAllNotifications);

module.exports = router;
