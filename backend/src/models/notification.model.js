const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },

    // Who performed the action
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    fromUserName: {
        type: String,
        required: true
    },
    fromUserProfilePic: String,

    // Type of notification
    type: {
        type: String,
        enum: ['like', 'comment', 'follow', 'share'],
        required: true
    },

    // References
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
        default: null
    },

    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comment',
        default: null
    },

    // Notification content/message
    message: {
        type: String,
        required: true
    },

    // Read status
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

const notificationModel = mongoose.model('notification', notificationSchema);

module.exports = notificationModel;
