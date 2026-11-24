#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "==> Root dependencies"
cd "$ROOT" && npm install

echo "==> Backend (Laravel)"
cd "$ROOT/backend"
composer install
[ -f .env ] || cp .env.example .env
php artisan key:generate
# Creates the MySQL database if it does not exist yet.
php artisan migrate:fresh --seed --no-interaction

echo "==> Frontend (React)"
cd "$ROOT/frontend"
[ -f .env ] || cp .env.example .env
npm install

echo ""
echo "Done. Run 'npm run dev' and open http://localhost:3000"
echo "Login: test@example.com / password"
