#pragma once

#include <string>

#include "Interfaces.h"

// Sends server replies to the TCP socket (same idea as writing to cout).
class SocketLineOutput : public IOutput {
public:
    explicit SocketLineOutput(int socketFd);

    void writeLine(const std::string& line) override;

private:
    int socketFd_;
};
