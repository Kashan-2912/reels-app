const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    profileName: {
        type: String,
        required: true
    },
    profilePic: String,

    // Content - Either photos OR video, not both
    photos: {
        type: [{
            type: String,  // URL/path of photo
            required: true
        }],
        default: []
    },
    
    video: {
        type: String,  // URL/path of video (only 1 video allowed)
        default: null
    },

    // Description/Caption
    description: {
        type: String,
        default: '',
        maxlength: 2200
    },

    // Engagement
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

    comments: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'comment'
        }],
        default: []
    },
    commentsCount: {
        type: Number,
        default: 0
    },

    saves: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }],
        default: []
    },
    savesCount: {
        type: Number,
        default: 0
    },

    shares: {
        type: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user'
            },
            sharedAt: {
                type: Date,
                default: Date.now
            }
        }],
        default: []
    },
    sharesCount: {
        type: Number,
        default: 0
    },

    // Metadata
    isReel: {
        type: Boolean,
        default: false  // Set to true if post contains video
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Custom validation middleware
postSchema.pre('save', function(next) {
    try {
        // Ensure post has either photos OR video, not both
        const hasPhotos = this.photos && this.photos.length > 0;
        const hasVideo = this.video && this.video.trim() !== '';

        if (hasPhotos && hasVideo) {
            throw new Error('Post cannot have both photos and video. Choose one.');
        }

        if (!hasPhotos && !hasVideo) {
            throw new Error('Post must have either photos or video.');
        }

        // Set isReel flag if has video
        this.isReel = hasVideo ? true : false;

        next();
    } catch (error) {
        next(error);
    }
});

const postModel = mongoose.model('post', postSchema);

module.exports = postModel;
