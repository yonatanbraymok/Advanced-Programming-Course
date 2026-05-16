#include "SocketLineOutput.h"

#include "ProtocolLineIO.h"

SocketLineOutput::SocketLineOutput(int socketFd) : socketFd_(socketFd) {}

void SocketLineOutput::writeLine(const std::string& line) {
    // CommandExecutor writes "201 Created" etc. — we add '\n' and send over TCP.
    writeLineToSocket(socketFd_, line);
}
