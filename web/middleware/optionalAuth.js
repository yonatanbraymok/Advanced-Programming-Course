// Express middleware that optionally checks the Authorization Bearer header on public routes.
// If valid, it attaches req.userId. If missing/invalid, it just calls next() without blocking.

const { verifyToken } = require('../utils/jwt');

const optionalAuthenticate = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return next();
    }

    const payload = verifyToken(header.slice(7));
    if (payload && payload.sub) {
        req.userId = payload.sub;
        req.username = payload.username;
    }

    next();
};

module.exports = optionalAuthenticate;
