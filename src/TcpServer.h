#pragma once
#include <netinet/in.h>
#include <sys/socket.h>
#include <unistd.h>
#include <stdexcept>

class TcpServer {
public:
    explicit TcpServer(int port) : port_(port), serverFd_(-1) {}

    // Initializing the socket, binds it to the port, and starts listening.
    void setup() {
        // Creating the socket
        serverFd_ = socket(AF_INET, SOCK_STREAM, 0);
        if (serverFd_ == -1) {
            throw std::runtime_error("Failed to create socket");
        }

        // allowing reuse of the port right after server restart
        int opt = 1;
        setsockopt(serverFd_, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

        // bind the socket to the port.
        sockaddr_in address{};
        address.sin_family = AF_INET;
        address.sin_addr.s_addr = INADDR_ANY;
        address.sin_port = htons(port_);

        if (bind(serverFd_, (struct sockaddr*)&address, sizeof(address)) < 0) {
            close(serverFd_);
            throw std::runtime_error("Failed to bind to port");
        }

        // Start listening for incoming connections
        if (listen(serverFd_, 1) < 0) { // Backlog of 1
            close(serverFd_);
            throw std::runtime_error("Failed to listen");
        }
    }

    ~TcpServer() {
        if (serverFd_ != -1) {
            close(serverFd_);
        }
    }

    int getServerFd() const { return serverFd_; }

private:
    int port_;
    int serverFd_;
};