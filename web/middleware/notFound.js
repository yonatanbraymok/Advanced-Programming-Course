// Runs when no earlier route handled the request.
// { "error": "..." } JSON bodies for client errors.

function notFound(req, res) {
    res.status(404).json({ error: 'Not found' });
}

module.exports = notFound;
