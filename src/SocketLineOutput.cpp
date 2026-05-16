#include "SocketLineOutput.h"

#include <cerrno>
#include <sys/socket.h>
#include <unistd.h>

SocketLineOutput::SocketLineOutput(int socketFd) : socketFd_(socketFd) {}

void SocketLineOutput::writeLine(const std::string& line) {
    // Build the exact bytes on the wire: payload + trailing newline.
    std::string payload = line;
    payload.push_back('\n');

    const char* data = payload.data();
    std::size_t remaining = payload.size();

    // send() is allowed to write only part of the buffer ("partial send").
    // Loop until everything is delivered, or we hit an unrecoverable error.
    while (remaining > 0) {
        const ssize_t n = send(socketFd_, data, remaining, 0);
        if (n <= 0) {
            // EINTR = interrupted by a signal; try again. Anything else: give up
            // so we do not spin forever if the client vanished.
            if (n < 0 && errno == EINTR) {
                continue;
            }
            return;
        }
        data += static_cast<std::size_t>(n);
        remaining -= static_cast<std::size_t>(n);
    }
}
