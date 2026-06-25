// server.js — process entry point
// Loads the Express app from app.js and binds a TCP port. Startup logs go to
// the console only; the REST API itself always returns JSON via controllers.

// config loads env vars (including required JWT_SECRET) before the server starts.
const config = require('./config');
const { connect } = require('./db');
const app = require('./app');

connect().then(() => {
    app.listen(config.port, () => {
        console.log(`Web server listening on http://localhost:${config.port}`);
    });
});
