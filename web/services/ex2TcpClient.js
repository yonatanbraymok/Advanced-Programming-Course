const net = require('net');

const EX2_SERVER_HOST = process.env.EX2_SERVER_HOST || '127.0.0.1';
const EX2_SERVER_PORT = Number(process.env.EX2_SERVER_PORT || 8080);

// Sends one line command to Ex2 and closes the socket on first response/error.
const sendLine = (commandLine) => {
    const client = net.createConnection(
        { host: EX2_SERVER_HOST, port: EX2_SERVER_PORT },
        () => {
            // Ex2 speaks line-based protocol, so every command must end with \n.
            client.write(commandLine.endsWith('\n') ? commandLine : `${commandLine}\n`);
        }
    );

    client.on('data', () => {
        client.end();
    });

    client.on('error', (err) => {
        // Product view should still return HTTP response even if Ex2 is down.
        console.error('Ex2 TCP error:', err.message);
    });
};

// Record a product-view event in Ex2 recommender server.
const recordProductView = (userId, productId) => {
    sendLine(`GET ${userId} ${productId}`);
};

module.exports = {
    sendLine,
    recordProductView
};
