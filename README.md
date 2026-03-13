# Bavo Stock Backend

Production-grade quick-commerce warehouse backend for multi-warehouse inventory, batching, reservations, transfer, purchase, GRN, billing, and stock ledger.

## Tech Stack
- Node.js + Express.js
- TypeScript
- MongoDB + Mongoose
- JWT (access + refresh)
- Joi validation
- bcryptjs password hashing

## Core Modules
- Auth, User, Role, Permission (RBAC + permission-based access)
- Warehouse, Warehouse Location (bin/rack/shelf)
- Supplier, Product
- Stock Summary
- Stock Batch (FEFO-ready)
- Stock Reservation
- Stock Movement Ledger
- Purchase Order
- Goods Receipt Note (GRN)
- Stock Transfer
- Sale Invoice (customer + in-house)
- Stock Adjustment
- Dashboard

## Setup
1. Install dependencies
```bash
npm install
```

2. Configure environment
```bash
cp .env.example .env
```

3. Seed base data
```bash
npm run seed:permissions
npm run seed:roles
npm run seed:super-admin
# or all at once
npm run seed:all
```

4. Start development server
```bash
npm run dev
```

## Main API Prefix
`/api/v1`

## Main Endpoint Groups
- `/auth`
- `/admin-users`
- `/roles`
- `/permissions`
- `/warehouses`
- `/warehouse-locations`
- `/suppliers`
- `/products`
- `/stocks`
- `/stock-batches`
- `/stock-reservations`
- `/stock-movements`
- `/purchase-orders`
- `/grn`
- `/stock-transfers`
- `/sale-invoices`
- `/stock-adjustments`
- `/dashboard/summary`

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run seed:permissions`
- `npm run seed:roles`
- `npm run seed:super-admin`
- `npm run seed:all`

## Notes
- Super admin is seeded from `.env` values.
- Movement ledger is append-only (no delete flow exposed).
- Stock updates are service-driven and movement-logged for transactional modules.
