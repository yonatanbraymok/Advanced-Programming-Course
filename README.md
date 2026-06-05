# Advanced Programming Course — Exercise 3

---
## Notes for TA
- Each task's finished product will be pushed to TASK-#tasknum-DONE for your code review. Please note that we will continue merging code in to main branch as a new task is out. We will NOT however merge code in to a specific task branch after due date.
Example: Task 1 code will be presented in a branch named "TASK-1-DONE".
---

This repository contains a **Wolt-style food delivery REST API** (Exercise 3) built with **Node.js + Express (MVC)**, integrated with the **Exercise 2 C++ TCP recommender server**.

- **Web API (Ex3):** JSON REST under `/api/*`, in-memory data, no HTML views.
- **Recommender (Ex2):** Line-based TCP protocol on port `8080`, persisted in `data/users_products.txt`.

---

## General app state

| Component | Location | Role |
|-----------|----------|------|
| Web server | `web/` | Users, tokens, restaurants, products, orders, search |
| Ex2 server | `src/`, `build/app` | Product-view / recommendation over TCP |
| Ex2 TCP client | `web/services/ex2TcpClient.js` | Web calls Ex2 when a product is viewed |
| Tests (C++) | `tests/` | GTest suite via `tests_runner` |
| Docker | `docker-compose.yml` | Separate containers for `server`, `web`, `tests`, `client` |

**Implemented API (Ex3):**

- `POST/GET` `/api/users`, `POST` `/api/tokens`
- Restaurants CRUD + nested products CRUD
- Orders: create, list (logged-in user), get/update/delete by id
- `GET` `/api/search/:query` — case-insensitive match on name/description

**Auth:** `POST /api/tokens` returns a JWT. Send `Authorization: Bearer <token>` on protected routes (orders). Product view still accepts optional `user-id` for Ex2 TCP.

---

## Architecture

### Exercise 3 — full stack

![Exercise 3 architecture](docs/architecture-ex3.svg)

HTTP clients talk to the Express app. On **product view**, the web server opens a TCP client connection to the C++ server (fire-and-forget; API still returns JSON immediately).

### Exercise 2 — C++ recommender (detail)

![Exercise 2 architecture](docs/architecture.svg)

The Python client and C++ server exchange one line per message (`\n`-terminated). `App` drives parsing and execution without knowing about TCP details.

---

## Configuration

Copy the template and adjust locally (do **not** commit `.env`):

```bash
cp .env.example .env
```

| Variable | Default (local) | Purpose |
|----------|-----------------|--------|
| `PORT` | `3000` | Web server listen port |
| `EX2_SERVER_HOST` | `127.0.0.1` | Ex2 TCP host |
| `EX2_SERVER_PORT` | `8080` | Ex2 TCP port |

The web app reads these via `process.env` (no extra npm packages). For local runs, export variables or use a `.env` file with Docker Compose / your shell.

**Docker:** `docker-compose.yml` loads `.env` and overrides `EX2_SERVER_HOST=server` so the web container reaches the C++ service on the compose network.

---

## How to build

### Option 1 — Native (CMake + npm)

**Exercise 2 (C++):**

```bash
cmake -S . -B build
cmake --build build
```

**Exercise 3 (web):**

```bash
cd web
npm install
```

### Option 2 — Docker

```bash
docker compose build
```

| Service | Dockerfile | Purpose |
|---------|------------|---------|
| `server` | `Dockerfile.server` | Build and run `./build/app` |
| `web` | `Dockerfile.web` | Node web API |
| `tests` | `Dockerfile.tests` | CMake + `ctest` |
| `client` | `Dockerfile.client` | Python TCP client |

---

## How to run

### Native

**Terminal 1 — Ex2 server:**

```bash
./build/app 8080
```

**Terminal 2 — Web server:**

```bash
cd web
npm start
```

Web listens on `http://localhost:3000` (or `PORT` from environment).

**C++ unit tests:**

```bash
./build/tests_runner
```

### Docker

```bash
# C++ tests
docker compose run --rm tests

# Ex2 + web together
docker compose up --build server web
```

- Web: `http://localhost:3000`
- Ex2: `localhost:8080`

**Interactive Ex2 client (optional):**

```bash
docker compose run --rm -it client server 8080
# or locally:
python3 src/client.py 127.0.0.1 8080
```

---

## How to use (API examples)

Base URL: `http://localhost:3000/api`

### 1. Health

```bash
curl -i http://localhost:3000/api/health
```

Expected: `200` and `{"status":"ok"}`.

### 2. Register and login

```bash
curl -i -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret","name":"Alice","phone":"050","address":"TLV"}'

curl -i -X POST http://localhost:3000/api/tokens \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret"}'
```

Save the `token` from the tokens response for the `Authorization` header.

### 3. Restaurants and menu

```bash
curl -i -X POST http://localhost:3000/api/restaurants \
  -H "Content-Type: application/json" \
  -d '{"name":"Pizza Hub","description":"Wood fired"}'

curl -i http://localhost:3000/api/restaurants

# Replace REST_ID and use returned restaurant id
curl -i -X POST http://localhost:3000/api/restaurants/REST_ID/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Margherita","price":42,"description":"Cheese pizza"}'
```

### 4. View product (triggers Ex2 TCP side-call)

```bash
curl -i http://localhost:3000/api/restaurants/REST_ID/products/PROD_ID \
  -H "user-id: USER_ID_FROM_LOGIN"
```

Expected: `200` with product JSON. Ex2 is notified asynchronously; if Ex2 is down, the API still returns `200` and logs a TCP error on the server console.

### 5. Orders (requires JWT)

```bash
curl -i -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer JWT_FROM_LOGIN" \
  -d '{"restaurantId":"REST_ID","items":[{"productId":"PROD_ID","quantity":1}]}'

curl -i http://localhost:3000/api/orders -H "Authorization: Bearer JWT_FROM_LOGIN"
```

### 6. Search

```bash
curl -i http://localhost:3000/api/search/pizza
```

Expected: `200` with `{"restaurants":[...],"products":[...]}` (case-insensitive).

---

## Exercise 3 branch for TA

Exercise 3 code is frozen for grading on branch **`TASK-3-DONE`**. Development continues on **`main`** and feature branches so next submissions do not mix.

---

## Project structure (summary)

```
├── src/              # Ex2 C++ recommender + TCP server
├── web/              # Ex3 Node.js Express MVC API
├── tests/            # C++ GTest
├── data/             # Ex2 persistence (runtime)
├── docs/             # Architecture diagrams
├── docker-compose.yml
├── .env.example      # Environment template (copy to .env)
└── Dockerfile.*
```