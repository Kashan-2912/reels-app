const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    profilePic: String,
    text: {
        type: String,
        required: true,
        maxlength: 1000
    },
    likes: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }],
        default: []
    },
    likesCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const commentModel = mongoose.model('comment', commentSchema);

module.exports = commentModel;
