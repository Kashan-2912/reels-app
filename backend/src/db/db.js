const mongoose = require('mongoose');

function connectDb() {
    mongoose.connect('mongodb://localhost:27017/reel-app'
    ).then(() => {
        console.log('Connected to MongoDB');
    }).catch((err) => {
        console.error('Failed to connect to MongoDB', err);
    });
}

module.exports = connectDb;