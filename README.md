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

- `npm run db:sync` - Pushes the current Prisma schema to Neon and regenerates Prisma Client in one step.
- `npm run db:push` - Syncs the schema to the database without regenerating the client.
- `npm run db:generate` - Regenerates Prisma Client after schema changes.

Use `db:sync` during development when you want schema changes to reach Neon immediately. Keep migrations available for stricter production change tracking if you need it later.
