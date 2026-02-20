# CLAUDE.md

This file provides guidance to AI assistants working on this codebase.

## Project Overview

A full-stack AI-powered meal planning application for families. Users manage family member profiles with dietary preferences, then generate personalized weekly meal plans using Claude AI. The app tracks ratings on past recipes and uses that history to inform future generations.

## Technology Stack

- **Framework:** Next.js 14.2 (App Router)
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS 3.4
- **ORM:** Prisma 5.22 with PostgreSQL
- **AI:** Anthropic SDK (`@anthropic-ai/sdk`) — Claude Sonnet 4 (`claude-sonnet-4-20250514`)
- **Image API:** Unsplash (optional; falls back to curated static URLs)
- **Deployment:** Railway platform

## Repository Structure

```
src/
├── app/                     # Next.js App Router
│   ├── api/                 # API route handlers
│   │   ├── family/          # CRUD for family members
│   │   ├── preferences/     # CRUD for member preferences
│   │   ├── recipes/         # Recipe retrieval and creation
│   │   ├── ratings/         # Recipe ratings per member
│   │   ├── meal-plans/      # Meal plan management
│   │   ├── generation/      # Async job start + status polling
│   │   ├── generate-recipes/        # Synchronous recipe gen
│   │   ├── generate-recipes-stream/ # Streaming recipe gen
│   │   ├── clear-history/   # Delete all meal plans
│   │   └── clear-recipes/   # Delete all recipes
│   ├── family/              # Family member pages
│   ├── history/             # Past meal plans
│   ├── plan/                # Meal plan generation UI
│   ├── recipes/             # Recipe browser + detail
│   ├── page.tsx             # Dashboard / home
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global CSS variables
├── components/              # Shared React components
└── lib/
    ├── db.ts                # Prisma singleton
    ├── claude.ts            # Anthropic client wrapper
    ├── generateMealPlan.ts  # Core async generation logic
    ├── prompts.ts           # Prompt building and response parsing
    ├── images.ts            # Food image URL resolution
    └── recalculateScores.ts # Recalculate recipe family-match scores

prisma/
├── schema.postgres.prisma   # Canonical schema (edit this one)
├── schema.prisma            # Copied from above at build time — do not edit directly
└── migrations/              # Prisma migration history

scripts/
├── copy-postgres-schema.js  # Copies canonical schema before build
└── ensure-postgres-schema.js

docs/
└── RAILWAY-STEP-BY-STEP.md  # Deployment guide
```

## Development Workflow

### Setup

```bash
npm install          # installs deps + runs postinstall (prisma generate)
cp .env.example .env # set DATABASE_URL, ANTHROPIC_API_KEY
npx prisma migrate dev
npm run dev          # starts on http://localhost:3001
```

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server on port **3001** |
| `npm run build` | Copy postgres schema → prisma generate → next build |
| `npm run start` | Production server |
| `npm run lint` | ESLint check |
| `npm run postinstall` | Auto-generates Prisma client after install |

### Schema changes

1. **Always edit** `prisma/schema.postgres.prisma` — never `prisma/schema.prisma` directly.
2. Run `npm run build` (or `node scripts/copy-postgres-schema.js && npx prisma migrate dev`) to apply.
3. Commit both the schema file and the generated migration in `prisma/migrations/`.

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `ANTHROPIC_API_KEY` | Yes | Authenticates Claude API calls |
| `UNSPLASH_ACCESS_KEY` | No | Dynamic food images; falls back to static URLs |

## Database Models

```
FamilyMember  ──< Preference      (dietary/taste preferences by category)
FamilyMember  ──< Rating
Recipe        ──< Rating
Recipe        ──< MealPlanRecipe  >── MealPlan
MealPlan      ──  GenerationJob   (1-to-1, tracks async progress)
```

### Key model notes

- **Preference.category** values: `like`, `dislike`, `allergy`, `diet`, `cuisine`, `favorite_dish`, `favorite_meat`, `favorite_veggie`, `willing_to_try`, `note`
- **Recipe.ingredients / instructions / tips / nutrition / familyMatch** — stored as JSON strings; parse before use.
- **MealPlanRecipe.dayOfWeek** — 0 = Sunday … 6 = Saturday.
- **GenerationJob.status** — `pending | running | completed | failed`
- **GenerationJob.totalSteps** — always 8 or 9; poll `step` vs `totalSteps` for progress.

## API Endpoints

### Family
| Method | Path | Description |
|---|---|---|
| GET | `/api/family` | All members (with preference counts) |
| GET | `/api/family?id={id}` | Single member with full preferences |
| POST | `/api/family` | Create member — body: `{ name }` |
| DELETE | `/api/family?id={id}` | Delete member (cascades preferences) |

### Preferences
| Method | Path | Description |
|---|---|---|
| GET | `/api/preferences?familyMemberId={id}` | Preferences for one member |
| POST | `/api/preferences` | Replace all preferences — body: `{ familyMemberId, preferences[] }` — triggers score recalculation |

### Recipes
| Method | Path | Description |
|---|---|---|
| GET | `/api/recipes` | All recipes |
| GET | `/api/recipes/[id]` | Single recipe |
| POST | `/api/recipes` | Create (used internally) |
| POST | `/api/recipes/[id]` | Update recipe |

### Ratings
| Method | Path | Description |
|---|---|---|
| POST | `/api/ratings` | Submit rating — body: `{ recipeId, familyMemberId, score, comment? }` |
| GET | `/api/ratings?recipeId={id}` | Ratings for one recipe |

### Meal Plans
| Method | Path | Description |
|---|---|---|
| POST | `/api/meal-plans` | Create — body: `{ recipeIds[] }` |
| GET | `/api/meal-plans` | All meal plans |
| GET | `/api/meal-plans?current=true` | Current week's plan |
| DELETE | `/api/meal-plans/[id]` | Delete plan |

### Generation (async)
| Method | Path | Description |
|---|---|---|
| POST | `/api/generation/start` | Start job — returns `{ jobId }` |
| GET | `/api/generation/job?jobId={id}` | Poll status / progress |

## AI / Claude Usage

- Client: `src/lib/claude.ts` exports a singleton `Anthropic` client.
- Model: `claude-sonnet-4-20250514` — do not change without testing.
- Prompt construction and response parsing live in `src/lib/prompts.ts`.
- Core generation logic (9 async steps) is in `src/lib/generateMealPlan.ts`.
- Prompt context includes: family preferences, past ratings (high/low), recently served recipes (for variety).
- Responses are parsed as structured JSON embedded in the Claude response; see `prompts.ts` for expected shape.

## Key Implementation Patterns

### Prisma singleton
`src/lib/db.ts` uses `globalThis` to avoid creating multiple Prisma clients during hot reloads in development.

### Async generation with polling
`POST /api/generation/start` persists a `GenerationJob` row and runs the generation in the background. The client polls `GET /api/generation/job?jobId=...` for progress updates rendered by `GenerationProgressBanner.tsx`.

### Image resolution
`src/lib/images.ts` tries Unsplash API first; if unavailable it hashes the recipe title to deterministically pick from a curated list of static Unsplash URLs grouped by food type. This ensures consistent images per recipe across renders.

### Family match scores
Each `Recipe.familyMatch` JSON object maps `familyMemberId → score`. Scores are recalculated whenever preferences change via `src/lib/recalculateScores.ts`.

### JSON fields in Prisma
`ingredients`, `instructions`, `tips`, `nutrition`, and `familyMatch` on `Recipe` are `String` columns storing serialized JSON. Always `JSON.parse()` before use and `JSON.stringify()` before saving.

## Conventions

- **Path alias:** `@/*` → `src/*` (configured in `tsconfig.json`).
- **TypeScript strict mode** is on — avoid `any`; use explicit types.
- **No test framework is configured.** When adding tests, prefer Vitest with React Testing Library (already aligned with the Next.js ecosystem).
- **ESLint** extends `next/core-web-vitals`. Run `npm run lint` before committing.
- The Next.js config intentionally ignores TypeScript and ESLint errors during `next build` to allow Railway deployments to succeed even with minor issues — fix errors locally rather than relying on this escape hatch.
- Component files use `.tsx`; pure utility/library files use `.ts`.
- API routes follow the App Router convention: `src/app/api/<route>/route.ts`.

## Deployment (Railway)

- `nixpacks.toml` and `railway.toml` configure the Railway build pipeline.
- Build order: copy postgres schema → `prisma generate` → `next build`.
- The canonical schema is `schema.postgres.prisma`; `schema.prisma` is overwritten at build time.
- Set `DATABASE_URL` and `ANTHROPIC_API_KEY` as Railway environment variables.
- See `docs/RAILWAY-STEP-BY-STEP.md` for full deployment walkthrough.
