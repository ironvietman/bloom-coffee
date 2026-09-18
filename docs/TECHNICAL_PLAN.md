# Bloom Coffee — Technical Plan

This document records the proposed implementation approach and the decisions made during planning. The goal is to satisfy all five stories in a small, understandable application suitable for the interview exercise.

## Recommended stack

- **Next.js with the App Router** for the customer and admin experiences in one application.
- **TypeScript** for typed domain models and safer server/client boundaries.
- **Tailwind CSS** for a responsive customer-facing UI.
- **PostgreSQL** for persistent menu and order data.
- **Prisma** for the database schema, migrations, and type-safe queries.
- **bcrypt** for hashing the seeded admin password.
- **HTTP-only signed cookie** for the admin session.
- **Vitest** for unit tests, especially price and order-total calculations.
- **Playwright** for a small number of critical end-to-end flows.

## Deployment

The preferred deployment is:

```text
GitHub → Vercel → PostgreSQL provider
```

Vercel is the simplest fit for this exercise because it provides Git-based deployments, preview deployments, HTTPS, and serverless support with minimal infrastructure configuration.

The database should be a serverless PostgreSQL provider such as Neon, connected through the Vercel Marketplace or directly with environment variables. The database region should be close to the Vercel function region.

GCP Cloud Run remains a valid alternative, but it would add Docker, Cloud Run, billing/project configuration, and more database setup. That infrastructure is not necessary for this exercise.

## Application areas

```text
/                         Customer menu and cart
/order/confirmation       Immediate order confirmation

/admin/login              Admin login
/admin                    Protected admin dashboard
/admin/drinks             Drink CRUD
/admin/addons             Add-on CRUD
/admin/orders             Optional protected order list
```

Every admin mutation must be authorized on the server. Hiding admin controls in the UI is not sufficient protection.

## Data model principles

The core entities are:

- Admin
- Drink
- Addon
- Order
- OrderItem
- OrderItemAddon

Order items should store snapshots of drink and add-on names and prices. This keeps historical orders accurate if an admin changes the menu later.

## Money handling decision

All monetary values will be stored and calculated as integer cents:

```text
Drink.basePriceCents = 400
Addon.priceCents = 50
Order.totalCents = 525
```

Forms may display dollars, but the server converts values to cents before saving. All arithmetic uses integers, and values are formatted as currency only when displayed. This avoids JavaScript floating-point rounding problems.

The server recalculates the final order total from current database prices. Client-provided prices and totals are never trusted.

## Authentication and authorization

There is no public sign-up flow. A seeded admin user will be provided through documented setup instructions or environment variables.

- Passwords are stored as hashes, never plaintext.
- Successful login creates a signed, HTTP-only session cookie.
- Unauthenticated admin page requests redirect to `/admin/login`.
- Unauthenticated admin mutations return an unauthorized response.
- Logout clears the session cookie.

## Customer orders and privacy

Orders will be persisted as records of submitted orders. This supports reliable submission and optionally allows admins to view an order list.

The customer receives a readable order number, such as `#1047`, in the immediate confirmation view. The order number is for reference and is not a public lookup credential.

We will not expose a public route that lets anyone retrieve an order by guessing a sequential order ID. Customer authentication, emailed receipts, SMS verification, and public confirmation links are outside the scope of this exercise.

## Confirmation and ordering again

The required confirmation experience is an immediate post-submit view containing:

- Order ID
- Customer name
- Drinks and add-ons
- Quantities
- Total

The customer can then choose **Order again** or **Back to menu**. A new order starts with a fresh cart. A public confirmation link or random access token is not needed for the required stories and will not be implemented unless the scope changes.

## Optional order list

An admin-only order list may be added if time allows. It can show order number, customer name, items, total, and timestamp. This is optional in the stories and should not take priority over the required customer flow, authentication, and CRUD functionality.

## Testing priorities

Tests should focus on the highest-value behavior:

- Base price plus add-on price calculations
- Quantity changes and item removal
- Server-side total calculation
- Invalid and valid admin login
- Admin route protection
- Drink and add-on CRUD
- Successful order submission and confirmation contents

## Implementation sequence

1. Create the Next.js application and responsive layout.
2. Add the Prisma schema, migrations, and seed data.
3. Implement the customer menu, customization flow, and cart.
4. Implement server-side total calculation and order submission.
5. Add admin authentication and protected routes.
6. Add drink and add-on CRUD.
7. Add the confirmation view and Order again flow.
8. Add focused automated tests.
9. Deploy to Vercel and document local setup, environment variables, admin credentials, and the live URL.

## Explicitly out of scope

- Payment processing
- Customer accounts
- Customer order history across devices
- Public order lookup
- Password reset and admin sign-up
- Production-scale GCP infrastructure

