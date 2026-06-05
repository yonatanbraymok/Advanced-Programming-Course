const { verifyToken } = require('../utils/jwt');

const authenticate = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = verifyToken(header.slice(7));
    if (!payload || !payload.sub) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    req.userId = payload.sub;
    req.username = payload.username;
    next();
};

module.exports = authenticate;
