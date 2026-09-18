# Bloom Coffee

Minimal Next.js scaffold for the Bloom Coffee ordering exercise. The customer menu and cart are implemented with integer-cent pricing, and the Prisma schema covers admins, drinks, add-ons, and orders.

## Run locally

This project requires Node.js 20 or newer. When using WSL, install/use the Linux Node.js runtime inside WSL; the Windows Node installation is separate.

```bash
nvm install 20
nvm use 20
node --version   # should print v20.x or newer
```

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open http://localhost:3000.

```bash
npm test                 # unit tests
npx prisma generate      # regenerate the database client
npm run build            # production build check
```

The current scaffold uses sample menu data in the UI. PostgreSQL and Prisma are ready for the persistence and admin stories to be wired in next. No admin credentials exist yet in this initial scaffold.

## GitHub Actions and Vercel

`.github/workflows/test.yml` runs unit tests for pull requests targeting `dev` or `main`.

`.github/workflows/vercel.yml` deploys a Vercel preview whenever `dev` receives a commit and deploys production whenever `main` receives a commit. Configure one Vercel project and add these GitHub Actions secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`. Add `DATABASE_URL` to the matching Vercel environment when database-backed routes are enabled.

The `dev` workflow produces a preview URL. For a stable URL such as `dev.example.com`, configure a Vercel branch domain. The `main` workflow updates the project’s production URL.

See [STORIES.md](STORIES.md), [RUBRIC.md](RUBRIC.md), and [docs/TECHNICAL_PLAN.md](docs/TECHNICAL_PLAN.md) for the full exercise requirements and implementation plan.
