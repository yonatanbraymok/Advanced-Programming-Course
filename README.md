# Exercise 5 — Wolt-style Delivery App

---
## Notes for TA
- Each task's finished product will be pushed to TASK-#tasknum-DONE for your code review. Please note that we will continue merging code in to main branch as a new task is out. We will NOT however merge code in to a specific task branch after due date.
Example: Task 1 code will be presented in a branch named "TASK-1-DONE".
---

## What this is

- **Web client** — React (Vite) under `web/client`
- **Mobile app** — React Native (Expo) under `mobile/`
- **Backend** — Node.js + Express REST API with **MongoDB** (Mongoose)
- **Recommender** — C++ TCP server (Exercise 2) on port `8080`

Step-by-step demos with screenshots are in [`wiki/`](wiki/). API details are in [`web/README.md`](web/README.md).

---

## Team workflow

We use **Jira** for sprint planning and **GitHub feature branches** named after the issue (e.g. `APC-292-docker-compose`).

- Tasks move: **To Do -> In Progress -> Code Review -> Done**
- Merges to `main` are **pull requests only**
- The person who opens a PR does **not** approve it — the other team members review first

---

## Before you run — `.env` setup

Do this once from the **repo root**. Do **not** commit `.env`.

```bash
cp .env.example .env
```

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `3000` | Web server port |
| `JWT_SECRET` | *(required)* | Signs login tokens |
| `JWT_EXPIRES_IN` | `24h` | Token lifetime |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/wolt` | MongoDB connection |
| `EX2_SERVER_HOST` | `127.0.0.1` | C++ recommender host |
| `EX2_SERVER_PORT` | `8080` | C++ recommender port |

**Important:** The Node server reads `process.env` directly — it does **not** load `.env` by itself.

- **Docker:** `docker-compose.yml` loads `./.env` automatically.
- **Native run:** export variables before `npm start`:

```bash
export $(grep -v '^#' .env | xargs)
```

---

## Run with Docker (recommended)

Starts the C++ server, MongoDB, and the web app (API + built React UI) in one command:

```bash
docker compose up --build server web
```

`web` pulls up `mongo` and `server` automatically. Web waits until MongoDB is healthy.

| Service | URL |
|---------|-----|
| Web (UI + API) | http://localhost:3000 |
| C++ TCP server | localhost:8080 |
| MongoDB (host) | localhost:27018 |

**Expected logs:**

```
MongoDB connected
Seeded N restaurants          # first run only
Web server listening on http://localhost:3000
```

**Verify:**

```bash
curl http://localhost:3000/api/health
# {"status":"ok"}
```

Open http://localhost:3000 in your browser.

---

## Run locally (development)

You need **four** terminals. MongoDB must be running.

**1. MongoDB**

```bash
brew services start mongodb-community
# or: docker run -d --name wolt-mongo -p 27017:27017 mongo:7
```

**2. C++ server** (repo root)

```bash
cmake -S . -B build && cmake --build build
./build/app 8080
```

**3. Web API** (repo root — export `.env` first)

```bash
export $(grep -v '^#' .env | xargs)
cd web && npm install && npm start
```

**4. Web frontend** (Vite with HMR)

```bash
cd web/client && npm install && npm run dev
```

Open http://localhost:5173 (API proxied to port 3000).

**C++ tests:** `./build/tests_runner`

---

## Run the mobile app

Backend must already be running (Docker or native).

```bash
cd mobile
npm install
npm start
```

Press `i` (iOS Simulator), `a` (Android Emulator), or scan with Expo Go.

API URL is set in `mobile/src/services/api.js`:

| Platform | URL |
|----------|-----|
| iOS Simulator | `http://localhost:3000` |
| Android Emulator | `http://10.0.2.2:3000` |
| Physical phone | Your PC's LAN IP, e.g. `http://192.168.1.5:3000` |

---

## Project layout

```
├── src/           # C++ recommender (Ex2)
├── web/           # Node API + React web client
├── mobile/        # Expo React Native app (Ex5)
├── wiki/          # TA demo docs with screenshots
├── tests/         # C++ GTest
├── docker-compose.yml
└── .env.example   # copy to .env at repo root
```

---

## More documentation

- [`wiki/`](wiki/) — setup, auth, CRUD, and order flows with screenshots
- [`web/README.md`](web/README.md) — API routes, auth, and server layout
