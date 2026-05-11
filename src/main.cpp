#include <iostream>
#include <string>
#include <netinet/in.h>
#include <unistd.h>
#include "App.h"
#include "Commands.h"
#include "FileRepository.h"
#include "SimilarityRecommender.h"
#include "TcpServer.h"
#include "SocketIO.h"

int main(int argc, char* argv[]) {
    // argument parsing for the port number
    if (argc < 2) {
        return 1;
    }

    int port;
    try {
        port = std::stoi(argv[1]);
        if (port < 1024 || port > 65535) return 1;
    } catch (...) {
        return 1;
    }

    // initializig shared data structures (Repository and Recommender)
    // These are initialized once and shared across all sequential clients.
    FileRepository repository("data/users_products.txt");
    repository.load();
    SimilarityRecommender recommender(repository);

    // setup the TCP Server (socket, bind, listen)
    TcpServer server(port);
    try {
        server.setup();
    } catch (const std::exception& e) {
        // if  the port is taken or socket fails, exit
        return 1;
    }

    // the accept Loop
    // the server handle one client at a time.
    while (true) {
        struct sockaddr_in clientAddr;
        socklen_t clientLen = sizeof(clientAddr);
        
        // Blocking call: waits here until a client connects
        int clientFd = accept(server.getServerFd(), (struct sockaddr*)&clientAddr, &clientLen);
        
        if (clientFd < 0) {
            continue; // Ignore failed connection attempts and wait for the next one
        }

        // initialize the Socket bridge for this specific client
        SocketIO io(clientFd);
        
        // initialize the Executor and App with the current client's IO.
        CommandExecutor executor(repository, recommender, io);
        App app(io, executor);
        
        // run() is blocking and processing client commands until the client disconnects
        app.run();

        // Cleanup the client socket before starting to wait for the next connection.
        close(clientFd);
    }
    
    return 0;
}
