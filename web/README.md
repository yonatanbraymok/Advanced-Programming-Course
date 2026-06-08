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
| `middleware/` | `auth`, `notFound`, `errorHandler` |
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

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| GET | `/api/health` | No | Smoke test |
| POST | `/api/users` | No | Register (see validation rules below) |
| GET | `/api/users/:id` | No | Profile includes `profileImage`; password never returned |
| POST | `/api/tokens` | No | Login → returns JWT `token` |
| GET/POST | `/api/restaurants` | No | List / create |
| GET/PATCH/DELETE | `/api/restaurants/:id` | No | CRUD |
| GET/POST | `/api/restaurants/:id/products` | No | Menu list / add product |
| GET/PATCH/DELETE | `/api/restaurants/:id/products/:pId` | Optional on GET | GET notifies Ex2 |
| POST/GET | `/api/orders` | Bearer JWT | Create / list own orders |
| GET/PATCH/DELETE | `/api/orders/:id` | Bearer JWT | Own order only |
| GET | `/api/search/:query` | No | Case-insensitive name/description |

---

## Authentication model

1. `POST /api/tokens` with `{ "username", "password" }` -> `{ "message", "token" }` (HS256 JWT signed with `JWT_SECRET`)
2. Send `Authorization: Bearer <token>` on protected routes (all `/api/orders` endpoints).

JWT payload includes `sub` (user id) and `username`. Orders reject missing or invalid token with `401` and body `{ "error": "Unauthorized" }`. Product GET still accepts optional `user-id` header and falls back to `'0'` for Ex2 notification only.

### Public vs protected routes

| Access | Routes |
|--------|--------|
| **Public** (no JWT) | `GET /api/health`, `POST/GET /api/users`, `POST /api/tokens`, all `/api/restaurants` and nested products, `GET /api/search/:query` |
| **Protected** (Bearer JWT) | All `/api/orders` endpoints: `POST`, `GET`, `GET /:id`, `PATCH /:id`, `DELETE /:id` |

Auth middleware is mounted only in `routes/orderRoutes.js`. All other route modules stay public.

### Registration validation (`POST /api/users`)

Server-side rules (independent of client validation):

| Field | Required | Rule |
|-------|----------|------|
| `username` | Yes | Non-empty string (trimmed) |
| `password` | Yes | At least 8 characters with uppercase, lowercase, and a digit |
| `name` | Yes | Non-empty string (trimmed) |
| `phone` | No | Defaults to `""` |
| `address` | No | Defaults to `""` |
| `profileImage` | No | If sent, must be a non-empty string (URL or base64 data URL) |

Invalid input returns `400` with a descriptive `{ "error": "..." }` message. Duplicate username returns `409`.

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

Copy root `.env.example` to `.env` and set `JWT_SECRET` before starting (required).

Quick smoke:

```bash
curl -i http://localhost:3000/api/health
curl -i http://localhost:3000/api/unknown
```

JWT auth smoke test (server must be running with `JWT_SECRET` set):

```bash
# Terminal 1
cd web && npm start

# Terminal 2 (from repo root)
chmod +x web/scripts/smoke-jwt-auth.sh
./web/scripts/smoke-jwt-auth.sh
```

The script checks: orders return `401` without a token, `200` with a valid Bearer token, and public routes stay open.

Registration validation smoke test:

```bash
chmod +x web/scripts/smoke-registration.sh
./web/scripts/smoke-registration.sh
```

The script checks: weak passwords return `400`, valid registration with `profileImage` returns `201`, and `GET /api/users/:id` includes `profileImage` without `password`.

---

## Adding a feature (convention)

1. Model helpers in `models/`
2. Controller handlers in `controllers/`
3. Routes in `routes/` and register in `routes/index.js`
4. Document endpoint in this file and in root README examples if user-facing
