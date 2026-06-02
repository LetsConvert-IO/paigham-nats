# Paigham

<p align="center">
  <img src="frontend/static/favicon.svg" alt="Paigham Logo" width="128" height="128">
</p>

<p align="center">
  <strong>پیغام</strong> - "Message" in Urdu
</p>

<p align="center">
  A lightweight NATS JetStream management UI with Go backend and Svelte frontend.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#development">Development</a>
</p>

---

## Features

- **Stream Management** - View, purge, and delete JetStream streams
- **Consumer Management** - Monitor and manage consumers
- **Message Browser** - Browse, view, and delete individual messages
- **JSON Pretty Print** - Automatic JSON formatting for message content
- **Dark/Light Theme** - Built-in theme toggle
- **Google OAuth** - Optional authentication with user allowlist
- **Lightweight** - Single binary, minimal resource footprint

## Quick Start

### Using Docker

```bash
# Run with a local NATS server
docker run -p 8080:8080 \
  -e NATS_URL=nats://host.docker.internal:4222 \
  ghcr.io/paigham/paigham-nats:latest

# Open http://localhost:8080
```

### Using Docker Compose

```yaml
version: '3.8'
services:
  nats:
    image: nats:latest
    command: ["--jetstream"]
    ports:
      - "4222:4222"

  paigham:
    image: ghcr.io/paigham/paigham-nats:latest
    ports:
      - "8080:8080"
    environment:
      - NATS_URL=nats://nats:4222
    depends_on:
      - nats
```

### Using Helm

```bash
helm repo add paigham https://letsconvert-io.github.io/paigham-nats
helm install paigham paigham/paigham-nats \
  --set config.natsUrl=nats://nats:4222
```

## Configuration

All configuration is done via environment variables (12-factor style):

| Variable | Description | Default |
|----------|-------------|---------|
| `NATS_URL` | NATS server URL | `nats://localhost:4222` |
| `PORT` | HTTP server port | `8080` |
| `AUTH_MODE` | Authentication mode: `none` or `google` | `none` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | - |
| `BASE_URL` | Base URL for OAuth redirects | `http://localhost:8080` |
| `ALLOWED_USERS` | Comma-separated allowed email addresses | - (all allowed) |
| `SESSION_SECRET` | Cookie encryption key | random |

### Authentication

#### No Authentication (Default)

By default, Paigham runs without authentication, suitable for development or internal networks:

```bash
AUTH_MODE=none
```

#### Google OAuth

To enable Google OAuth authentication:

1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Set the redirect URI to `https://your-domain.com/api/auth/callback`
3. Configure the environment variables:

```bash
AUTH_MODE=google
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
BASE_URL=https://your-domain.com
ALLOWED_USERS=admin@example.com,user@example.com
```

## Deployment

### Kubernetes with Helm

```bash
# Basic installation
helm install paigham ./helm/paigham-nats \
  --set config.natsUrl=nats://nats:4222

# With Google OAuth
helm install paigham ./helm/paigham-nats \
  --set config.natsUrl=nats://nats:4222 \
  --set config.authMode=google \
  --set config.googleClientId=your-client-id \
  --set config.googleClientSecret=your-client-secret \
  --set config.baseUrl=https://paigham.example.com \
  --set config.allowedUsers="admin@example.com"

# With Ingress
helm install paigham ./helm/paigham-nats \
  --set config.natsUrl=nats://nats:4222 \
  --set ingress.enabled=true \
  --set ingress.className=nginx \
  --set ingress.hosts[0].host=paigham.example.com \
  --set ingress.hosts[0].paths[0].path=/ \
  --set ingress.hosts[0].paths[0].pathType=Prefix
```

### Docker Build

```bash
# Build the image
docker build -t paigham-nats .

# Run locally
docker run -p 8080:8080 -e NATS_URL=nats://host.docker.internal:4222 paigham-nats
```

## Development

### Prerequisites

- Go 1.22+
- Node.js 22+
- NATS Server with JetStream enabled

### Backend

```bash
cd backend
go mod download
go run .
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend development server proxies API requests to `http://localhost:8080`.

### Build for Production

```bash
# Build frontend
cd frontend && npm run build

# Copy build to backend static folder
cp -r build ../backend/static

# Build backend
cd ../backend && go build -o paigham-nats
```

## API Endpoints

### Health
- `GET /health` - Health check

### Auth
- `GET /api/auth/me` - Get current user
- `GET /api/auth/login` - Initiate Google OAuth
- `GET /api/auth/callback` - OAuth callback
- `GET /api/auth/logout` - Logout

### Streams
- `GET /api/streams` - List all streams
- `GET /api/streams/:name` - Get stream info
- `DELETE /api/streams/:name` - Delete stream
- `POST /api/streams/:name/purge` - Purge stream messages

### Consumers
- `GET /api/streams/:stream/consumers` - List consumers
- `GET /api/streams/:stream/consumers/:name` - Get consumer info
- `DELETE /api/streams/:stream/consumers/:name` - Delete consumer

### Messages
- `GET /api/streams/:stream/messages` - List messages (with `start_seq` and `limit` params)
- `GET /api/streams/:stream/messages/:seq` - Get single message
- `DELETE /api/streams/:stream/messages/:seq` - Delete message

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<p align="center">
  <sub>Built with Go, Svelte, and a love for messaging systems.</sub>
</p>
