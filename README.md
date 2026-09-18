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
# Prisma CLI reads .env; copy the same local database settings for Prisma commands.
copy .env.local .env
npx prisma migrate dev --name init
npm run dev
```

Next.js reads `.env.local`, while Prisma CLI reads `.env`. Keep both files locally with the same `DATABASE_URL` value. Replace the placeholder `DATABASE_URL` with a real PostgreSQL connection string before running the migration. In Git Bash, use `cp` instead of `copy`.

Open http://localhost:3000.

```bash
npm test                 # unit tests
npx prisma generate      # regenerate the database client
npm run build            # production build check
```

The admin area is available at http://localhost:3000/admin. In local development, the default credentials are `admin@bloom.coffee` / `bloomcoffee`. Before deploying, set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (at least 12 characters), and a random `AUTH_SECRET` (at least 32 characters) in the production environment. Production refuses authentication requests with missing or weak values; it never falls back to the demo credentials or development secret. Admin sessions use a signed, HTTP-only cookie and all `/admin/*` routes and admin API endpoints are protected.

Generate a secure auth secret with one of these commands:

```bash
openssl rand -base64 32
```

In PowerShell:

```powershell
$bytes = [byte[]]::new(32)
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToBase64String($bytes)
```

Copy the generated value into `AUTH_SECRET` in your deployment environment. Keep it private and do not commit it to Git.

## GitHub Actions and Vercel

`.github/workflows/test.yml` runs unit tests for pull requests targeting `dev` or `main`. Vercel handles deployments through its GitHub integration. Every branch other than `main` receives a Preview deployment; `main` is Production.

### Vercel setup

1. Import `ironvietman/bloom-coffee` into Vercel and select the repository root as the project root.
2. Keep the framework preset as **Next.js**. The default build command (`npm run build`) is correct.
3. In Vercel project **Settings → Environment Variables**, add these variables to both **Preview** and **Production**, using the appropriate values for each environment:
   - `DATABASE_URL`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `AUTH_SECRET`
4. Set the Vercel production branch to `main` under **Settings → Git**.
5. Before using a new production database, apply the committed Prisma migrations from a machine with that database configured:

   ```bash
   npx prisma migrate deploy
   ```

6. Push to any branch other than `main` for a Preview deployment, or merge the selected release branch to `main` for Production. Vercel will run the `vercel-build` script, which applies committed Prisma migrations before building the application.

Vercel creates a Preview URL for each non-`main` branch. For a stable URL such as `feature.example.com`, configure a Vercel branch domain. The `main` branch updates the Production URL.

See [STORIES.md](STORIES.md), [RUBRIC.md](RUBRIC.md), and [docs/TECHNICAL_PLAN.md](docs/TECHNICAL_PLAN.md) for the full exercise requirements and implementation plan.
