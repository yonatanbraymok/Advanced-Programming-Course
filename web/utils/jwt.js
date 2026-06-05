// JWT helpers using Node crypto (HS256). No external JWT library needed.
// signToken creates a token on login; verifyToken checks it on protected routes.

const crypto = require('crypto');
const config = require('../config');

// Helper function to encode a buffer to a base64 URL-safe string
const base64UrlEncode = (buffer) => {
    return buffer
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

// Helper function to encode a JSON object to a base64 URL-safe string
const base64UrlEncodeJson = (obj) => {
    return base64UrlEncode(Buffer.from(JSON.stringify(obj)));
};

// Helper function to decode a base64 URL-safe string to a buffer
const base64UrlDecode = (str) => {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
        base64 += '=';
    }
    return Buffer.from(base64, 'base64');
};

// Convert values like "24h" or "7d" into seconds for the exp claim.
const parseExpiresIn = (expiresIn) => {
    if (typeof expiresIn === 'number') {
        return expiresIn;
    }

    const match = /^(\d+)([smhd])$/.exec(expiresIn);
    if (!match) {
        return 86400;
    }

    const value = parseInt(match[1], 10);
    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * multipliers[match[2]];
};

// Build a signed JWT with user id (sub) and username in the payload.
const signToken = ({ userId, username }) => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + parseExpiresIn(config.jwtExpiresIn);
    const payload = { sub: userId, username, iat, exp };

    const segments = [
        base64UrlEncodeJson(header),
        base64UrlEncodeJson(payload),
    ];

    const signature = crypto
        .createHmac('sha256', config.jwtSecret)
        .update(segments.join('.'))
        .digest();

    segments.push(base64UrlEncode(signature));
    return segments.join('.');
};

// Return the decoded payload if the token is valid, otherwise null.
const verifyToken = (token) => {
    if (!token || typeof token !== 'string') {
        return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
        return null;
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    const expectedSig = crypto
        .createHmac('sha256', config.jwtSecret)
        .update(`${headerB64}.${payloadB64}`)
        .digest();
    const actualSig = base64UrlDecode(signatureB64);

    if (expectedSig.length !== actualSig.length || !crypto.timingSafeEqual(expectedSig, actualSig)) {
        return null;
    }

    try {
        const payload = JSON.parse(base64UrlDecode(payloadB64).toString('utf8'));
        if (payload.exp && Math.floor(Date.now() / 1000) >= payload.exp) {
            return null;
        }
        return payload;
    } catch {
        return null;
    }
};

module.exports = {
    signToken,
    verifyToken,
};
