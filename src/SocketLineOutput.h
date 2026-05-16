#pragma once

#include <string>

#include "Interfaces.h"

// SocketLineOutput — send one logical line over TCP
// Implements IOutput. Each writeLine() sends the given string followed by \n.

class SocketLineOutput : public IOutput {
public:
    explicit SocketLineOutput(int socketFd);

    void writeLine(const std::string& line) override;

private:
    int socketFd_;
};
