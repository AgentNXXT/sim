#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Deploy Sim services to Google Cloud Run.

Required:
  --project <gcp-project-id>
  --region <region>                    e.g. us-central1
  --db-url <postgres-connection-url>   Cloud SQL/Supabase/Neon URL with pgvector
  --app-url <public-app-url>           e.g. https://sim.example.com

Optional:
  --service-prefix <name>              Default: sim
  --image-repo <artifact-repo>         Default: sim
  --socket-url <public-socket-url>     Default: app URL
  --copilot-api-key <key>

Example:
  ./scripts/deploy-cloud-run.sh \
    --project my-project \
    --region us-central1 \
    --db-url 'postgresql://user:pass@host:5432/db?sslmode=require' \
    --app-url 'https://sim.example.com'
USAGE
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

random_hex() {
  openssl rand -hex 32
}

build_image() {
  local image_tag="$1"
  local dockerfile_path="$2"

  local config_file
  config_file="$(mktemp)"

  cat >"$config_file" <<EOF
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-f', '${dockerfile_path}', '-t', '${image_tag}', '.']
images:
  - '${image_tag}'
EOF

  gcloud builds submit --config "$config_file" .
  rm -f "$config_file"
}

PROJECT=""
REGION=""
DB_URL=""
APP_URL=""
SOCKET_URL=""
SERVICE_PREFIX="sim"
IMAGE_REPO="sim"
COPILOT_API_KEY=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project)
      PROJECT="$2"; shift 2 ;;
    --region)
      REGION="$2"; shift 2 ;;
    --db-url)
      DB_URL="$2"; shift 2 ;;
    --app-url)
      APP_URL="$2"; shift 2 ;;
    --socket-url)
      SOCKET_URL="$2"; shift 2 ;;
    --service-prefix)
      SERVICE_PREFIX="$2"; shift 2 ;;
    --image-repo)
      IMAGE_REPO="$2"; shift 2 ;;
    --copilot-api-key)
      COPILOT_API_KEY="$2"; shift 2 ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1 ;;
  esac
done

if [[ -z "$PROJECT" || -z "$REGION" || -z "$DB_URL" || -z "$APP_URL" ]]; then
  echo "Error: --project, --region, --db-url, and --app-url are required." >&2
  usage
  exit 1
fi

if [[ -z "$SOCKET_URL" ]]; then
  SOCKET_URL="$APP_URL"
fi

require_cmd gcloud
require_cmd openssl

APP_SERVICE="${SERVICE_PREFIX}-app"
REALTIME_SERVICE="${SERVICE_PREFIX}-realtime"

BETTER_AUTH_SECRET="$(random_hex)"
ENCRYPTION_KEY="$(random_hex)"
INTERNAL_API_SECRET="$(random_hex)"
API_ENCRYPTION_KEY="$(random_hex)"

APP_IMAGE="${REGION}-docker.pkg.dev/${PROJECT}/${IMAGE_REPO}/${APP_SERVICE}:latest"
REALTIME_IMAGE="${REGION}-docker.pkg.dev/${PROJECT}/${IMAGE_REPO}/${REALTIME_SERVICE}:latest"

echo "Configuring gcloud project..."
gcloud config set project "$PROJECT" >/dev/null

echo "Enabling required APIs..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com >/dev/null

echo "Ensuring Artifact Registry repository exists..."
gcloud artifacts repositories describe "$IMAGE_REPO" --location "$REGION" >/dev/null 2>&1 || \
  gcloud artifacts repositories create "$IMAGE_REPO" \
    --repository-format=docker \
    --location="$REGION" \
    --description="Docker repository for Sim Cloud Run images"

echo "Building and pushing app image..."
build_image "$APP_IMAGE" "docker/app.Dockerfile"

echo "Building and pushing realtime image..."
build_image "$REALTIME_IMAGE" "docker/realtime.Dockerfile"

echo "Deploying realtime service: $REALTIME_SERVICE"
gcloud run deploy "$REALTIME_SERVICE" \
  --image "$REALTIME_IMAGE" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,DATABASE_URL=${DB_URL},NEXT_PUBLIC_SOCKET_URL=${SOCKET_URL},BETTER_AUTH_URL=${APP_URL},NEXT_PUBLIC_APP_URL=${APP_URL}"

REALTIME_URL="$(gcloud run services describe "$REALTIME_SERVICE" --region "$REGION" --format='value(status.url)')"

echo "Deploying app service: $APP_SERVICE"
APP_ENV_VARS="NODE_ENV=production,DATABASE_URL=${DB_URL},BETTER_AUTH_URL=${APP_URL},NEXT_PUBLIC_APP_URL=${APP_URL},NEXT_PUBLIC_SOCKET_URL=${REALTIME_URL},BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET},ENCRYPTION_KEY=${ENCRYPTION_KEY},INTERNAL_API_SECRET=${INTERNAL_API_SECRET},API_ENCRYPTION_KEY=${API_ENCRYPTION_KEY}"

if [[ -n "$COPILOT_API_KEY" ]]; then
  APP_ENV_VARS+=",COPILOT_API_KEY=${COPILOT_API_KEY}"
fi

gcloud run deploy "$APP_SERVICE" \
  --image "$APP_IMAGE" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "$APP_ENV_VARS"

APP_DEPLOYED_URL="$(gcloud run services describe "$APP_SERVICE" --region "$REGION" --format='value(status.url)')"

echo
echo "✅ Deployment complete"
echo "App URL:      $APP_DEPLOYED_URL"
echo "Realtime URL: $REALTIME_URL"
