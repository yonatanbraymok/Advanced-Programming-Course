// Express middleware that checks the Authorization Bearer header on protected routes.

const { verifyToken } = require('../utils/jwt');

const authenticate = (req, res, next) => {
    const header = req.headers.authorization;

    // Client must send: Authorization: Bearer <token>
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = verifyToken(header.slice(7));
    if (!payload || !payload.sub) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Attach user info so controllers can use req.userId without reading headers.
    req.userId = payload.sub;
    req.username = payload.username;
    next();
};

module.exports = authenticate;
