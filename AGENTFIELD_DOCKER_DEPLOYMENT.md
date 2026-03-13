# Deploy `AgentNXXT/agentfield` with Docker

This guide provides a quick Docker-based deployment flow for:

- Repository: `https://github.com/AgentNXXT/agentfield`

## 1) Prerequisites

- Docker Engine 24+
- Docker Compose plugin (`docker compose`)
- Git

Verify locally:

```bash
docker --version
docker compose version
git --version
```

## 2) Clone the repository

```bash
git clone https://github.com/AgentNXXT/agentfield.git
cd agentfield
```

## 3) Configure environment variables

If the repo includes an example env file, create a runtime env file:

```bash
cp .env.example .env
```

Then edit `.env` and fill any required values.

## 4) Start with Docker Compose

If the repository has a default `docker-compose.yml`:

```bash
docker compose up -d --build
```

If it ships a specific production file (for example `docker-compose.prod.yml`), use:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## 5) Validate deployment

```bash
docker compose ps
docker compose logs -f --tail=200
```

Open the published service URL/port from compose output.

## 6) Common operations

Stop:

```bash
docker compose down
```

Restart:

```bash
docker compose restart
```

Update to latest code and redeploy:

```bash
git pull
docker compose up -d --build
```

## Troubleshooting

- Port conflicts: change host port mappings in compose and redeploy.
- Build errors: run `docker compose build --no-cache`.
- Missing env vars: re-check `.env` required fields.
- Container health issues: inspect with `docker compose logs <service-name>`.
