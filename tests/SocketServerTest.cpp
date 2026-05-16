// SocketServerTest.cpp — integration test for the TCP command loop (APC-97)
// -----------------------------------------------------------------------------
// We spin up a tiny real server in a background thread (same classes as main.cpp).
// Then we connect twice from the test thread:
//   1) First client runs "help" and closes — proves the server thread goes back
//      to accept() instead of exiting the whole process.
//   2) Second client POSTs data then GETs it — proves FileRepository state is
//      shared across TCP sessions (same in-memory repo object).
//
// Helpers recvWholeLine / sendAll mirror how a dumb Python client would speak
// line-by-line over TCP. Always send the FULL line including '\n' — if you
// truncate the buffer, the server will sit forever waiting for the newline.
// -----------------------------------------------------------------------------

#include <gtest/gtest.h>

#include <arpa/inet.h>
#include <atomic>
#include <chrono>
#include <cerrno>
#include <cstring>
#include <filesystem>
#include <netinet/in.h>
#include <sys/socket.h>
#include <thread>
#include <unistd.h>

#include <string>

#include "App.h"
#include "Commands.h"
#include "FileRepository.h"
#include "SimilarityRecommender.h"
#include "SocketLineInput.h"
#include "SocketLineOutput.h"

namespace {

// Read until '\n' (same idea as SocketLineInput, duplicated here so the test
// does not depend on friend APIs — keeps the test self-contained).
bool recvWholeLine(int fd, std::string& out) {
    out.clear();
    char ch = 0;
    while (true) {
        const ssize_t n = recv(fd, &ch, 1, 0);
        if (n <= 0) {
            return false;
        }
        if (ch == '\n') {
            if (!out.empty() && out.back() == '\r') {
                out.pop_back();
            }
            return true;
        }
        out.push_back(ch);
    }
}

// Send exactly `len` bytes (use sizeof(buf)-1 for string literals so '\0' is
// not counted — a classic off-by-one bug if you guess the length by hand).
bool sendAll(int fd, const char* data, std::size_t len) {
    std::size_t off = 0;
    while (off < len) {
        const ssize_t n = send(fd, data + off, len - off, 0);
        if (n <= 0) {
            if (n < 0 && errno == EINTR) {
                continue;
            }
            return false;
        }
        off += static_cast<std::size_t>(n);
    }
    return true;
}

void seedAppendixUsers(FileRepository& repo) {
    repo.addWatched(1, {100, 101, 102, 103});
    repo.addWatched(2, {101, 102, 104, 105, 106});
    repo.addWatched(3, {100, 104, 105, 107, 108});
    repo.addWatched(4, {101, 105, 106, 107, 109, 110});
    repo.addWatched(5, {100, 102, 103, 105, 108, 111});
    repo.addWatched(6, {100, 103, 104, 110, 111, 112, 113});
    repo.addWatched(7, {102, 105, 106, 107, 108, 109, 110});
    repo.addWatched(8, {101, 104, 105, 106, 109, 111, 114});
    repo.addWatched(9, {100, 103, 105, 107, 112, 113, 115});
    repo.addWatched(10, {100, 102, 105, 106, 107, 109, 110, 116});
}

}  // namespace

TEST(SocketServerTest, AcceptsSecondClientAfterFirstDisconnects) {
    const std::string path =
        (std::filesystem::temp_directory_path() / "socket_server_test_db.txt").string();
    std::filesystem::remove(path);

    FileRepository repository(path);
    repository.load();
    seedAppendixUsers(repository);
    SimilarityRecommender recommender(repository);

    const int listenFd = socket(AF_INET, SOCK_STREAM, 0);
    ASSERT_GE(listenFd, 0);

    int opt = 1;
    ASSERT_EQ(setsockopt(listenFd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)), 0);

    sockaddr_in bindAddr{};
    bindAddr.sin_family = AF_INET;
    bindAddr.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
    bindAddr.sin_port = 0;  // 0 = "pick any free port" — avoids collisions in CI

    ASSERT_EQ(bind(listenFd, reinterpret_cast<sockaddr*>(&bindAddr), sizeof(bindAddr)), 0);
    ASSERT_EQ(listen(listenFd, 8), 0);

    socklen_t addrLen = sizeof(bindAddr);
    ASSERT_EQ(getsockname(listenFd, reinterpret_cast<sockaddr*>(&bindAddr), &addrLen), 0);
    const uint16_t port = ntohs(bindAddr.sin_port);

    // Flag + shutdown(listenFd) let us stop the accept loop cleanly after the test.
    std::atomic<bool> listening{true};

    std::thread serverThread([&]() {
        while (listening.load()) {
            const int clientFd = accept(listenFd, nullptr, nullptr);
            if (clientFd < 0) {
                break;
            }
            SocketLineInput input(clientFd);
            SocketLineOutput output(clientFd);
            CommandExecutor executor(repository, recommender, output);
            App app(input, executor);
            app.run();
            close(clientFd);
        }
    });

    // Tiny pause so the background thread is almost certainly past bind/listen
    // before we connect (avoids rare races on slow machines).
    std::this_thread::sleep_for(std::chrono::milliseconds(30));

    auto connectClient = [&](int& outFd) -> bool {
        outFd = socket(AF_INET, SOCK_STREAM, 0);
        if (outFd < 0) {
            return false;
        }
        sockaddr_in remote{};
        remote.sin_family = AF_INET;
        remote.sin_port = htons(port);
        remote.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
        return connect(outFd, reinterpret_cast<sockaddr*>(&remote), sizeof(remote)) == 0;
    };

    // Client A: help then disconnect — server must accept another client afterward.
    {
        int c = -1;
        ASSERT_TRUE(connectClient(c));
        ASSERT_TRUE(sendAll(c, "help\n", 5));

        std::string line1;
        std::string line2;
        std::string line3;
        std::string line4;
        std::string line5;
        ASSERT_TRUE(recvWholeLine(c, line1));
        ASSERT_TRUE(recvWholeLine(c, line2));
        ASSERT_TRUE(recvWholeLine(c, line3));
        ASSERT_TRUE(recvWholeLine(c, line4));
        ASSERT_TRUE(recvWholeLine(c, line5));

        EXPECT_EQ(line1, "DELETE, arguments: [userid] [productid1] [productid2] ...");
        EXPECT_EQ(line2, "GET, arguments: [userid] [productid]");
        EXPECT_EQ(line3, "PATCH, arguments: [userid] [productid1] [productid2] ...");
        EXPECT_EQ(line4, "POST, arguments: [userid] [productid1] [productid2] ...");
        EXPECT_EQ(line5, "help");

        shutdown(c, SHUT_RDWR);
        close(c);
    }

    // Give the accept() loop a moment to wake up after the first TCP session ends.
    std::this_thread::sleep_for(std::chrono::milliseconds(30));

    // Client B: POST then GET — shared repository persists across TCP sessions.
    {
        int c = -1;
        ASSERT_TRUE(connectClient(c));
        const char kPost[] = "POST 77 1 2\n";
        ASSERT_TRUE(sendAll(c, kPost, sizeof(kPost) - 1));

        std::string created;
        ASSERT_TRUE(recvWholeLine(c, created));
        EXPECT_EQ(created, "201 Created");

        const char kGet[] = "GET 1 104\n";
        ASSERT_TRUE(sendAll(c, kGet, sizeof(kGet) - 1));

        std::string statusLine;
        std::string blankLine;
        std::string bodyLine;
        ASSERT_TRUE(recvWholeLine(c, statusLine));
        ASSERT_TRUE(recvWholeLine(c, blankLine));
        ASSERT_TRUE(recvWholeLine(c, bodyLine));

        EXPECT_EQ(statusLine, "200 Ok");
        EXPECT_EQ(blankLine, "");
        EXPECT_EQ(bodyLine, "105 106 111 110 112 113 107 108 109 114");

        shutdown(c, SHUT_RDWR);
        close(c);
    }

    listening = false;
    // Unblock accept() so the server thread can exit; then join to avoid a
    // detached thread touching the stack after the TEST returns.
    shutdown(listenFd, SHUT_RDWR);
    close(listenFd);
    serverThread.join();

    std::filesystem::remove(path);
}
