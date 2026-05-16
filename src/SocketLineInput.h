#pragma once

#include <string>

#include "Interfaces.h"

// Reads commands from the TCP socket for App (same idea as reading from cin).
class SocketLineInput : public IInput {
public:
    explicit SocketLineInput(int socketFd);

    bool readLine(std::string& outLine) override;

private:
    int socketFd_;
};
