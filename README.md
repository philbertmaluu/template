# React + Laravel Template

Starter for interview tasks: a **Laravel 13 REST API** (Sanctum token auth, MySQL) and a **React 19 + TypeScript + Vite** SPA (Ant Design, Tailwind v4, React Router). Auth and an example `Task` CRUD are already wired end to end, so you can copy the pattern and start building.

```
backend/    Laravel API  -> http://localhost:8080/api
frontend/   React SPA    -> http://localhost:3000
```

## Requirements

PHP 8.3+, Composer, Node 20+, MySQL running locally (default: `root` with no password).

## Quick start

```bash
git clone <this-repo> my-app && cd my-app
npm run setup     # installs everything, creates .env files, migrates + seeds MySQL
npm run dev       # starts API and frontend together
```

Open http://localhost:3000 and log in with `test@example.com` / `password`.

If your MySQL credentials differ, edit `backend/.env` (`DB_*`) before running setup.

Ports 8080 (API) and 3000 (frontend) are fixed: `npm run dev` fails instead of silently switching ports. The frontend calls `/api` on its own origin, and Vite proxies those requests to `BACKEND_URL` in `frontend/.env` (default `http://127.0.0.1:8080`), so the browser never talks to another app's backend by accident.

## Scripts (run from repo root)

| Command         | What it does                               |
| --------------- | ------------------------------------------ |
| `npm run setup` | First-time install and database setup     |
| `npm run dev`   | Run Laravel (`:8080`) and Vite (`:3000`)   |
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

Authenticated requests send `Authorization: Bearer <token>`; `performRequest` adds it automatically.

## Calling the API from React

Use `performRequest` from `src/lib/api.ts` for every call. There's no need to import axios, and the token and base URL are handled for you:

```ts
import { performRequest } from '../lib/api'

// performRequest<ResponseType>(method, url, payload?, axiosConfig?) -> response body
const tasks = await performRequest<Paginated<Task>>('get', '/tasks', { page: 2 }) // GET/DELETE payload = query params
const { data } = await performRequest<{ data: Task }>('post', '/tasks', { title: 'New' })
await performRequest('patch', `/tasks/${id}`, { completed: true })
await performRequest('delete', `/tasks/${id}`)
```

Errors are thrown; show them with `getErrorMessage(err)` (it returns the first Laravel validation message).

## Tables

Use `DataTable` from `src/components/DataTable.tsx` for every table. It is the standard layout: one search box, optional actions at the right end, and a full-width table inside a card. `TasksPage.tsx` is the working example, including server-side pagination against Laravel's `meta`.

```tsx
import { DataTable } from '../components/DataTable'
import type { TableColumnsType } from 'antd'

const columns: TableColumnsType<User> = [
  { title: 'Name', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
  { title: 'Age', dataIndex: 'age', align: 'right' },
  { title: 'Actions', key: 'actions', align: 'right', render: (_, record) => <button>Edit {record.name}</button> },
]

<DataTable
  rowKey="id"
  columns={columns}
  dataSource={res.data}
  loading={loading}
  searchPlaceholder="Search users"
  extra={<Button type="primary">Add</Button>}
  pagination={{
    current: res.meta.current_page,
    pageSize: res.meta.per_page,
    total: res.meta.total,
    onChange: (page) => load(page),
  }}
/>
```

Search filters the rows currently loaded. Pass `getSearchText={(row) => row.name}` to choose which text is matched. The header color is the primary maroon, set in `src/main.tsx`. A `sorter` function sorts the loaded rows; to sort the whole dataset, handle `onChange` and sort in Laravel.

## Forms

Open every form in `FormDrawer` from `src/components/FormDrawer.tsx`. Put antd `Form.Item` fields inside it. The drawer validates, submits, shows Laravel field errors, and closes on success. `TasksPage.tsx` is the example.

```tsx
const [open, setOpen] = useState(false)

<Button type="primary" onClick={() => setOpen(true)}>Add</Button>

<FormDrawer open={open} title="Add user" submitText="Save" onClose={() => setOpen(false)} onSubmit={createUser}>
  <Form.Item name="name" label="Name" rules={[{ required: true }]}>
    <Input />
  </Form.Item>
</FormDrawer>
```

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

Frontend: add the type in `src/types.ts`, a page in `src/pages/`, and a route in `src/App.tsx`. Call the API with `performRequest` (use `TasksPage.tsx` as a reference).

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
  lib/api.ts                  performRequest, token handling, error helper
  auth/                       AuthContext, AuthProvider, route guards
  components/                 Layout, shared UI
  pages/                      Login, Register, Tasks
  types.ts                    Shared TS types
```
