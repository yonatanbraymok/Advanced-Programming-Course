# Web server (`web/`) — developer guide

**TA / grading:** use the root [`README.md`](../README.md) as the source of truth for build, run, and API examples.

This document describes the **Exercise 3** Node.js + Express MVC layout for contributors - although you may read it if you want :)

---

## Stack

- **Node.js** (>= 18)
- **Express** only (no extra npm dependencies per course rules)
- In-memory models (data lost on restart)
- JSON API under `/api/*`

---

## Folder structure

| Folder | Responsibility |
|--------|----------------|
| `server.js` | Process entry — binds `PORT`, loads `app.js` |
| `app.js` | Express setup: JSON body parser, routes, 404, error handler |
| `routes/` | URL mounting (`/users`, `/restaurants`, …) |
| `controllers/` | HTTP logic, status codes, validation |
| `models/` | In-memory arrays and CRUD helpers |
| `middleware/` | `notFound`, `errorHandler` |
| `services/` | External integrations (`ex2TcpClient.js`) |

---

## Request flow

```
HTTP request
  routes/*.js
  controllers/*.js
  models/*.js
  JSON response
```

Product view additionally calls `services/ex2TcpClient` (non-blocking).

---

## API map

| Method | Path | Auth (`user-id` header) | Notes |
|--------|------|-------------------------|--------|
| GET | `/api/health` | No | Smoke test |
| POST | `/api/users` | No | Register |
| GET | `/api/users/:id` | No | Profile (no password in response) |
| POST | `/api/tokens` | No | Login → returns `id` |
| GET/POST | `/api/restaurants` | No | List / create |
| GET/PATCH/DELETE | `/api/restaurants/:id` | No | CRUD |
| GET/POST | `/api/restaurants/:id/products` | No | Menu list / add product |
| GET/PATCH/DELETE | `/api/restaurants/:id/products/:pId` | Optional on GET | GET notifies Ex2 |
| POST/GET | `/api/orders` | Yes | Create / list own orders |
| GET/PATCH/DELETE | `/api/orders/:id` | Yes | Own order only |
| GET | `/api/search/:query` | No | Case-insensitive name/description |

---

## Authentication model

Ex3 uses a simple header (not JWT):

1. `POST /api/tokens` with `{ "username", "password" }` → `{ "id": "user_..." }`
2. Send `user-id: <that id>` on protected routes.

Orders reject missing header with `401`. Product GET falls back to `'0'` if header omitted (Ex2 notification only).

---

## Ex2 TCP client (`services/ex2TcpClient.js`)

- **`sendLine(command)`** — one `\n`-terminated line to Ex2.
- **`recordProductView(userId, productId)`** — sends `GET <userId> <productId>`.

Environment (see root `.env.example`):

- `EX2_SERVER_HOST` (default `127.0.0.1`)
- `EX2_SERVER_PORT` (default `8080`)

Errors are logged; they do not fail the HTTP response.

**Note:** Ex2 expects numeric user/product ids on the wire; web ids are strings (`user_...`, `prod_...`). Ex2 may return `400 Bad Request` on the socket while the REST API still returns `200`.

---

## Local development

```bash
# From repo root — start Ex2 first
./build/app 8080

# Web
cd web
npm install
npm start
```

Optional: copy root `.env.example` to `.env` and export variables, or rely on defaults in code.

Quick smoke:

```bash
curl -i http://localhost:3000/api/health
curl -i http://localhost:3000/api/unknown
```

---

## Adding a feature (convention)

1. Model helpers in `models/`
2. Controller handlers in `controllers/`
3. Routes in `routes/` and register in `routes/index.js`
4. Document endpoint in this file and in root README examples if user-facing
