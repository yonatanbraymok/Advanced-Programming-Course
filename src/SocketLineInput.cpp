#include "SocketLineInput.h"

#include <sys/socket.h>
#include <unistd.h>

SocketLineInput::SocketLineInput(int socketFd) : socketFd_(socketFd) {}

bool SocketLineInput::readLine(std::string& outLine) {
    outLine.clear();

    // Read byte-by-byte until '\n'.
    char ch = 0;
    while (true) {
        const ssize_t n = recv(socketFd_, &ch, 1, 0);
        if (n <= 0) {
            // n == 0  → peer closed the connection cleanly
            // n < 0   → real error (we treat both as "no more lines")
            return false;
        }
        if (ch == '\n') {
            // Clients sometimes send "\r\n". If the line ends with '\r',
            // strip it so the rest of the app sees the same text as Unix-only '\n'.
            if (!outLine.empty() && outLine.back() == '\r') {
                outLine.pop_back();
            }
            return true;
        }
        outLine.push_back(ch);
    }
}
