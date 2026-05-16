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

You should see five `help` lines (Ex2 alphabetical format; `help` last).

## Wire commands (server)

Supported verbs over the socket (see `CommandParser` / `CommandExecutor` for exact grammar):

```text
POST <userid> <productid> ...
PATCH <userid> <productid> ...
GET <userid> <productid>
DELETE <userid> <productid> ...
help
```

Verbs `add` and `recommend` are not accepted on the wire (they return `400 Bad Request`).

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

You should see status lines and bodies as defined by `CommandExecutor` (e.g. `201 Created`, then `GET` output with the `200 Ok` / blank line / recommendation line, then five `help` lines).

Example `help` output:

```text
DELETE, arguments: [userid] [productid1] [productid2] ...
GET, arguments: [userid] [productid]
PATCH, arguments: [userid] [productid1] [productid2] ...
POST, arguments: [userid] [productid1] [productid2] ...
help
```

### 5. Python client

```bash
python3 src/client.py 127.0.0.1 8080
```

Type one command per line (same verbs as above). Exit with Ctrl+D or `quit`.

## Architecture
![Architecture](docs/architecture.svg)

The Python client and C++ server exchange one line per message (`\n`-terminated). `ProtocolLineIO` / `protocol_message.py` handle framing; `SocketLineInput` / `SocketLineOutput` adapt sockets to `IInput` / `IOutput`; `App` drives parsing and execution without knowing about TCP.

## Design & SOLID (Exercise 2)

Exercise 2 asks whether each change required editing the “closed” application loop in `App`. In our design, **`App` stayed stable** because responsibilities are split behind interfaces.

| Change | Modified closed `App` loop? | How Ex1 design limited impact |
|--------|----------------------------|--------------------------------|
| **Renamed commands** (`add`→`POST`, `recommend`→`GET`, etc.) | **No** | `CommandParser` maps wire tokens to `CommandType`; `App` only dispatches on the enum. Renaming is a parser/executor change, not a loop rewrite. |
| **New commands** (`PATCH`, `DELETE`, status outputs) | **No** | New `CommandType` values and `CommandExecutor` methods; `App` gained `switch` cases but the read→parse→execute pattern is unchanged. |
| **Changed command output** (HTTP-style status lines) | **No** | Responses are formatted in `CommandExecutor` via `IOutput::writeLine`, not in `App`. |
| **Socket I/O instead of console** | **No** | `IInput` / `IOutput` abstractions; `main` wires `SocketLineInput` / `SocketLineOutput` instead of stdin/stdout. `App` never included `<iostream>` or socket code. |

**Open/Closed Principle:** We extend behavior by adding parser rules, executor methods, and repository operations (`IRepository`) rather than rewriting the core loop.

**Future multi-client (Exercise 2):** Today `main` accepts one connection at a time with a shared `FileRepository`. To serve more clients without rewriting `App` or `CommandExecutor`, we would:

- Keep the accept loop in `main`.
- Create a thread (or use async I/O) per accepted socket.
- Give each client its own `SocketLineInput` / `SocketLineOutput` pair and `App` instance (or shared `App` with synchronized `IRepository` access).
- Protect `FileRepository` with a mutex if multiple threads mutate the same in-memory store.

The command pipeline (`App` -> parser -> executor -> `IOutput`) would stay the same; only connection handling and repository locking would grow.

## Docker

Exercise 2 requires running **server**, **client**, and **unit tests** in separate containers. Use `docker-compose.yml` with three Dockerfiles:

| File | Purpose |
|------|---------|
| `Dockerfile.server` | Build and run `./build/app` |
| `Dockerfile.client` | Python `client.py` |
| `Dockerfile.tests` | CMake build + `ctest` |
| `Dockerfile` (root) | Alias of server image for backward compatibility |

```bash
docker compose build
docker compose run --rm tests
docker compose run --rm -p 8080:8080 server 8080
docker compose run --rm -it client server 8080
```

- **tests** — runs `ctest` in an isolated image.
- **server** — publishes port `8080`; override port: `docker compose run --rm -p 9000:9000 server 9000`.
- **client** — connects to the compose service hostname `server` on the Docker network (`stdin_open` / `tty` for interactive use).

Build a single image without compose:

```bash
docker build -f Dockerfile.server -t recommender-server .
docker build -f Dockerfile.client -t recommender-client .
docker build -f Dockerfile.tests -t recommender-tests .
```

## Notes for TA
- Each task's finished product will be pushed to TASK-#tasknum-DONE for your code review. Please note that we will continue merging code in to main branch as a new task is out. We will NOT however merge code in to a specific task branch after due date.
Example: Task 1 code will be presented in a branch named "TASK-1-DONE".