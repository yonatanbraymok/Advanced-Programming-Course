# Web server (`web/`)

Express MVC REST API for the Wolt-style app. We kept the Ex3 layout but replaced in-memory arrays with **Mongoose + MongoDB** in Ex5.

For how to run the full stack, see the root [`README.md`](../README.md).

---

## Stack

- Node.js >= 18
- Express
- Mongoose (MongoDB)
- JWT auth (`JWT_SECRET` in `.env`)
- JSON API under `/api/*`

On first startup, [`db.js`](db.js) connects to MongoDB and seeds restaurants from [`data/restaurants.json`](data/restaurants.json) if the collection is empty.

---

## Run the server (native)

From **repo root**, export env vars then start:

```bash
cp .env.example .env          # once, at repo root
export $(grep -v '^#' .env | xargs)

# MongoDB must be running (local or docker run -p 27017:27017 mongo:7)
# C++ server optional for most routes: ./build/app 8080

cd web
npm install
npm start
```

Server listens on `http://localhost:3000` (or `PORT` from env).

Quick check:

```bash
curl -i http://localhost:3000/api/health
```

---

## Folder structure

| Folder | Role |
|--------|------|
| `server.js` | Entry — connects DB, then listens |
| `app.js` | Express setup, static client, routes |
| `db.js` | MongoDB connect + seed |
| `config.js` | Reads `process.env` |
| `routes/` | URL mounting |
| `controllers/` | Request handlers |
| `models/` | Mongoose schemas |
| `middleware/` | Auth, 404, errors |
| `services/` | Ex2 TCP client |
| `client/` | Vite React app (Ex4) |

---

## Request flow

```
HTTP -> routes -> controllers -> models (MongoDB) -> JSON response
```

Product `GET` also calls `services/ex2TcpClient` (non-blocking TCP to C++ server).

---

## API map

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/health` | No | Smoke test |
| POST | `/api/users` | No | Register |
| GET | `/api/users/:id` | No | Profile (no password) |
| GET | `/api/users/me` | Bearer | Current user |
| PUT | `/api/users/me` | Bearer | Update profile |
| POST | `/api/tokens` | No | Login -> JWT |
| GET/POST | `/api/restaurants` | POST: Bearer | List / create |
| GET | `/api/restaurants/my` | Bearer | Owner's restaurants |
| GET/PATCH/DELETE | `/api/restaurants/:id` | PATCH/DELETE: Bearer | CRUD |
| GET/POST | `/api/restaurants/:id/products` | POST: Bearer | Menu |
| GET/PATCH/DELETE | `/api/restaurants/:id/products/:pId` | PATCH/DELETE: Bearer | Product CRUD |
| POST/GET | `/api/orders` | Bearer | Create / list own |
| GET/PATCH/DELETE | `/api/orders/:id` | Bearer | Order CRUD |
| GET | `/api/search/:query` | No | Search restaurants + products |

---

## Auth

1. `POST /api/tokens` with `{ username, password }` -> `{ token }`
2. Send `Authorization: Bearer <token>` on protected routes.

Orders and owner actions require a valid JWT. Missing/invalid token -> `401 { "error": "Unauthorized" }`.

### Registration rules (`POST /api/users`)

| Field | Rule |
|-------|------|
| `username` | Required, unique |
| `password` | Min 8 chars, uppercase + lowercase + digit |
| `name` | Required |
| `phone`, `address` | Optional |
| `profileImage` | Optional (URL or base64 data URL) |

Weak input -> `400`. Duplicate username -> `409`.

---

## Ex2 TCP client

[`services/ex2TcpClient.js`](services/ex2TcpClient.js) sends `GET <userId> <productId>` to the C++ server when a product is viewed. Uses `EX2_SERVER_HOST` and `EX2_SERVER_PORT` from env. Errors are logged only — HTTP still returns 200.

---

## Smoke scripts

From repo root (server must be running with `JWT_SECRET` set):

```bash
chmod +x web/scripts/smoke-jwt-auth.sh web/scripts/smoke-registration.sh
./web/scripts/smoke-jwt-auth.sh
./web/scripts/smoke-registration.sh
```
