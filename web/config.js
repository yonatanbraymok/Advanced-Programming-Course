// Central place to read environment variables for the web server.
// JWT_SECRET is required so tokens can be signed and verified safely.

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    console.error('FATAL: JWT_SECRET environment variable is required');
    process.exit(1);
}

module.exports = {
    port: Number(process.env.PORT || 3000),
    ex2ServerHost: process.env.EX2_SERVER_HOST || '127.0.0.1',
    ex2ServerPort: Number(process.env.EX2_SERVER_PORT || 8080),
    jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wolt',
};
