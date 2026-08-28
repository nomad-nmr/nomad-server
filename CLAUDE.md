# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

We are building the app described in @SPEC.MD. Read that file for general architectural tasks or to double-check the exact database structure, tech stack or application architecture.

Whenever working with any third-party library or something similar, you MUST look up the official documentation to ensure that you're working with up-to-date information.
Use the DocsExplorer subagent for efficient documentation lookup.

Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

## Project overview

NOMAD is a system for managing NMR spectrometer submissions, data acquisition tracking, and dataset storage/retrieval, used in academic NMR facilities. This repository (`nomad-server`) contains two independent NPM projects, each with its own `package.json`, developed and run together via Docker Compose:

- **nomad-rest-api** — Express 5 REST API + Socket.IO server (ESM, `type: module`), backed by MongoDB/Mongoose.
- **nomad-front-end** — React 18 SPA bootstrapped with Vite, using Redux (classic actions/reducers, not Redux Toolkit) and Ant Design.

A third component, **nomad-spect-client**, lives in a sibling repository (`../nomad-spect-client`) and runs on the NMR spectrometer PC to bridge Bruker IconNMR with the NOMAD server over Socket.IO. It is pulled in via the `client` Docker Compose profile for local development.

`SPEC.md` at the repo root is the authoritative technical specification for the system's domain model and behavior — consult it for background on experiment/dataset/claim workflows before making non-trivial backend changes.

## Development setup

Development runs through Docker Compose; there is no supported bare-metal setup for the full stack.

```bash
docker-compose up -d                      # start mongodb, backend, frontend
docker-compose up -d --build              # rebuild images after package.json changes
docker-compose --profile client up -d     # also start the spectrometer client (requires ../nomad-spect-client checked out alongside this repo)
docker-compose down
```

Environment files live under `/envs/dev/` (`backend.env`, `frontend.env`, `client.env`, `backend-test.env`, `api-no-docker.env`) and must be edited for SMTP config and `ADMIN_PASSWORD` before first run. A default admin user and default group are auto-created by `nomad-rest-api/server.js` on first DB connection if none exist.

Database dump/restore (mongodb runs in the `mongodb` container):

```bash
docker exec -i nomad-server-mongodb-1 sh -c 'mongodump --archive' > mongodb.dump
docker exec -i nomad-server-mongodb-1 sh -c 'mongorestore --archive --drop' < mongodb.dump
```

## Commands

All commands below are run from within the relevant subproject directory (`nomad-rest-api/` or `nomad-front-end/`).

### nomad-rest-api

```bash
npm run dev          # nodemon + api-no-docker.env, for running the API outside Docker
npm start             # node server.js + api-no-docker.env
npm test              # vitest watch mode, verbose reporter, backend-test.env
npm run test-once     # vitest --run, backend-test.env (use this for one-shot/CI-style runs)
npm run coverage      # vitest run --coverage
```

Run a single test file: `env-cmd -f ../envs/dev/backend-test.env npx vitest run tests/auth.test.js`.
Run a single test by name: add `-t "test name"` to the above.

Tests use `mongodb-memory-server` (no real MongoDB needed) and `supertest` against the exported Express `app` (see `app.js`, which is separate from `server.js` specifically so it can be imported by tests without starting a listening server or connecting mongoose). Shared fixtures and DB setup/teardown live in `tests/fixtures/db.js` and `tests/fixtures/data/`; every test file typically does `beforeAll(connectDB)`, `beforeEach(setupDB)`, `afterAll(dropDB)`.

### nomad-front-end

```bash
npm run start        # vite dev server using ../env/frontend.env (env-cmd), for running outside Docker
npm run dev-docker    # vite dev server, no env-cmd (used inside the Docker container)
npm run build         # vite build
npm run preview       # preview a production build
```

There is no frontend test suite currently.

## Backend architecture

- **Entry points**: `server.js` connects to MongoDB, seeds the default group/admin user, clears stale JWTs on non-dev boot, starts the HTTP server, and initializes Socket.IO (`socket.js`). `app.js` builds and exports the Express app (routes, middleware, CORS headers, Swagger docs) independently of `server.js` so it can be reused by integration tests.
- **Routing convention**: routes are thin — they wire an Express router to controller functions plus `express-validator` chains and auth middleware. Admin-only endpoints live under `routes/admin/*` and `controllers/admin/*`; a newer versioned API surface exists under `routes/v2/*` / `controllers/v2/*` (currently `auto-experiments`), used for the OpenAPI/Swagger-documented endpoints.
- **Auth**: `middleware/auth.js` verifies a JWT from `Authorization: Bearer <token>`, checks the token against the user's stored `tokens` array in Mongo (supporting per-token revocation/logout), and attaches `req.user`/`req.token`. `middleware/auth-admin.js` layers an `accessLevel` check on top. `middleware/auth-client.js` is separate: it authenticates spectrometer-client data uploads by validating `instrumentId` against the `Instrument` collection (not JWT-based) and respects the `DATASTORE_ON` env flag.
- **Submitter (`submitter.js`)**: an in-memory `Map`-based singleton (constructed once in `server.js`, accessed via `getSubmitter()`) tracking, per instrument, its live Socket.IO `socketId` and the set of "holders" (sample slots) in use vs. currently booked. This is the live coordination state between the REST API and connected spectrometer clients — it is not persisted, so it's rebuilt from each instrument's `status.statusTable` on server start.
- **Socket.IO (`socket.js`)**: exposes `initSocket(server)`/`getIO()`. Instrument clients connect with an `instrumentId` query param and get registered in the submitter; browser clients join a `users` room. Used for pushing live status updates to the frontend and to spectrometer clients.
- **Datastore**: uploaded/acquired NMR data lives under `/app/datastore` (mounted from `./datastore` in Docker) and downloadable exports under `/app/downloads`; both are proxied/served via nginx in production (see `nginx.conf`) and mounted volumes in `docker-compose.yaml`.
- **Models** (`models/*.js`, Mongoose): core domain entities are `user`, `group`, `instrument`, `experiment`, `dataset`, `rack`, `claim`, `collection`, `grant`, `parameterSet`, `manualExperiment`, `announcement` — see `SPEC.md` for how these relate (e.g. experiments belong to datasets/instruments, claims associate experiments with users/groups for billing).

## Frontend architecture

- Classic Redux (not Redux Toolkit): `store/actions/*.js` (action creators, one file per domain area, thunked via `redux-thunk` for async API calls) paired 1:1 with `store/reducers/*.js`. `axios-instance.js` provides a shared Axios instance configured with `VITE_API_URL` as the base URL (requests then use paths like `/api/...`).
- `containers/*` hold page/route-level components connected to Redux state and dispatching actions; `components/*` are presentational/reusable UI pieces grouped by feature area (e.g. `BatchSubmitComponents`, `StatusTabs`, `ClaimTable`).
- `socketConnection.js` sets up the Socket.IO client connection used to receive live instrument/status updates pushed from the backend.
- NMR spectrum viewing/processing is integrated via `nmrium` (and `openchemlib`/`react-ocl` for structures) inside `containers/NMRium`.
- In production, nginx serves the built frontend as static files and proxies `/api/`, `/data/`, `/socket.io/`, and `/downloads` to the backend (see `nginx.conf`).

## CI

`.github/workflows/test-api.yml` runs the backend vitest suite (`npm run test-action`, i.e. `vitest --run`) on pushes to `main` and on pull requests, using inline env vars (mongodb-memory-server, no external services). `.github/workflows/publish-docker-images.yml` builds/pushes the `server`, `server-tls`, and `api` Docker images on release, gated on the test workflow passing.
