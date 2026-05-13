#pragma once

#include <string>

#include "Interfaces.h"

// SocketLineInput — read one text line at a time from a TCP connection
class SocketLineInput : public IInput {
public:
    explicit SocketLineInput(int socketFd);

    // Blocks until a full line arrives, the peer closes the socket, or recv fails.
    // Returns false when there is no more data (end of this client session).
    bool readLine(std::string& outLine) override;

private:
    int socketFd_;
};
