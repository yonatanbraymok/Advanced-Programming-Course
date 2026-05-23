// app.js — Express application
// Builds the app without listening on a port so tests can import it.
// All /api/* responses must be JSON.

const express = require('express');
const apiRoutes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Parse JSON request bodies (POST / PATCH from upcoming stories).
app.use(express.json());

// Mount feature routers under /api (e.g. /api/health).
app.use('/api', apiRoutes);

// No route matched — return JSON 404 before the error handler runs.
app.use(notFound);

// Four-argument middleware: catches errors passed to next(err).
app.use(errorHandler);

module.exports = app;
