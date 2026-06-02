# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Paigham (پیغام, "Message" in Urdu) is a NATS JetStream management UI — a single Go binary that embeds a SvelteKit frontend and exposes a REST API for managing streams, consumers, and messages.

## Development Commands

### Backend (Go)

```bash
cd backend
go mod download
go run .                        # starts on :8080
go build -o paigham-nats        # build binary
```

### Frontend (SvelteKit + Tailwind + DaisyUI)

```bash
cd frontend
npm install
npm run dev                     # starts on :5173, proxies /api and /health to :8080
npm run build                   # outputs to frontend/build/
npm run check                   # TypeScript type-check
```

### Production Build (full pipeline)

```bash
cd frontend && npm run build
cp -r build ../backend/static
cd ../backend && go build -o paigham-nats
```

The Go binary embeds `backend/static/` at compile time via `//go:embed static/*`. The `backend/static/` directory must be populated from the frontend build before compiling the backend.

### Docker

```bash
docker build -t paigham-nats .
docker run -p 8080:8080 -e NATS_URL=nats://host.docker.internal:4222 paigham-nats
```

## Architecture

### Backend (`backend/`)

- **`main.go`** — wires everything together: loads config, connects to NATS, registers chi router, embeds static files for SPA serving
- **`config/config.go`** — all config from env vars; `IsAuthEnabled()` checks `AUTH_MODE=google`
- **`nats/client.go`** — thin wrapper around `nats.go` for JetStream operations
- **`handlers/`** — one file per resource (`streams.go`, `consumers.go`, `messages.go`, `auth.go`); handlers hold a `*nats.Client` reference
- **`middleware/auth.go`** — `RequireAuth` middleware; bypassed entirely when `AUTH_MODE=none`

Router layout: `/api/auth/*` is public; all other `/api/*` routes require auth via `authMiddleware.RequireAuth`.

### Frontend (`frontend/src/`)

- **`lib/api.js`** — all API calls, uses `credentials: 'include'` for session cookies
- **`lib/stores/auth.js`** — Svelte store for current user state
- **`lib/stores/toast.js`** — global toast notifications
- **`routes/`** — SvelteKit file-based routing; pages: streams list, stream detail, message browser, consumer detail

### Configuration

All configuration is environment-variable-based:

| Variable | Default |
|---|---|
| `NATS_URL` | `nats://localhost:4222` |
| `PORT` | `8080` |
| `AUTH_MODE` | `none` (`google` to enable OAuth) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | — |
| `BASE_URL` | `http://localhost:8080` |
| `ALLOWED_USERS` | comma-separated emails (empty = all allowed) |
| `SESSION_SECRET` | random 32-byte key if unset |

### Deployment

Helm chart is in `helm/paigham-nats/`. The chart manages deployment, service, HPA, optional ingress, and a secret for config values.

## Versioning Rules — MUST follow on every change

### Helm chart (`helm/paigham-nats/Chart.yaml`)

**Always bump `version` when making any chart change** (templates, values, Chart.yaml metadata). The `helm-release` workflow creates a GitHub Release tagged `paigham-nats-<version>` on every push to `main` that touches `helm/**`. If the version already has a release tag, the workflow fails with `422 already_exists`. There is no auto-increment — you must bump it manually.

- `version` — the chart package version (SemVer). Bump for any chart change.
- `appVersion` — the application version this chart deploys. Update when the Docker image has a new release tag (e.g. `v1.1.0`). This is informational only and does not affect CI.

```yaml
# helm/paigham-nats/Chart.yaml
version: 0.1.2        # ← bump this on every helm/** change merged to main
appVersion: "1.0.0"   # ← update when a new Docker image version tag is published
```

### Docker image (`ghcr.io/letsconvert-io/paigham-nats`)

The `docker-release` workflow publishes on every push to `main` **and** on version tags. Tags produced:

| Trigger | Image tags |
|---|---|
| Push to `main` | `main`, `sha-<short>` |
| Git tag `v1.2.3` | `1.2.3`, `1.2`, `main`, `sha-<short>` |

To publish a versioned release (e.g. `1.1.0`), push a tag:
```bash
git tag v1.1.0 && git push origin v1.1.0
```
Then update `appVersion` in `Chart.yaml` to match and bump `version`.
