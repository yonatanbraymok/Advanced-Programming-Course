#pragma once
#include <string>
#include <vector>
#include <sys/socket.h>
#include <unistd.h>
#include "Interfaces.h"

// SocketIO implements both IInput and IOutput to handle network communication.
class SocketIO : public IInput, public IOutput {
public:
    explicit SocketIO(int clientSocket) : clientSocket_(clientSocket) {}

    // Reads a line from the socket until '\n' is encountered.
    bool readLine(std::string& outLine) override {
        outLine.clear();
        char buffer;
        ssize_t bytesRead;

        while ((bytesRead = recv(clientSocket_, &buffer, 1, 0)) > 0) {
            if (buffer == '\n') {
                return true;
            }
            outLine += buffer;
        }
        return bytesRead > 0;
    }

    // Writes a line to the socket followed by a newline character.
    void writeLine(const std::string& line) override {
        std::string fullLine = line + "\n";
        send(clientSocket_, fullLine.c_str(), fullLine.length(), 0);
    }

private:
    int clientSocket_;
};