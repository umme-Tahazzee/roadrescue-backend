# RoadRescue: Roadside Assistance & Emergency Dispatch Platform

Backend REST API for an on-demand roadside assistance service. Customers request help (towing, tyre change, etc.), nearby approved mechanics accept the job, and payment is settled by cash or bKash. Admins approve mechanics and manage users.

B7A6 assignment (Student ID: L2B7-1252)

## Tech Stack

| Area | Technology |
|---|---|
| Runtime / Framework | Node.js, Express 5, TypeScript (ESM) |
| Database | PostgreSQL with Prisma 7 (`@prisma/adapter-pg`) |
| Cache / OTP store | Redis |
| Auth | JWT (access + refresh) in httpOnly cookies, bcryptjs, Google Sign-In |
| Validation | Zod 4 |
| File upload | Multer (memory) + Cloudinary |
| Email | Nodemailer + EJS templates |
| Payments | Cash and bKash (bKash is currently mocked, see Known Limitations) |
| Tooling | tsx (dev), tsup (build), Biome (lint/format) |
| Deployment | Vercel (`vercel.json`) |

## Features

- Email/password registration with a 6-digit OTP verification (stored in Redis, 5-hour expiry as configured)
- Google Sign-In, forgot/reset password via OTP, refresh-token rotation, logout with refresh-token blacklist
- Role-based access: `CUSTOMER`, `MECHANIC`, `ADMIN`
- Mechanic onboarding with NID, license and vehicle photo upload (Cloudinary), admin approval flow
- Mechanic availability toggle and live location update
- Service requests with distance-based mechanic matching (Haversine, filtered by each mechanic's service radius)
- Race-safe job acceptance (only one mechanic can accept a PENDING request)
- Job lifecycle, final price, automatic payment record on completion
- Cash confirmation by mechanic; bKash initiation and callback handling (mock)
- Refund request/approve/process flow (code present, route not mounted yet)
- Admin dashboard stats, user management, block/unblock
- Centralized error handling (AppError, Zod, Prisma errors)
- Admin account seeded on server start

## Project Structure

```
src/
├── app.ts                  # Express app: CORS, parsers, routes, error handlers
├── server.ts               # Bootstrap: DB, admin seed, Redis, SMTP verify, listen
├── config/                 # Reads environment variables
├── routes/index.ts         # Mounts all module routers under /api/v1
├── modules/
│   ├── auth/               # register, verify-email, login, google, refresh, reset
│   ├── customer/           # profile, request history, deactivate
│   ├── mechanic/           # profile, availability, location, admin approval
│   ├── service-request/    # create, match, accept, status, complete, cancel
│   ├── payment/            # payments, bKash, refunds (not mounted yet)
│   ├── admin/              # dashboard, users, requests
│   ├── user/               # placeholder
│   └── review/             # placeholder
├── middlewares/            # auth guard, validateRequest, upload, error handlers
├── lib/                    # prisma, cloudinary, nodemailer, google auth
├── utils/                  # AppError, catchAsync, sendResponse, jwt, redis, geo, seedAdmin
├── templates/              # EJS email templates
└── sockets/                # reserved for Socket.io (not wired yet)
prisma/
├── schema/                 # Multi-file Prisma schema
├── migrations/
└── generated/prisma/       # Generated client
```

Module convention: `*.interface.ts → *.validation.ts → *.service.ts → *.controller.ts → *.route.ts`

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Redis instance
- SMTP account (for OTP emails)
- Cloudinary account (for mechanic documents)
- Google OAuth client ID (only for Google Sign-In)

### Installation

```bash
npm install
cp .env.example .env     # then fill in your values (see below)
npx prisma generate --config prisma7.config.ts
npx prisma migrate dev --config prisma7.config.ts
npm run dev
```

The Prisma config file in this repo is named `prisma7.config.ts` (not the default `prisma.config.ts`), so the CLI needs the `--config` flag. It loads `DATABASE_URL` from `.env` via `dotenv`, so `.env` must exist before any `prisma` command.

The server starts only if PostgreSQL, Redis and SMTP all connect; otherwise it logs the error and exits.

### Environment Variables

Names below match `src/config/index.ts` exactly. Three names contain typos in the code (`SUPPER_ADMIN_PASSWORD`, `BKSH_URL`, `BKASH_CALLBACK_UR`); use them as written, or rename them in the config and here together.

```env
# App
NODE_ENV=development
PORT=5000
APP_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/roadrescue
BCRYPT_SALT_ROUNDS=10

# JWT (expires-in examples: 15m, 7d)
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google Sign-In
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Cloudinary
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Seeded admin accounts
SUPER_ADMIN_NAME=
SUPER_ADMIN_EMAIL=
SUPPER_ADMIN_PASSWORD=
TESTER_ADMIN_NAME=
TESTER_ADMIN_EMAIL=
TESTER_ADMIN_PASSWORD=

# Redis
REDIS_USER=
REDIS_PASSWORD=
REDIS_HOST=
REDIS_PORT=

# Email (SMTP)
EMAIL_USER=
EMAIL_SENDER=
EMAIL_PASS=

# bKash
BKSH_URL=
BKASH_USERNAME=
BKASH_PASSWORD=
BKASH_APP_KEY=
BKASH_APP_SECRET=
BKASH_CALLBACK_UR=
```

Never commit `.env`. If it was ever shared or committed, rotate every secret in it.

### Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload (`tsx watch`) |
| `npm run build` | Bundle to `dist/` with tsup |
| `npm start` | Run the compiled build |
| `npm run lint:check` / `lint:fix` | Biome lint |
| `npm run format:check` / `format:fix` | Biome format |

## API Overview

Base URL: `/api/v1`

### Authentication

Protected routes accept the token from the `accessToken` cookie (set on login) or an `Authorization: Bearer <token>` header. Browser clients must send credentials, and `FRONTEND_URL` must match the frontend origin because CORS is restricted to it. In production, cookies are `secure` with `sameSite=none`; in development they are `sameSite=lax`.

### Response format

Success:
```json
{ "success": true, "statusCode": 200, "message": "...", "data": {}, "meta": null }
```

Error:
```json
{
  "success": false,
  "statusCode": 400,
  "name": "Error",
  "message": "Validation Error",
  "errorDetails": [{ "path": "email", "message": "Invalid email format" }]
}
```

`errorDetails` appears for Zod validation errors. In non-development environments, 5xx messages are masked.

### Endpoints

**Auth** (`/auth`)

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Body: `name`, `email`, `password`, optional `role` (`CUSTOMER` or `MECHANIC`). Sends OTP email |
| POST | `/verify-email` | Public | Body: `email`, `otp`. Creates the user (does not set cookies; log in afterwards) |
| POST | `/login` | Public | Sets cookies; response body contains the tokens only, call `/auth/me` for the user |
| GET | `/me` | Any role | Current user with requests and reviews |
| POST | `/refresh-token` | Cookie | Issues new access and refresh tokens |
| POST | `/google` | Public | Body: `idToken` |
| POST | `/forgot-password` | Public | Body: `email`. Sends OTP |
| POST | `/reset-password` | Public | Body: `email`, `otp`, `newPassword` |
| POST | `/logout` | Public | Clears cookies, blacklists refresh token |

**Customers** (`/customers`, role `CUSTOMER`)

| Method | Path | Description |
|---|---|---|
| GET | `/profile` | Own profile |
| PATCH | `/profile` | Update `name`, `phone` |
| GET | `/requests?status=` | Own request history (includes mechanic, payment, review) |
| DELETE | `/account` | Soft-delete (deactivate) account |

**Mechanics** (`/mechanics`)

| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/profile` | MECHANIC | `multipart/form-data`: files `nidDoc`, `licenseDoc`, `vehiclePhoto` (JPG/PNG/WEBP/PDF, max 5 MB each), field `serviceTypes` (JSON array string), optional `serviceRadius` (km, default 10) |
| GET | `/profile/me` | MECHANIC | Own profile |
| PATCH | `/availability` | MECHANIC | Body: `isAvailable` (boolean). Only APPROVED mechanics can go online |
| PATCH | `/location` | MECHANIC | Body: `lat`, `lng` |
| GET | `/?status=` | ADMIN | List profiles, filter by `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED` |
| PATCH | `/:id/approve` | ADMIN | Approve a PENDING profile |
| PATCH | `/:id/reject` | ADMIN | Reject a PENDING profile |

**Service Requests** (`/requests`)

| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/` | CUSTOMER | Body: `serviceType`, optional `description`, `pickupLat`, `pickupLng`. One active request per customer. Returns the request and `nearbyMechanicsCount` |
| GET | `/:id/nearby-mechanics` | CUSTOMER | Matching mechanics sorted by distance (own request only) |
| PATCH | `/:id/cancel` | CUSTOMER | Not allowed once IN_PROGRESS or COMPLETED |
| GET | `/pending` | MECHANIC | PENDING requests within the mechanic's radius. Mechanic must be approved, online, with a location set |
| PATCH | `/:id/accept` | MECHANIC | PENDING to ACCEPTED (atomic, first mechanic wins) |
| PATCH | `/:id/status` | MECHANIC | Body: `status` = `IN_PROGRESS`. Valid transition: ACCEPTED to IN_PROGRESS |
| PATCH | `/:id/complete` | MECHANIC | Body: `finalPrice` (> 0), `method` (`CASH` or `BKASH`). Sets COMPLETED and creates the Payment in one transaction |
| PATCH | `/payments/:id/confirm-cash` | MECHANIC | Mark a cash payment as PAID |

Use `/complete` to finish a job. Sending `COMPLETED` to `/status` skips payment creation.

**Admin** (`/admin`, role `ADMIN`)

| Method | Path | Description |
|---|---|---|
| GET | `/profile` | Admin profile |
| GET | `/dashboard` | Counts: users, mechanics (pending/approved), requests by status |
| GET | `/users?role=` | All users |
| GET | `/users/:id` | User with mechanic profile, requests, reviews |
| PATCH | `/users/:id/block` | Body: `isBlocked` (boolean). Admins cannot be blocked, and you cannot block yourself |
| GET | `/requests?status=` | All service requests |

**Payments** (`/payments`): implemented in `src/modules/payment` but **not mounted** in `routes/index.ts` yet. See Known Limitations.

| Method | Path | Role |
|---|---|---|
| POST | `/bkash/callback` | Public (gateway) |
| GET | `/`, `/refunds` | ADMIN |
| PATCH | `/refunds/:id/approve`, `/reject`, `/process` | ADMIN |
| GET | `/my` | CUSTOMER |
| POST | `/:id/bkash/initiate`, `/:id/refund` | CUSTOMER |
| PATCH | `/:id/confirm-cash` | MECHANIC |
| GET | `/:id` | Any role (ownership checked) |

## Data Model

| Model | Purpose |
|---|---|
| `User` | Account, role, auth provider (`CREDENTIAL` / `GOOGLE`), soft-delete and block flags |
| `MechanicProfile` | One per mechanic user: service types, documents, status, availability, location, radius, rating |
| `ServiceRequest` | Customer job: service type, pickup coordinates, status, price, assigned mechanic |
| `Payment` | One per request: amount (BDT), method, status, invoice number, gateway response |
| `Refund` | Refunds against a payment |
| `Review` | One per request (model exists, no endpoints yet) |

Enums: `Role`, `MechanicStatus`, `RequestStatus`, `PaymentMethod`, `PaymentStatus`, `RefundStatus`, `AuthProvider`.

### Request lifecycle

```
PENDING → ACCEPTED → IN_PROGRESS → COMPLETED
   └──────────┴──── CANCELLED (customer, before IN_PROGRESS)
```

`EN_ROUTE` exists in the enum but no endpoint moves a request into it yet.

### Matching logic

Prisma has no native geospatial queries, so candidates (APPROVED, available, matching `serviceType`, with a location) are loaded and filtered in JavaScript: distance is computed with the Haversine formula and kept only if it is within the mechanic's `serviceRadius`, then sorted nearest first.

## Deployment (Vercel)

The repo includes `vercel.json` and a tsup build. Set all environment variables in the Vercel project settings. Use a managed PostgreSQL and Redis, set `NODE_ENV=production` (enables secure cross-site cookies), and set `FRONTEND_URL` to the deployed frontend origin.

## Known Limitations

- `PaymentRoutes` is not registered in `src/routes/index.ts`, so `/payments/*` returns 404. Add `{ path: "/payments", route: PaymentRoutes }` to `moduleRoutes`.
- bKash initiation is a mock: it returns a fake sandbox checkout URL and does not call the real bKash API.
- Socket.io is installed but not wired: `server.ts` uses `app.listen` and `src/sockets/` is empty. Clients should poll for status changes.
- No endpoint lists a mechanic's accepted jobs or fetches a single request. A `GET /requests/my-jobs` endpoint is needed for a mechanic job screen.
- Review module has a schema but no routes.
- `/auth/verify-email` returns tokens in the body but does not set cookies.
- OTP validation only enforces a minimum length of 2 although generated OTPs have 6 digits.
- The auth middleware currently logs the extracted token to the console; remove it before production.
- `src/modules/user` is a stub and not mounted.