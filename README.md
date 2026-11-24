# React + Laravel Template

Starter for interview tasks: a **Laravel 13 REST API** (Sanctum token auth, MySQL) and a **React 19 + TypeScript + Vite** SPA (Tailwind v4, React Router, Axios). Auth and an example `Task` CRUD are already wired end to end, so you can copy the pattern and start building.

```
backend/    Laravel API  -> http://localhost:8000/api
frontend/   React SPA    -> http://localhost:5173
```

## Requirements

PHP 8.3+, Composer, Node 20+, MySQL running locally (default: `root` with no password).

## Quick start

```bash
git clone <this-repo> my-app && cd my-app
npm run setup     # installs everything, creates .env files, migrates + seeds MySQL
npm run dev       # starts API and frontend together
```

Open http://localhost:5173 and log in with `test@example.com` / `password`.

If your MySQL credentials differ, edit `backend/.env` (`DB_*`) before running setup.

Ports 8000 and 5173 are fixed: `npm run dev` fails instead of silently switching ports, because the frontend's `VITE_API_URL` and the backend's CORS `FRONTEND_URL` depend on them. Stop whatever is using those ports before starting.

## Scripts (run from repo root)

| Command         | What it does                               |
| --------------- | ------------------------------------------ |
| `npm run setup` | First-time install and database setup     |
| `npm run dev`   | Run Laravel (`:8000`) and Vite (`:5173`)   |
| `npm test`      | Run backend feature tests                  |
| `npm run fresh` | Drop all tables, re-migrate, and re-seed   |

## API

| Method    | Endpoint          | Auth | Notes                                      |
| --------- | ----------------- | ---- | ------------------------------------------ |
| POST      | `/api/register`   | -    | `name, email, password, password_confirmation` -> `{ user, token }` |
| POST      | `/api/login`      | -    | `email, password` -> `{ user, token }`     |
| GET       | `/api/me`         | yes  | Current user                               |
| POST      | `/api/logout`     | yes  | Revokes current token                      |
| GET       | `/api/tasks`      | yes  | Paginated list of the user's tasks         |
| POST      | `/api/tasks`      | yes  | `title, description?, completed?`          |
| GET       | `/api/tasks/{id}` | yes  |                                            |
| PATCH     | `/api/tasks/{id}` | yes  |                                            |
| DELETE    | `/api/tasks/{id}` | yes  |                                            |

Authenticated requests send `Authorization: Bearer <token>`; the frontend's Axios client does this automatically.

## Adding a new resource (e.g. `Product`)

Backend:

```bash
cd backend
php artisan make:model Product -mf                        # model + migration + factory
php artisan make:controller Api/ProductController --api --model=Product
php artisan make:request StoreProductRequest
php artisan make:request UpdateProductRequest
php artisan make:resource ProductResource
php artisan make:policy ProductPolicy --model=Product     # if records are user-owned
php artisan make:test ProductTest
php artisan migrate
```

Then register the route in `routes/api.php`: `Route::apiResource('products', ProductController::class);`

Use `TaskController` / `TaskTest` as a reference.

Frontend: add the type in `src/types.ts`, a page in `src/pages/`, and a route in `src/App.tsx`. Call the API with `api` from `src/lib/api.ts` (use `TasksPage.tsx` as a reference).

## Project layout

```
backend/
  app/Http/Controllers/Api/   AuthController, TaskController
  app/Http/Requests/          Form request validation
  app/Http/Resources/         JSON transformers
  app/Policies/               Authorization (ownership checks)
  routes/api.php              API routes
  tests/Feature/              Auth + Task tests (in-memory SQLite)
frontend/src/
  lib/api.ts                  Axios instance, token handling, error helper
  auth/                       AuthContext, AuthProvider, route guards
  components/                 Layout, shared UI
  pages/                      Login, Register, Tasks
  types.ts                    Shared TS types
```
