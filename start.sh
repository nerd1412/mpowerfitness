#!/usr/bin/env bash
# Mpower Fitness — dev/prod start script
# Usage: ./start.sh [dev|prod|backend|frontend|seed]
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
MODE="${1:-dev}"

log()  { echo -e "\033[1;32m[mpower]\033[0m $*"; }
warn() { echo -e "\033[1;33m[mpower]\033[0m $*"; }
err()  { echo -e "\033[1;31m[mpower]\033[0m $*" >&2; }

[ ! -f "$ROOT/backend/.env"  ] && warn "Copying backend/.env from example" && cp "$ROOT/backend/.env.example"  "$ROOT/backend/.env"
[ ! -f "$ROOT/frontend/.env" ] && cp "$ROOT/frontend/.env.example" "$ROOT/frontend/.env"

install_if_needed() { [ ! -d "$1/node_modules" ] && log "Installing $(basename $1) deps…" && (cd "$1" && npm install); }
install_if_needed "$ROOT/backend"
[[ "$MODE" != "backend" && "$MODE" != "seed" ]] && install_if_needed "$ROOT/frontend"

mkdir -p "$ROOT/backend/data"
mkdir -p "$ROOT/backend/uploads/"{avatars,workouts,progress}

case "$MODE" in
  dev)
    log "Dev mode → backend :5000  frontend :3000"
    (cd "$ROOT/backend"  && npm run dev) &
    (cd "$ROOT/frontend" && npm start) &
    wait
    ;;
  prod)
    log "Building frontend…"
    (cd "$ROOT/frontend" && npm run build)
    log "Starting production backend…"
    NODE_ENV=production node "$ROOT/backend/src/server.js"
    ;;
  backend)  (cd "$ROOT/backend"  && npm run dev) ;;
  frontend) (cd "$ROOT/frontend" && npm start) ;;
  seed)     (cd "$ROOT/backend"  && node src/utils/seeder.js) ;;
  *)        err "Unknown mode: $MODE. Use: dev|prod|backend|frontend|seed"; exit 1 ;;
esac
