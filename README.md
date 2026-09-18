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

The admin area is available at http://localhost:3000/admin. By default, use `admin@bloom.coffee` / `bloomcoffee`. Override these demo credentials in `.env.local` with `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and set a strong `AUTH_SECRET` before deploying. Admin sessions use a signed, HTTP-only cookie and all `/admin/*` routes are protected.

## GitHub Actions and Vercel

`.github/workflows/test.yml` runs unit tests for pull requests targeting `dev` or `main`. Vercel handles deployments through its GitHub integration. Add `DATABASE_URL` to the Vercel `Preview` and `Production` environments when database-backed routes are enabled.

### Vercel setup

1. Import `ironvietman/bloom-coffee` into Vercel and select the repository root as the project root.
2. Keep the framework preset as **Next.js**. The default build command (`npm run build`) is correct.
3. In Vercel project **Settings → Environment Variables**, add `DATABASE_URL` to **Preview** and **Production** with the connection string for the corresponding database.
4. Set the Vercel production branch to `main` under **Settings → Git**.
5. Push to `dev` for a preview deployment or `main` for production. Vercel will build and deploy automatically.

Vercel creates a preview URL for `dev`. For a stable URL such as `dev.example.com`, configure a Vercel branch domain. The `main` branch updates the production URL.

See [STORIES.md](STORIES.md), [RUBRIC.md](RUBRIC.md), and [docs/TECHNICAL_PLAN.md](docs/TECHNICAL_PLAN.md) for the full exercise requirements and implementation plan.
