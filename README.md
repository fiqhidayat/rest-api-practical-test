# Backend & REST API Practical Test

## Tech Stack

- Bun + TypeScript
- Hono REST API framework
- Drizzle ORM with SQLite (`bun:sqlite`)
- Zod for request validation

## Setup

```sh
git clone https://github.com/fiqhidayat/rest-api-practical-test.git
cd rest-api-practical-test
bun install
bun run db:migrate
bun run dev
```

The API runs at `http://localhost:3000`.

## API

| Method | Endpoint                | Description        |
| ------ | ----------------------- | ------------------ |
| GET    | `/`                     | Health check       |
| GET    | `/api`                  | API health check   |
| GET    | `/api/tasks`            | List tasks         |
| GET    | `/api/tasks/:id`        | Get a task         |
| POST   | `/api/tasks`            | Create a task      |
| PUT    | `/api/tasks/:id`        | Update a task      |
| PATCH  | `/api/tasks/:id/status` | Update task status |
| DELETE | `/api/tasks/:id`        | Delete a task      |

Task status values: `todo`, `on progress`, `done`.

All request bodies must use `Content-Type: application/json`.

### Create task

`POST /api/tasks`

```json
{
    "title": "Write documentation",
    "description": "Document the API",
    "status": "todo",
    "priority": "high"
}
```

### Update task

`PUT /api/tasks/:id`

```json
{
    "title": "Update documentation",
    "priority": "medium"
}
```

### Update status

`PATCH /api/tasks/:id/status`

```json
{
    "status": "done"
}
```
