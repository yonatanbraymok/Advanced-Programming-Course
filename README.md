# Advanced Programming Course - (Current Phase)

This repository contains the recommender system in C++ with a **TCP server** entry point, TDD tests, and persisted user–product data.

## Project Structure (Current State)

- `src/`
  - Core application: `App`, `CommandParser`, `CommandExecutor`, `FileRepository`, `SimilarityRecommender`
  - **Protocol line I/O (APC-80 / APC-81):** `ProtocolLineIO` — read/write one `\n`-terminated line on a socket fd
  - **Socket adapters:** `SocketLineInput`, `SocketLineOutput` (`IInput` / `IOutput` delegating to `ProtocolLineIO`)
  - **Python client (APC-82):** `protocol_message.py` — `append_newline`, `send_line`, `read_line`, `read_response`; used by `client.py`
  - `main.cpp` — binds a port, `accept` loop, one client at a time, shared repository across sessions
- `tests/`
  - `tests.cpp` — legacy checks + launches GTest
  - `AppTDDTests.cpp` — POST / PATCH / GET / DELETE / invalid (`400 Bad Request`) scenarios
  - `SocketServerTest.cpp` — server survives client disconnect; second connection still works; persistence across TCP sessions
- `data/`
  - Runtime storage (`users_products.txt` when using default server path)
- `CMakeLists.txt`
  - Builds `app` (TCP server) and `tests_runner`. If **GTest** (using this library is allowed) is not installed system-wide, CMake **FetchContent** downloads GoogleTest (requires network on first configure).

## Build and Run

### 1. Configure + build

```bash
cmake -S . -B build
cmake --build build
```

### 2. Run the TCP server

The server listens on **all interfaces** and takes the port as **the only program argument** (Exercise 2 requirement):

```bash
./build/app 8080
```

Each client connection uses one persistent TCP stream: one command line per message (terminated by `\n`); server replies with line-oriented output. **Malformed or unknown commands** receive exactly:

```text
400 Bad Request
```

The process keeps running after a client disconnects and accepts further connections on the same port.

### 3. Quick manual check

From another terminal:

```bash
printf 'help\n' | nc 127.0.0.1 8080 (MAC)
printf 'help\n' | nc -N 127.0.0.1 8080
```

You should see the three `help` lines returned by the server.

## Wire commands (server)

Supported verbs over the socket (see `CommandParser` / `CommandExecutor` for exact grammar):

```text
POST <userid> <productid> ...
PATCH <userid> <productid> ...
GET <userid> <productid>
DELETE <userid> <productid> ...
help
```

Legacy verbs `add` and `recommend` are not accepted on the wire (they return `400 Bad Request`). The `help` text still lists older names until APC-105 updates it.

Notes:
- Valid success / error lines follow the course spec (e.g. `201 Created`, `204 No Content`, `404 Not Found`). `GET` success uses `200 Ok` plus a blank line before the recommendation line (Ex1-style product list).
- Invalid input returns **`400 Bad Request`** (no extra text).

### 4. Run tests

```bash
./build/tests_runner
```

## Example session (over TCP)

With the server running on port `8080`:

```bash
printf 'POST 1 100 101\nGET 1 104\nhelp\n' | nc -N 127.0.0.1 8080
```

You should see status lines and bodies as defined by `CommandExecutor` (e.g. `201 Created`, then `GET` output with the `200 Ok` / blank line / recommendation line, then three `help` lines).

## Notes for TA
- Each task's finished product will be pushed to TASK-#tasknum-DONE for your code review. Please note that we will continue merging code in to main branch as a new task is out. We will NOT however merge code in to a specific task branch after due date.
Example: Task 1 code will be presented in a branch named "TASK-1-DONE".