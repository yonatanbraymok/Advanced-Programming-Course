const express = require('express');
const apiRoutes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Mount feature routers under /api
app.use('/api', apiRoutes);

// No route matched — return JSON 404
app.use(notFound);

// Error handler middleware
app.use(errorHandler);

module.exports = app;