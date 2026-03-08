# Bavo Stock Backend

Production-ready warehouse stock backend in Node.js + Express + TypeScript + MongoDB, built in Bavo-style modular architecture.

## Tech Stack
- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- JWT (access + refresh)
- Joi validation
- bcryptjs password hashing
- Swagger + Postman

## Project Structure
```text
src/
  bootstrap/
  configs/
  middlewares/
  modules/
    auth/
    user/
    role/
    permission/
    warehouse/
    stock/
    stock-movement/
    dashboard/
    token/
    errors/
    validate/
    utils/
  routes/
  seeders/
  app.ts
  index.ts
  server.ts
```

## Setup
1. Install dependencies
```bash
npm install
```

2. Create env file
```bash
cp .env.example .env
```

3. Run seeds
```bash
npm run seed:all
```

4. Run development server
```bash
npm run dev
```

## Default Super Admin
- Email: `superadmin@example.com`
- Password: `Admin@123456`

Configurable via env:
- `SUPER_ADMIN_NAME`
- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run seed:permissions`
- `npm run seed:super-admin`
- `npm run seed:all`

## API Base URL
`/api/v1`

## Main Endpoints
- Auth: `/auth/*`
- Admin users: `/admin-users/*`
- Permissions: `/permissions`
- Warehouses: `/warehouses/*`
- Stocks: `/stocks/*`
- Stock movements: `/stock-movements`
- Dashboard: `/dashboard/summary`

## Docs
Swagger (if `ENABLE_DOCS=true`):
- `GET /api/v1/docs`

Postman files:
- `postman/Bavo-Stock.postman_collection.json`
- `postman/Bavo-Stock.local.postman_environment.json`
