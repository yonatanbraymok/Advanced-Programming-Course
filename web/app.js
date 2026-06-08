const express = require('express');
const path = require('path');
const apiRoutes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Mount feature routers under /api
app.use('/api', apiRoutes);

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'client/build')));

// Fallback route for Single Page Application routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// No route matched — return JSON 404
app.use(notFound);

// Error handler middleware
app.use(errorHandler);

module.exports = app;