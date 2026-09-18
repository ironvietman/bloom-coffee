# Bloom Coffee - Technical Plan

This document records the implementation decisions for the Bloom Coffee exercise. The goal is a small, maintainable application that satisfies all five stories while keeping the customer and admin flows easy to review.

## Current stack

- **Next.js App Router** for the customer and admin experiences.
- **TypeScript** for typed domain models and server/client boundaries.
- **Plain CSS** for the responsive UI; Tailwind is not required for this scope.
- **PostgreSQL** for persistent menu and order data.
- **Prisma** for the schema, migrations, and type-safe database queries.
- **Vitest** for unit and API route-handler tests.
- **HTTP-only signed cookies** for admin sessions.
- **Playwright** is planned after the UI has stabilized; it is intentionally not required during active UI iteration.

## Deployment model

The deployment workflow is:

```text
GitHub -> Vercel -> PostgreSQL provider
```

GitHub is connected to Vercel:

- Every branch other than `main` produces a Vercel Preview deployment.
- `main` is the Production branch and is updated after merging.

Preview and Production use separate PostgreSQL databases so preview orders and menu changes cannot affect production data. Each Vercel environment has its own values for:

```text
DATABASE_URL
ADMIN_EMAIL
ADMIN_PASSWORD
AUTH_SECRET
```

After a database is provisioned, apply the committed migrations against that database with:

```bash
npx prisma migrate deploy
```

The migration must be run once for the Preview database and once for the Production database. Vercel builds the application but does not automatically run database migrations.

## Decision rationale

### Why Vercel instead of GCP Cloud Run

Vercel was chosen because this is a Next.js application already hosted in GitHub and the review workflow benefits from automatic deployments and Preview URLs. Vercel provides native Next.js builds, automatic Preview deployments for every non-`main` branch, a clear Production deployment from `main`, HTTPS, logs, and environment-variable management with minimal configuration.

GCP Cloud Run would be reasonable for a larger or more infrastructure-controlled service, but it would require a container image, registry, service configuration, scaling and region decisions, database networking, and additional operational setup. That complexity would not improve the menu and ordering experience being evaluated here.

### Why separate Preview and Production databases

Preview deployments should be safe to test. Separate databases prevent test orders, menu edits, and migrations from changing production data. They also allow schema changes to be validated in Preview before being applied to Production.

### Why PostgreSQL and Prisma

The application needs persistent menu and order data, relational order items, and historical snapshots. PostgreSQL fits those relationships, while Prisma provides typed queries and committed migrations without requiring a large data-access layer.

### Why integer cents

Prices are stored as integer cents so totals do not depend on floating-point arithmetic. This makes calculations such as `$4.00 + $0.50 + $0.75` deterministic and easy to test.

### Why soft-delete menu records

Orders reference the drinks and add-ons available when the order was placed. Soft-deleting with `active: false` removes an item from the customer menu while preserving historical order information.

### Why recalculate totals on the server

The browser needs a responsive running total, but client data cannot be trusted for the final price. The order API reloads active menu records and calculates the persisted total from database prices, preventing stale or manipulated client prices from being stored.

### Why environment-configured admin credentials

The exercise only requires one admin and does not require sign-up, password reset, or multi-user administration. Environment-configured credentials keep the implementation small while production checks prevent missing or weak credentials and secrets. The existing `Admin` model leaves room for database-backed users later.

### Why plain CSS instead of Tailwind

The UI is small enough that a single stylesheet keeps the layout easy to inspect and avoids adding a styling dependency. The stylesheet includes responsive breakpoints for customer and admin screens.

### Why Vitest now and Playwright later

Business logic and route behavior are stable enough to test now, so Vitest covers totals, validation, authentication, authorization, and CRUD behavior. Playwright is intentionally deferred until the UI wording and layout settle, avoiding brittle browser tests during active UI iteration.

### Why client-side cart state

The cart is temporary customer interaction state, so keeping it in the client makes add-on editing, quantity changes, and running totals immediate without unnecessary server requests. The server remains authoritative when the order is submitted.

## Application areas

```text
/                         Customer menu, customization, cart, and confirmation

/admin/login              Admin login
/admin                    Protected admin dashboard, menu management, and recent orders

/api/orders               Public order submission endpoint
/api/admin/login          Admin login endpoint
/api/admin/logout         Admin logout endpoint
/api/admin/drinks         Protected drink list/create endpoint
/api/admin/drinks/[id]    Protected drink update/soft-delete endpoint
/api/admin/addons         Protected add-on list/create endpoint
/api/admin/addons/[id]    Protected add-on update/soft-delete endpoint
```

Every admin data page and admin data API endpoint is protected on the server; login and logout endpoints are the intentional exceptions. Hiding controls in the UI is not considered authorization.

## Data model

The Prisma schema contains:

- `Admin` - retained as the domain model for future database-backed admins.
- `Drink` - name, description, integer base price, and active status.
- `Addon` - name, integer price, and active status.
- `Order` - customer name, calculated total, and timestamp.
- `OrderItem` - drink snapshot, unit price, and quantity.
- `OrderItemAddon` - add-on snapshot and price.

Orders store snapshots of drink and add-on names and prices. This keeps historical orders correct if an admin later edits or removes a menu item.

## Money handling

All monetary values are stored and calculated as integer cents:

```text
Drink.basePriceCents = 400
Addon.priceCents = 50
Order.totalCents = 450
```

Admin forms display dollars and convert to cents before saving. The client displays calculated totals for immediate feedback, but the order API recalculates the final total from active database records. Client-provided prices and totals are never trusted.

## Authentication and authorization

There is no public sign-up or password-reset flow. Local development has documented demo credentials. Production requires explicitly configured values:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD` with at least 12 characters
- `AUTH_SECRET` with at least 32 characters

Production does not fall back to the local demo credentials or development secret when these values are missing or too short. A random secret can be generated with `openssl rand -base64 32` or the PowerShell command in the README.

The auth flow is:

1. The login endpoint validates the configured email and password.
2. Successful login creates a signed, HTTP-only, same-site session cookie.
3. Middleware redirects unauthenticated `/admin/*` page requests to `/admin/login`.
4. Admin API handlers independently validate the session before reading or mutating admin data.
5. Logout clears the session cookie.

The current exercise uses environment-configured credentials rather than password hashing or a database user-management flow. The `Admin` model remains available if multi-user administration is added later.

## Menu management

Admins can create, edit, and soft-delete drinks and add-ons. Deletes set `active` to `false` instead of removing rows, preserving relationships with historical orders. Customer menu queries only return active records, so deleted items no longer appear to customers.

Validation rejects blank names, missing drink descriptions, negative prices, fractional cent values, and other invalid form data. The API route tests cover authorization, validation, creation, updates, and soft-deletes.

## Customer ordering flow

The customer flow is intentionally public and does not require an account:

1. View active drinks and add-ons.
2. Select add-ons before adding a drink to the cart.
3. Add multiple drinks, including multiple lines for the same drink with different customizations.
4. Edit add-ons after a drink is already in the cart.
5. Change quantities or remove cart lines.
6. See line totals and the running order total update immediately.
7. Enter a pickup name and submit the order.

Cart state is client-side for responsiveness. The order endpoint validates the request, reloads active drinks/add-ons from the database, recalculates prices, persists the order, and returns a confirmation payload.

## Confirmation and order history

The immediate confirmation includes:

- A readable order ID derived from the persisted unique order ID.
- Customer name.
- Drinks, add-ons, and quantities.
- Total.

The customer can select **Order again**, which clears the cart and starts a fresh order. There is no public order lookup route. The admin dashboard also shows recent persisted orders, which is useful for review and pickup handling but is not required for customer authentication.

## Testing strategy

The current tests intentionally focus on stable business logic and server behavior while the UI is still changing:

- `src/lib/order.test.ts` tests line and order totals.
- `src/lib/order-request.test.ts` tests request validation and quantity/name boundaries.
- `src/lib/auth.test.ts` tests valid/invalid credentials, session signing, tamper rejection, and production configuration requirements.
- Admin route tests mock Prisma and test authorization, validation, create, update, and soft-delete behavior for drinks and add-ons.

The standard command is:

```bash
npm test
```

After the UI stabilizes, add a small Playwright smoke-test suite for the highest-value journeys: customer ordering and admin menu management. Playwright is deferred to avoid coupling tests to UI labels and layout during active design changes.

## Implementation status

The five required stories are implemented:

1. Admin login and protected routes.
2. Drink CRUD.
3. Add-on CRUD.
4. Responsive customer menu, customization, cart editing, and running totals.
5. Order submission, persisted order ID, confirmation, and ordering again.

Remaining release work is operational rather than a new story: finish UI polish, run `npm test` and `npm run build` locally, manually smoke-test a Preview deployment, configure production environment variables, migrate the Production database, and merge the selected release branch into `main` when ready.

## Out of scope

- Payment processing.
- Customer accounts.
- Customer order history across devices.
- Public order lookup.
- Password reset and public admin sign-up.
- Multi-user database-backed admin management.
- Production-scale GCP infrastructure.
