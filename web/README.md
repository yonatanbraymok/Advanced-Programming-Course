# Web Server (Node.js + Express)

## Run locally

```bash
cd web
npm install
npm start
```

Server listens on **http://localhost:3000** (override with `PORT` env var).

## test

```bash
curl -i http://localhost:3000/api/health
curl -i http://localhost:3000/api/unknown
```

Expected: `200` with `{"status":"ok"}` and `404` with `{"error":"Not found"}`.

## MVC layout

- `routes/` — HTTP paths
- `controllers/` — request handlers
- `models/` — in-memory data (added in later stories)
- `middleware/` — errors and 404
