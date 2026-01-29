# Deploy Meal Planner to Railway

**Prefer a visual, step-by-step walkthrough?** See **[docs/RAILWAY-STEP-BY-STEP.md](./docs/RAILWAY-STEP-BY-STEP.md)** (includes diagrams).

Otherwise follow the steps below.

## Prerequisites

- Code pushed to a **GitHub** repository (Railway deploys from GitHub).
- A **Railway** account at [railway.app](https://railway.app).

---

## 1. Create a Railway project and deploy from GitHub

1. Go to [railway.app](https://railway.app) and log in.
2. Click **New Project**.
3. Choose **Deploy from GitHub repo**.
4. Select your meal-planner repository (and authorize Railway if needed).
5. Railway will detect the Next.js app and start a build. **Don’t deploy yet**—add the database and env vars first.

---

## 2. Add a PostgreSQL database

The app uses SQLite locally, but Railway’s filesystem is ephemeral, so **production must use PostgreSQL**.

1. In your Railway project, click **+ New**.
2. Choose **Database** → **PostgreSQL**.
3. Wait for Postgres to provision. Click the Postgres service, then the **Variables** tab.
4. Copy the `DATABASE_URL` value (or use **Connect** to link it to your app so the variable is set automatically).

---

## 3. Switch Prisma to PostgreSQL for production

You need to point Prisma at Postgres when deploying.

**Option A – Use Postgres everywhere (recommended)**  
Edit `prisma/schema.prisma` and change:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

to:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then for **local development** set `DATABASE_URL` in `.env` to a Postgres URL (e.g. same Railway Postgres, or a local Postgres / Docker / [Neon](https://neon.tech) free tier).

**Option B – Keep SQLite locally**  
Keep `provider = "sqlite"` in the repo and only change it to `postgresql` when you want to deploy (e.g. on a separate branch or right before pushing to `main`). Then run migrations on Railway (see step 5). For local dev you keep using SQLite.

---

## 4. Set environment variables

In your Railway project, select your **app service** (the one from GitHub), then open **Variables**.

Add:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Postgres connection string (often set automatically if you linked the Postgres service). |
| `ANTHROPIC_API_KEY` | Yes | Your Claude API key (recipe generation). |
| `UNSPLASH_ACCESS_KEY` | No | Unsplash API key for recipe images ([unsplash.com/developers](https://unsplash.com/developers)). |

Railway provides `PORT`; Next.js will use it automatically.

---

## 5. Run migrations on deploy (Release Command)

So the database schema is applied on each deploy:

1. Select your **app service**.
2. Go to **Settings**.
3. Find **Deploy** → **Release Command** (or “Custom start command” depending on UI).
4. Set **Release Command** to:

   ```bash
   npx prisma migrate deploy
   ```

   If Railway only has a “Start command”, use the default `npm start` and run migrations once manually from your machine:

   ```bash
   DATABASE_URL="your-railway-postgres-url" npx prisma migrate deploy
   ```

---

## 6. Deploy

1. Trigger a deploy (e.g. push to the branch Railway watches, or click **Deploy** in the dashboard).
2. After the build and release command finish, open the app from the **Settings** → **Networking** → **Generate domain** (or your custom domain).

---

## Summary checklist

- [ ] Repo connected to Railway and project created.
- [ ] PostgreSQL service added and `DATABASE_URL` available to the app.
- [ ] `prisma/schema.prisma` uses `provider = "postgresql"` for production.
- [ ] `ANTHROPIC_API_KEY` (and optionally `UNSPLASH_ACCESS_KEY`) set in Variables.
- [ ] Release command set to `npx prisma migrate deploy` (or migrations run once manually).
- [ ] Deploy triggered and public URL works.

If you hit build or runtime errors, check the **Deployments** and **Logs** tabs for your service in the Railway dashboard.
