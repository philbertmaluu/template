# Instructions

## 1. Publish the template to GitHub (one time)

1. On github.com, create a new **empty** repository (no README, no .gitignore), e.g. `react-laravel-template`.
2. Push this project:

```bash
cd /Users/mac/template
git remote add origin git@github.com:<your-username>/react-laravel-template.git
git push -u origin main
```

(Use the `https://github.com/...` URL instead if you don't use SSH keys.)

Optional: in the repo settings on GitHub, tick **Template repository** so you can click "Use this template" to create a fresh copy for each interview.

## 2. On interview day

Requirements on the machine: PHP 8.3+, Composer, Node 20+, MySQL running.

```bash
git clone <repo-url> my-app && cd my-app
npm run setup   # installs dependencies, creates .env files, creates + migrates + seeds MySQL
npm run dev     # API on http://localhost:8080, app on http://localhost:3000
```

Open http://localhost:3000 and log in with `test@example.com` / `password`.

If MySQL is not `root` with no password, first copy `backend/.env.example` to `backend/.env`, set the `DB_*` values there, and then run `npm run setup`.

## 3. Everyday commands (from the repo root)

| Command         | What it does                             |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start backend and frontend together      |
| `npm run fresh` | Reset the database and re-seed test data |

## 4. Building a new feature

Copy the existing `Task` example. See "Adding a new resource" in `README.md` for the exact artisan commands, then:

- Backend: register the route in `backend/routes/api.php`.
- Frontend: add the type to `src/types.ts`, the API functions to `src/hooks/` (see `useTasks.ts`), a page in `src/pages/`, and a route in `src/App.tsx`. Don't call `performRequest` from a page, and don't import axios directly.

## 5. Troubleshooting

- **"Port 3000 is already in use" / "Failed to listen on 127.0.0.1:8080"**: another app is using that port. Stop it and run `npm run dev` again. The ports are fixed on purpose so the frontend never talks to the wrong backend.
- **Requests go to the wrong backend**: the frontend always calls `/api` on `localhost:3000`, and Vite forwards it to `BACKEND_URL` in `frontend/.env` (default `http://127.0.0.1:8080`). Check that value and restart `npm run dev`.
- **Database connection error during setup**: check that MySQL is running (`brew services start mysql`) and that the `DB_*` values in `backend/.env` are correct.
- **Logged out unexpectedly / 401 errors**: the token was revoked or the database was reset. Log in again.
- **CORS error in the browser**: this only happens if `VITE_API_URL` was changed to a full URL instead of `/api`. In that case, `FRONTEND_URL` in `backend/.env` must exactly match the address you open the app on.
