#include "SocketLineInput.h"

#include "ProtocolLineIO.h"

SocketLineInput::SocketLineInput(int socketFd) : socketFd_(socketFd) {}

bool SocketLineInput::readLine(std::string& outLine) {
    // App calls readLine() — we use ProtocolLineIO to read from the socket.
    return readLineFromSocket(socketFd_, outLine);
}
