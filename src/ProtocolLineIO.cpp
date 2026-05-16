#include "ProtocolLineIO.h"

#include <cerrno>
#include <sys/socket.h>
#include <unistd.h>

bool readLineFromSocket(int fd, std::string& outLine) {
    outLine.clear();

    // Read one byte at a time until we see '\n' (end of one message).
    char ch = 0;
    while (true) {
        const ssize_t n = recv(fd, &ch, 1, 0);
        if (n <= 0) {
            // Client closed the connection or recv failed — no more lines.
            return false;
        }
        if (ch == '\n') {
            // Some clients send "\r\n" — remove the '\r' if it's there.
            if (!outLine.empty() && outLine.back() == '\r') {
                outLine.pop_back();
            }
            return true;
        }
        outLine.push_back(ch);
    }
}

void writeLineToSocket(int fd, const std::string& line) {
    // Assignment rule: every line on the wire ends with '\n'.
    std::string payload = line;
    payload.push_back('\n');

    const char* data = payload.data();
    std::size_t remaining = payload.size();

    // send() might not send everything in one go — keep sending until done.
    while (remaining > 0) {
        const ssize_t n = send(fd, data, remaining, 0);
        if (n <= 0) {
            if (n < 0 && errno == EINTR) {
                continue;  // Interrupted by a signal, try again.
            }
            return;  // Client disconnected or error — stop sending.
        }
        data += static_cast<std::size_t>(n);
        remaining -= static_cast<std::size_t>(n);
    }
}
