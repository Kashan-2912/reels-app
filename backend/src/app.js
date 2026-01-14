const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const postRoutes = require('./routes/post.routes');
const feedRoutes = require('./routes/feed.routes');
const savedRoutes = require('./routes/saved.routes');
const searchRoutes = require('./routes/search.routes');
const exploreRoutes = require('./routes/explore.routes');
const hashtagRoutes = require('./routes/hashtag.routes');

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/hashtags', hashtagRoutes);

module.exports = app;