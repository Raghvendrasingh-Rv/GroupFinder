# GroupFinder Backend Setup

## Folder Structure

- `src/config/` - Environment and app configuration files.
- `src/modules/auth/` - Authentication-related logic.
- `src/modules/user/` - User management logic.
- `src/modules/event/` - Event creation and event workflow logic.
- `src/modules/request/` - Request and RSVP-style workflows.
- `src/common/middleware/` - Shared Express middleware such as error handling.
- `src/common/utils/` - Shared utility helpers.
- `src/common/types/` - Reusable TypeScript types and interfaces.
- `src/routes/` - Route registration and API versioning.
- `src/app.ts` - Express app setup and middleware registration.
- `src/server.ts` - Server startup entry point.

## Prisma Workflow

- `npm run db:sync` - Pushes the current Prisma schema to the database and regenerates Prisma Client in one step.
- `npm run db:push` - Syncs the schema to the database without regenerating the client.
- `npm run db:generate` - Regenerates Prisma Client after schema changes.
- `npm run db:migrate` - Applies committed Prisma migrations to the deployed database.

Use `db:sync` for quick local development. Use migrations for production so schema changes ship with the app instead of being applied manually.

## Deployment Workflow

For Render, set the build command to:

```bash
npm install && npm run db:migrate && npm run build
```

This keeps the database schema in sync with the application during deploys, as long as the migration files are committed to the repo.
