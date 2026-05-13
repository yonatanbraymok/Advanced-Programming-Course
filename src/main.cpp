// =============================================================================
// main.cpp — TCP server entry point
// =============================================================================
// The program no longer reads from stdin. Instead it:
//   1) Parses the listen PORT from argv[1].
//   2) Loads the FileRepository once for the whole process (shared memory/file).
//   3) Listens on TCP; for EACH accepted client, wires SocketLineInput/Output
//      into App + CommandExecutor, runs the usual command loop, then closes
//      that client. The OUTER loop never exits — new clients can connect after
//      old ones disconnect.
//
// stderr is only used for startup errors (bad port, bind failed). The wire
// protocol itself must stay exactly as CommandExecutor defines it.
// =============================================================================

#include <cerrno>
#include <cstdlib>
#include <cstring>
#include <iostream>
#include <string>

#include <arpa/inet.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <unistd.h>

#include "App.h"
#include "Commands.h"
#include "FileRepository.h"
#include "SimilarityRecommender.h"
#include "SocketLineInput.h"
#include "SocketLineOutput.h"

namespace {

// Convert argv[1] into a valid TCP port (1..65535). Rejects garbage, signs,
// trailing junk, and overflow so we do not pass nonsense to bind().
bool parsePort(const char* text, uint16_t* outPort) {
    if (text == nullptr || text[0] == '\0') {
        return false;
    }
    char* end = nullptr;
    errno = 0;
    const unsigned long value = std::strtoul(text, &end, 10);
    if (errno != 0 || end == text || *end != '\0') {
        return false;
    }
    if (value == 0UL || value > 65535UL) {
        return false;
    }
    *outPort = static_cast<uint16_t>(value);
    return true;
}

}

int main(int argc, char* argv[]) {
    if (argc != 2) {
        std::cerr << "Usage: " << (argc > 0 ? argv[0] : "app") << " <port>\n";
        return 1;
    }

    uint16_t port = 0;
    if (!parsePort(argv[1], &port)) {
        std::cerr << "Invalid port: " << argv[1] << '\n';
        return 1;
    }

    // One repository + one recommender for the entire server lifetime. All
    // clients share this state (assignment: one client at a time, but data
    // persists across connections).
    FileRepository repository("data/users_products.txt");
    repository.load();

    SimilarityRecommender recommender(repository);

    // --- Create the listening socket (IPv4, TCP) ---
    const int listenFd = socket(AF_INET, SOCK_STREAM, 0);
    if (listenFd < 0) {
        std::cerr << "socket: " << std::strerror(errno) << '\n';
        return 1;
    }

    // SO_REUSEADDR helps during development: if the OS still holds the port in
    // TIME_WAIT after a crash, you can re-bind sooner instead of waiting.
    int opt = 1;
    if (setsockopt(listenFd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) != 0) {
        std::cerr << "setsockopt: " << std::strerror(errno) << '\n';
        close(listenFd);
        return 1;
    }

    sockaddr_in addr{};
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = htonl(INADDR_ANY);  // listen on all interfaces
    addr.sin_port = htons(port);

    if (bind(listenFd, reinterpret_cast<sockaddr*>(&addr), sizeof(addr)) != 0) {
        std::cerr << "bind: " << std::strerror(errno) << '\n';
        close(listenFd);
        return 1;
    }

    if (listen(listenFd, SOMAXCONN) != 0) {
        std::cerr << "listen: " << std::strerror(errno) << '\n';
        close(listenFd);
        return 1;
    }

    // --- Main server loop: accept -> handle one client -> repeat forever ---
    while (true) {
        const int clientFd = accept(listenFd, nullptr, nullptr);
        if (clientFd < 0) {
            // accept() can fail with EINTR if a signal arrives; retry in that case.
            if (errno == EINTR) {
                continue;
            }
            std::cerr << "accept: " << std::strerror(errno) << '\n';
            continue;
        }

        // Same App/CommandExecutor pipeline as before — only IInput/IOutput are
        // backed by the socket instead of cin/cout.
        SocketLineInput input(clientFd);
        SocketLineOutput output(clientFd);
        CommandExecutor executor(repository, recommender, output);
        App app(input, executor);
        app.run();

        // Session over (client closed or recv returned 0). Release OS resources.
        close(clientFd);
    }
}
