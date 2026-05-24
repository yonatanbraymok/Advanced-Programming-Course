// Express error-handling middleware (must have four parameters). Controllers
// can throw or call next(err) with err.status / err.statusCode set.

function errorHandler(err, req, res, next) {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal server error';
    // Do not send stack traces on the wire — instructions expects clean JSON only.
    res.status(status).json({ error: message });
}

module.exports = errorHandler;
