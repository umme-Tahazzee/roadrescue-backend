# Roadside Assistance & Emergency Dispatch Platform

Backend API — B7A6 assignment (Student ID: L2B7-1252)

## Setup

```bash
npm install
cp .env.example .env   # fill in your values
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

## Scripts
- `npm run dev` — start dev server (ts-node-dev, hot reload)
- `npm run build` — compile TypeScript to `dist/`
- `npm start` — run compiled build
- `npm run prisma:generate` — regenerate Prisma client
- `npm run prisma:migrate` — run migrations

## Structure
```
src/
├── app.ts              # Express app (middleware, route mounting)
├── server.ts            # HTTP + Socket.io bootstrap
├── config/               # env/config loading
├── modules/
│   ├── auth/
│   ├── user/
│   ├── mechanic/
│   ├── request/
│   ├── payment/
│   ├── review/
│   └── admin/
├── sockets/               # socket event handlers
├── middlewares/           # auth guard, validateRequest, error handler
├── utils/                  # catchAsync, sendResponse
└── routes/                  # route aggregator
```

Each module should follow: `*.interface.ts → *.validation.ts → *.service.ts → *.controller.ts → *.route.ts`

## Note
`node_modules/` is intentionally excluded from this delivery (never shipped/committed).
Run `npm install` once — `package-lock.json` is included so versions resolve instantly and identically to what was tested here.

See `roadside-assistance-project-plan.md` (shared earlier) for the full Prisma schema, API endpoint list, geospatial matching query, and Socket.io event design.
