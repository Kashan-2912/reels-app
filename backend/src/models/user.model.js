const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  // Profile fields
  profileName: {
    type: String,
    required: true,
  },

  userName: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  profilePic: {
    type: String,
    default: null
  },

  description: {
    type: String,
    default: '',
    maxlength: 500
  },

  story: {
    type: Array,
    default: []
  },

  postsCount: {
    type: Number,
    default: 0
  },

  followersCount: {
    type: Number,
    default: 0
  },

  followingCount: {
    type: Number,
    default: 0
  },

  followers: {
    type: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      },
      userName: String,
      profileName: String,
      profilePic: String
    }],
    default: []
  },

  following: {
    type: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      },
      userName: String,
      profileName: String,
      profilePic: String
    }],
    default: []
  }

}, {
  timestamps: true
});

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;