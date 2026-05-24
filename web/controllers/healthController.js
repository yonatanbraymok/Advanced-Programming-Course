// Controller layer: maps HTTP requests to responses. Keep business logic out of
// routes — routes only wire URLs to these functions.

function getHealth(req, res) {
    res.status(200).json({ status: 'ok' });
}

module.exports = { getHealth };
