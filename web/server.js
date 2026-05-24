// server.js — process entry point
// Loads the Express app from app.js and binds a TCP port. Startup logs go to
// the console only; the REST API itself always returns JSON via controllers.

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Web server listening on http://localhost:${PORT}`);
});
