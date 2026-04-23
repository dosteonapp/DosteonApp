# Staging Environment — Variable Reference

**Staging Render:** https://dosteonapp-1.onrender.com  
**Staging Vercel:** https://dosteon-app-7u3b.vercel.app  
**Staging Supabase project:** `uthliwmewwlfjlbskilw`

---

## Vercel — Preview environment (dosteon-app-7u3b)

Set these under **Settings → Environment Variables → Preview** in the Vercel project:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_ENV` | `staging` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://uthliwmewwlfjlbskilw.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `<staging anon key — Supabase → uthliwmewwlfjlbskilw → Settings → API>` |
| `BACKEND_URL` | `https://dosteonapp-1.onrender.com` |
| `NEXT_PUBLIC_API_URL` | `https://dosteonapp-1.onrender.com` |
| `NEXT_PUBLIC_POSTHOG_KEY` | *(copy from production — same key)* |

> `NEXT_PUBLIC_ENV=staging` is the critical one. It controls the environment banner,
> email redirect behaviour, and Prisma client env guards. Without it the frontend
> acts as development.

---

## Render — dosteonapp-1

Set these under **dosteonapp-1 → Environment** in the Render dashboard.  
Values marked *same as prod* can be copied directly from the production service.

| Key | Value |
|---|---|
| `APP_ENV` | `staging` |
| `PYTHON_VERSION` | `3.11.9` |
| `LOG_LEVEL` | `INFO` |
| `AUTH_REDIRECT_URL` | `https://dosteon-app-7u3b.vercel.app/auth/callback` |
| `BACKEND_CORS_ORIGINS` | `'["https://dosteon-app-7u3b.vercel.app"]'` |
| `DATABASE_URL` | `<staging pooler URL — Supabase → uthliwmewwlfjlbskilw → Settings → Database → Connection string → Transaction mode (port 6543)>` |
| `DIRECT_URL` | `<staging direct URL — same place, Session mode (port 5432)>` |
| `SUPABASE_URL` | `https://uthliwmewwlfjlbskilw.supabase.co` |
| `SUPABASE_ANON_KEY` | `<staging anon key — Supabase → uthliwmewwlfjlbskilw → Settings → API>` |
| `SUPABASE_SERVICE_ROLE_KEY` | `<staging service role key — same place>` |
| `RESEND_API_KEY` | `re_18teXkHH_CGmKC8gCxwsEfo9PxmCNyipE` *(same as prod)* |
| `RESEND_FROM_EMAIL` | `no-reply@mail.dosteon.com` *(same as prod)* |
| `FROM_EMAIL` | `no-reply@mail.dosteon.com` *(same as prod)* |
| `SMTP_PORT` | `587` *(same as prod)* |
| `SMTP_USER` | `resend` *(same as prod)* |
| `DEV_EMAIL_OVERRIDE` | `gatetejules1@gmail.com` |

> **`APP_ENV=staging`** — the production service has `ENV=production` (old key, ignored).
> Staging must use `APP_ENV` (the new key). This enables email redirect to
> `DEV_EMAIL_OVERRIDE`, the `[STAGING]` subject prefix, and staging-only guards.
>
> **`DATABASE_URL`** — use the **Transaction mode** pooler URL (port 6543, `?pgbouncer=true`).
> **`DIRECT_URL`** — use the **Session mode** direct URL (port 5432, no pgbouncer).
> Both come from Supabase → uthliwmewwlfjlbskilw → Settings → Database → Connection string.

---

## What to do after setting variables

1. Render → dosteonapp-1 → **Manual Deploy → Deploy latest commit**
2. Wait for deploy → hit `https://dosteonapp-1.onrender.com/health/ready`
3. Should return `{"status":"ok"}` — if still failing, check the `detail` field
4. Open `https://dosteon-app-7u3b.vercel.app` → sign up → email arrives at `gatetejules1@gmail.com`

---

# Multi-Environment Architecture: Development → Staging → Production

**Stack:** Next.js/React (Vercel) · FastAPI + Prisma (Render) · Supabase (PostgreSQL) · dosteon.com  
**Date:** April 2026  
**Status:** Production is live. Staging is being introduced for the first time.

---

## What This Document Covers

Three fully isolated environments, zero shared state between them:

| Environment | Frontend | Backend API | Database |
|---|---|---|---|
| **Production** | dosteon.com | api.dosteon.com | Supabase: `dosteon-prod` |
| **Staging** | staging.dosteon.com | staging-api.dosteon.com | Supabase: `dosteon-staging` |
| **Development** | localhost:3000 | localhost:8000 | Supabase: `dosteon-dev` |

**Golden rule:** A misconfigured `DATABASE_URL` is the only way staging touches production. This guide makes that impossible to do silently.

---

## Part 1 — Database Setup (Supabase)

### Step 1.1 — Create the Staging Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Name it exactly: `dosteon-staging`
4. Choose the **same region** as your production project
5. Set a strong database password — save it in your password manager immediately
6. Wait for provisioning (~2 minutes)

Collect these from **Settings → API** in the staging project:
```
STAGING_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
STAGING_SUPABASE_ANON_KEY=eyJ...
STAGING_SUPABASE_SERVICE_ROLE_KEY=eyJ...
STAGING_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
STAGING_DIRECT_URL=postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
```

> `DIRECT_URL` is required by Prisma for migrations (bypasses the connection pooler).

### Step 1.2 — Replicate the Production Schema to Staging

This copies structure only — zero production rows will transfer.

```bash
# 1. Export schema-only from production (run on your local machine)
pg_dump \
  --schema-only \
  --no-owner \
  --no-acl \
  -d "$PROD_DATABASE_URL" \
  -f schema_dump.sql

# 2. Apply to staging
psql "$STAGING_DATABASE_URL" -f schema_dump.sql

# 3. Verify — should show all tables with 0 rows
psql "$STAGING_DATABASE_URL" -c "\dt"
psql "$STAGING_DATABASE_URL" -c "SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public';"
```

### Step 1.3 — Seed Test Data

Create `backend/scripts/seed_staging.py`:

```python
# backend/scripts/seed_staging.py
# Run ONLY against staging. Never against production.
# Usage: python backend/scripts/seed_staging.py

import asyncio
import os
from prisma import Prisma

async def main():
    env = os.environ.get("APP_ENV", "")
    if env == "production":
        raise RuntimeError("REFUSED: seed_staging.py cannot run in production.")

    db = Prisma()
    await db.connect()

    # Create a test organization
    org = await db.organization.create(data={
        "name": "Staging Test Restaurant",
        "type": "restaurant",
        "city": "Nairobi",
    })

    # Create a test brand
    brand = await db.brand.create(data={
        "organization_id": org.id,
        "name": "Test Brand",
        "is_active": True,
    })

    print(f"Seeded org: {org.id}")
    print(f"Seeded brand: {brand.id}")
    print("Seed complete. Use Supabase Auth to create a test user manually.")

    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
```

Run it:
```bash
APP_ENV=staging DATABASE_URL="$STAGING_DATABASE_URL" DIRECT_URL="$STAGING_DIRECT_URL" \
  python backend/scripts/seed_staging.py
```

### Step 1.4 — Migration Strategy

**The rule:** Every migration runs `dev → staging → production`. Never directly to production.

Your project already uses idempotent SQL scripts (e.g. `backend/scripts/migrate_*.py`). Keep that pattern:

```
backend/
  scripts/
    migrations/
      applied/
        001_initial_schema.sql
        002_add_brands.sql
      pending/
        003_add_consumption_reason.sql
    migrate_consumption_reason.py    ← the runner script
```

**Runner script pattern** (already established in this project):
```python
# backend/scripts/migrate_consumption_reason.py
import asyncio, os, asyncpg
from dotenv import load_dotenv

load_dotenv()

SQL = """
DO $$ BEGIN
  CREATE TYPE "ConsumptionReason" AS ENUM ('CUSTOMER_SERVICE', 'STAFF_MEAL', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE inventory_events
  ADD COLUMN IF NOT EXISTS consumption_reason "ConsumptionReason";
"""

async def main():
    url = os.environ["DIRECT_URL"]
    conn = await asyncpg.connect(url)
    try:
        await conn.execute(SQL)
        print("Migration complete.")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(main())
```

**Apply across environments:**
```bash
# Step 1: staging
DIRECT_URL="$STAGING_DIRECT_URL" python backend/scripts/migrate_consumption_reason.py

# Step 2: test on staging thoroughly

# Step 3: production (only after staging confirmed)
DIRECT_URL="$PROD_DIRECT_URL" python backend/scripts/migrate_consumption_reason.py

# Step 4: regenerate Prisma client
cd backend && prisma generate
```

**Always write migrations idempotent:**
```sql
-- Good — safe to run twice
ALTER TABLE inventory_events ADD COLUMN IF NOT EXISTS waste_reason TEXT;

-- Bad — crashes if run twice
ALTER TABLE inventory_events ADD COLUMN waste_reason TEXT;
```

---

## Part 2 — Backend (FastAPI)

### Step 2.1 — Configuration Structure with pydantic-settings

FastAPI has no built-in settings system. The standard approach is `pydantic-settings`, which reads environment variables into a typed `Settings` class.

**Install if not already present:**
```bash
pip install pydantic-settings
```

**File structure:**
```
backend/
  app/
    core/
      config.py        ← Settings class (replaces all hardcoded config)
      security.py      ← existing
    main.py            ← startup validation added here
  .env.local           ← git ignored
  .env.staging.example ← committed (no real values)
  .env.production.example ← committed (no real values)
```

**`backend/app/core/config.py`:**
```python
# backend/app/core/config.py
import os
from pydantic_settings import BaseSettings
from pydantic import Field, model_validator
from typing import Literal


class Settings(BaseSettings):
    # ── Identity ──────────────────────────────────────────────────────
    APP_ENV: Literal["development", "staging", "production"] = "development"

    # ── Database (Prisma uses these directly) ─────────────────────────
    DATABASE_URL: str = Field(...)
    DIRECT_URL: str = Field(...)

    # ── Supabase ──────────────────────────────────────────────────────
    SUPABASE_URL: str = Field(...)
    SUPABASE_SERVICE_ROLE_KEY: str = Field(...)
    SUPABASE_JWT_SECRET: str = Field(...)

    # ── Security ──────────────────────────────────────────────────────
    SECRET_KEY: str = Field(...)
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]

    # ── Feature flags ─────────────────────────────────────────────────
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    # ── Derived helpers (not from env) ────────────────────────────────
    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def is_staging(self) -> bool:
        return self.APP_ENV == "staging"

    @property
    def is_development(self) -> bool:
        return self.APP_ENV == "development"

    # ── Safety guard: crash loudly if environments are crossed ────────
    @model_validator(mode="after")
    def validate_env_db_consistency(self) -> "Settings":
        db = self.DATABASE_URL.lower()
        env = self.APP_ENV

        # Detect Supabase project ref from URL (the subdomain before .supabase.co)
        # Production refs and staging refs should differ — if they match, something's wrong
        if env == "production" and "staging" in db:
            raise ValueError(
                "CRITICAL: APP_ENV=production but DATABASE_URL contains 'staging'. "
                "You are pointing production at the staging database. Fix DATABASE_URL."
            )
        if env == "staging" and self._looks_like_prod_db(db):
            raise ValueError(
                "CRITICAL: APP_ENV=staging but DATABASE_URL looks like production. "
                "You are pointing staging at the production database. Fix DATABASE_URL."
            )
        return self

    def _looks_like_prod_db(self, db_url: str) -> bool:
        # Add your production Supabase project ref here once you know it
        # e.g., return "abcdefghijklmnop" in db_url  (your prod project ref)
        return False  # Update this with your actual prod ref

    class Config:
        env_file = ".env.local"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Single instance — import this everywhere
settings = Settings()
```

**How to use it throughout the codebase:**
```python
# Any file in the backend
from app.core.config import settings

# Use instead of os.environ.get(...)
if settings.is_production:
    # production-only logic
    pass

print(settings.APP_ENV)        # "staging"
print(settings.SUPABASE_URL)   # "https://xxxx.supabase.co"
```

### Step 2.2 — Environment Variable Files

**`.env.local`** (your machine — git ignored):
```bash
# backend/.env.local
APP_ENV=development
DEBUG=true
LOG_LEVEL=DEBUG

DATABASE_URL=postgresql://postgres:password@db.[DEV_REF].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:password@db.[DEV_REF].supabase.co:5432/postgres

SUPABASE_URL=https://[DEV_REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...dev_service_key...
SUPABASE_JWT_SECRET=your-dev-jwt-secret

SECRET_KEY=dev-secret-key-not-for-production-use
ALLOWED_ORIGINS=["http://localhost:3000"]
```

**`.env.staging.example`** (committed — no real values, documents what's needed):
```bash
# backend/.env.staging.example
# Copy this to .env.staging and fill in values
# Real values live in Render dashboard, NOT in this file

APP_ENV=staging
DEBUG=false
LOG_LEVEL=INFO

DATABASE_URL=                    # postgresql://postgres:[STAGING_PW]@db.[STAGING_REF].supabase.co:5432/postgres
DIRECT_URL=                      # same as DATABASE_URL for Supabase

SUPABASE_URL=                    # https://[STAGING_REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=       # staging service role key (NOT production key)
SUPABASE_JWT_SECRET=             # staging JWT secret (Settings → API → JWT Secret)

SECRET_KEY=                      # generate: python -c "import secrets; print(secrets.token_urlsafe(50))"
ALLOWED_ORIGINS=["https://staging.dosteon.com"]
```

**`.env.production.example`** (committed — no real values):
```bash
# backend/.env.production.example
APP_ENV=production
DEBUG=false
LOG_LEVEL=WARNING

DATABASE_URL=                    # postgresql://postgres:[PROD_PW]@db.[PROD_REF].supabase.co:5432/postgres
DIRECT_URL=                      # same

SUPABASE_URL=                    # https://[PROD_REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=       # production service role key
SUPABASE_JWT_SECRET=             # production JWT secret

SECRET_KEY=                      # unique — different from staging
ALLOWED_ORIGINS=["https://dosteon.com","https://www.dosteon.com"]
```

**`.gitignore`** — ensure secrets never reach git:
```
.env
.env.local
.env.staging
.env.production
*.env
!*.env.example
```

### Step 2.3 — Wire Settings into main.py

```python
# backend/app/main.py (additions to your existing file)
from app.core.config import settings
import logging

# Configure logging level from settings
logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO))
logger = logging.getLogger(__name__)

# Log which environment is running — visible in Render deploy logs
logger.info(f"Starting Dosteon API | env={settings.APP_ENV} | debug={settings.DEBUG}")

app = FastAPI(
    title="Dosteon API",
    # Disable docs in production — no need to expose endpoint list publicly
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    openapi_url="/openapi.json" if not settings.is_production else None,
)

# CORS — pull from settings, never hardcode
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Step 2.4 — Rate Limiting Per Environment

You already use `slowapi`. Tighten limits for production, relax for development:

```python
# backend/app/core/config.py — add to Settings class

# Rate limits (requests per minute)
RATE_LIMIT_DEFAULT: str = "60/minute"
RATE_LIMIT_AUTH: str = "10/minute"
RATE_LIMIT_MUTATIONS: str = "120/minute"
```

```python
# backend/.env.local — override for dev (no throttling friction)
RATE_LIMIT_DEFAULT=1000/minute
RATE_LIMIT_AUTH=1000/minute
RATE_LIMIT_MUTATIONS=1000/minute
```

```python
# In your endpoint files — use settings instead of hardcoded strings
from app.core.config import settings

@router.post("/sales/log", status_code=201)
@limiter.limit(settings.RATE_LIMIT_MUTATIONS)
async def log_sale(...):
    ...
```

### Step 2.5 — Logging Differences Per Environment

```python
# backend/app/core/logging_config.py
import logging
import sys
from app.core.config import settings


def configure_logging():
    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    if settings.is_production:
        # Production: JSON structured logs — readable by log aggregators
        import json

        class JsonFormatter(logging.Formatter):
            def format(self, record):
                return json.dumps({
                    "level": record.levelname,
                    "message": record.getMessage(),
                    "logger": record.name,
                    "time": self.formatTime(record),
                })

        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JsonFormatter())

    elif settings.is_staging:
        # Staging: prefixed plain text — easy to spot in Render logs
        formatter = logging.Formatter("[STAGING] %(levelname)s %(name)s: %(message)s")
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(formatter)

    else:
        # Development: readable colored output
        formatter = logging.Formatter(
            "%(asctime)s \033[36m%(name)s\033[0m %(levelname)s: %(message)s",
            datefmt="%H:%M:%S"
        )
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(formatter)

    logging.root.setLevel(level)
    logging.root.handlers = [handler]
```

Call it at the top of `main.py`:
```python
from app.core.logging_config import configure_logging
configure_logging()
```

### Step 2.6 — Guard Notifications in Staging

Any place you send real emails or push notifications:

```python
# backend/app/utils/notifications.py
from app.core.config import settings


def get_recipient(real_email: str) -> str:
    """In staging, redirect all emails to the test inbox."""
    if settings.is_staging:
        return "staging-test@dosteon.com"
    return real_email


def get_email_subject_prefix() -> str:
    if settings.is_staging:
        return "[STAGING] "
    if settings.is_development:
        return "[DEV] "
    return ""


async def send_email(to: str, subject: str, body: str):
    actual_to = get_recipient(to)
    actual_subject = get_email_subject_prefix() + subject

    if settings.is_development:
        # Just print in dev — no actual email sent
        print(f"[EMAIL] To: {actual_to} | Subject: {actual_subject}\n{body}")
        return

    # ... your actual email sending logic here
```

### Step 2.7 — Deploy Staging Backend on Render

**Add to your existing `render.yaml`:**

```yaml
# render.yaml — add this service alongside your existing production service

- type: web
  name: dosteon-staging-api
  env: python
  region: oregon              # match your production region
  branch: develop             # auto-deploys when develop branch is pushed
  buildCommand: |
    cd backend
    pip install -r requirements.txt
    prisma generate
  startCommand: cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2
  envVars:
    - key: APP_ENV
      value: staging
    - key: DATABASE_URL
      sync: false             # set manually in Render dashboard
    - key: DIRECT_URL
      sync: false
    - key: SUPABASE_URL
      sync: false
    - key: SUPABASE_SERVICE_ROLE_KEY
      sync: false
    - key: SUPABASE_JWT_SECRET
      sync: false
    - key: SECRET_KEY
      sync: false
    - key: ALLOWED_ORIGINS
      value: '["https://staging.dosteon.com"]'
    - key: LOG_LEVEL
      value: INFO
  domains:
    - staging-api.dosteon.com
```

**Set the env vars in Render dashboard** (never in the yaml for secrets):
1. Render dashboard → `dosteon-staging-api` → **Environment**
2. Add each variable from `.env.staging.example` with real values

**Verify the deploy:**
```bash
curl https://staging-api.dosteon.com/api/v1/health
# Expected: {"status": "alive"}
```

---

## Part 3 — Frontend (Next.js + Vercel)

### Step 3.1 — Environment Variable Files

```
frontend/
  .env.local              ← your machine (git ignored)
  .env.example            ← template committed to git
```

**`frontend/.env.example`** (committed):
```bash
# frontend/.env.example
# Copy to .env.local for development. Real values are set in Vercel dashboard.

NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_ENV=
```

**`frontend/.env.local`** (your machine):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://[DEV_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...dev_anon_key...
NEXT_PUBLIC_ENV=development
```

### Step 3.2 — Single Config Module (Never Hardcode URLs)

```typescript
// frontend/lib/config.ts
const required = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const;

// Validate at module load time — build fails if any are missing
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Copy .env.example to .env.local and fill in the values.`
    );
  }
}

export const config = {
  apiUrl:        process.env.NEXT_PUBLIC_API_URL!,
  supabaseUrl:   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey:   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  env:           (process.env.NEXT_PUBLIC_ENV ?? 'development') as 'development' | 'staging' | 'production',
  isProduction:  process.env.NEXT_PUBLIC_ENV === 'production',
  isStaging:     process.env.NEXT_PUBLIC_ENV === 'staging',
  isDevelopment: process.env.NEXT_PUBLIC_ENV === 'development',
} as const;
```

```typescript
// frontend/lib/axios.ts — use config, never a hardcoded string
import { config } from './config';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: `${config.apiUrl}/api/v1`,
  // ...rest of your existing config
});
```

### Step 3.3 — Environment Banner Component

Visible amber bar on staging so no one mistakes it for production:

```typescript
// frontend/components/EnvironmentBanner.tsx
import { config } from '@/lib/config';

export function EnvironmentBanner() {
  if (config.isProduction) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 99999,
        background: config.isStaging ? '#f59e0b' : '#3b82f6',
        color: 'white',
        textAlign: 'center',
        padding: '3px 0',
        fontSize: '11px',
        fontWeight: 'bold',
        letterSpacing: '0.05em',
        fontFamily: 'monospace',
      }}
    >
      {config.env.toUpperCase()} — NOT PRODUCTION
      {config.isStaging && ' · staging.dosteon.com'}
    </div>
  );
}
```

Add to your root layout:
```tsx
// frontend/app/layout.tsx
import { EnvironmentBanner } from '@/components/EnvironmentBanner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <EnvironmentBanner />
        {children}
      </body>
    </html>
  );
}
```

### Step 3.4 — Configure Vercel

**Recommended: Separate Vercel project for staging** (cleanest isolation):

1. Vercel dashboard → **Add New Project** → import same GitHub repo
2. Name: `dosteon-staging`
3. **Settings → Git → Production Branch:** set to `develop`
4. **Settings → Environment Variables** — add for Production environment:
   ```
   NEXT_PUBLIC_API_URL           = https://staging-api.dosteon.com
   NEXT_PUBLIC_SUPABASE_URL      = https://[STAGING_REF].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [staging anon key — from staging Supabase project]
   NEXT_PUBLIC_ENV               = staging
   ```
5. **Settings → Domains** → add `staging.dosteon.com`

**Verify production Vercel project has these set for Production only:**
```
NEXT_PUBLIC_API_URL           = https://api.dosteon.com
NEXT_PUBLIC_SUPABASE_URL      = https://[PROD_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [production anon key]
NEXT_PUBLIC_ENV               = production
```

### Step 3.5 — DNS Setup

Add to your DNS provider (Cloudflare, Namecheap, etc.):

```
Type   Name           Value                                    TTL
CNAME  staging        cname.vercel-dns.com                    Auto
CNAME  staging-api    dosteon-staging-api.onrender.com        Auto
```

Verify existing production records:
```
Type   Name    Value
CNAME  api     dosteon-api.onrender.com     (or whatever your prod render service is)
A/CNAME  @     76.76.21.21                  (Vercel)
```

---

## Part 4 — Environment Variables Master Reference

### Naming Convention

```
NEXT_PUBLIC_*    → Frontend (exposed to browser — never put secrets here)
APP_ENV          → Which backend config profile loads
DATABASE_*       → Database connection
SUPABASE_*       → Supabase-specific
SECRET_*         → Secrets (never NEXT_PUBLIC_)
```

### Complete Variable Inventory

| Variable | Development | Staging | Production |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | `https://staging-api.dosteon.com` | `https://api.dosteon.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | dev project URL | staging project URL | prod project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | dev anon key | staging anon key | prod anon key |
| `NEXT_PUBLIC_ENV` | `development` | `staging` | `production` |
| `APP_ENV` | `development` | `staging` | `production` |
| `DATABASE_URL` | dev DB URL | staging DB URL | prod DB URL |
| `DIRECT_URL` | dev DB URL | staging DB URL | prod DB URL |
| `SUPABASE_URL` | dev Supabase URL | staging Supabase URL | prod Supabase URL |
| `SUPABASE_SERVICE_ROLE_KEY` | dev service key | staging service key | prod service key |
| `SUPABASE_JWT_SECRET` | dev JWT secret | staging JWT secret | prod JWT secret |
| `SECRET_KEY` | any string | unique 50-char token | unique 50-char token |
| `ALLOWED_ORIGINS` | `["http://localhost:3000"]` | `["https://staging.dosteon.com"]` | `["https://dosteon.com"]` |

**Generate a new secret key:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

---

## Part 5 — Git & Deployment Workflow

### Branch Strategy

```
main              → production  (dosteon.com + api.dosteon.com)
develop           → staging     (staging.dosteon.com + staging-api.dosteon.com)
feature/[name]    → Vercel preview URL only, no backend deploy
fix/[name]        → Vercel preview URL only
hotfix/[name]     → can go directly to main in emergencies
```

### Branch Protection Rules

GitHub → Settings → Branches:

**`main` (production):**
- Require pull request before merging ✓
- Require 1 approval ✓
- Require status checks: `build`, `typecheck` ✓
- Block force pushes ✓
- No direct commits ✓

**`develop` (staging):**
- Require pull request before merging ✓
- Require status checks: `build` ✓
- Allow direct push for hotfixes only

### Daily Development Flow

```bash
# 1. Start from develop
git checkout develop && git pull origin develop
git checkout -b feature/inventory-stock-usage

# 2. Develop locally against dev environment
# All your .env.local points at dev DB + dev Supabase
# Run: cd backend && uvicorn app.main:app --reload
# Run: cd frontend && npm run dev

# 3. Push and open PR into develop
git push origin feature/inventory-stock-usage
# → Open PR: feature/inventory-stock-usage → develop
# → Vercel auto-creates a preview URL for the frontend
# → Test on the preview URL (uses YOUR local backend or dev env)

# 4. Merge into develop
# → Render auto-deploys staging-api.dosteon.com from develop branch
# → Vercel auto-deploys staging.dosteon.com from develop branch
# → Test the full flow end-to-end on staging

# 5. Run migrations on staging (if any schema changes)
DIRECT_URL="$STAGING_DIRECT_URL" python backend/scripts/migrate_new_feature.py
cd backend && prisma generate

# 6. Sign off on staging → open PR: develop → main
# → Requires review + approval
# → Merge triggers production deploy

# 7. Run migrations on production
DIRECT_URL="$PROD_DIRECT_URL" python backend/scripts/migrate_new_feature.py
```

### Deployment Trigger Map

| Push/merge to | Frontend | Backend |
|---|---|---|
| `feature/*` | Vercel preview URL | None |
| `develop` | staging.dosteon.com | staging-api.dosteon.com |
| `main` | dosteon.com | api.dosteon.com |

---

## Part 6 — Safety & Best Practices

### 6.1 — The Five Rules

1. **Never set `DATABASE_URL` to production value on a staging server.** Use the env var validation in `config.py`.
2. **Never commit `.env`, `.env.local`, `.env.staging`, `.env.production`.** Only `.example` files go to git.
3. **Always run migrations on staging before production.** If it breaks staging, it would have broken production.
4. **Staging Supabase service role key ≠ production service role key.** They are separate keys from separate projects.
5. **`prisma generate` must run after every schema change.** Build commands in Render already do this.

### 6.2 — Prisma Schema Changes Are the Riskiest Operation

When you add/modify models in `schema.prisma`:

```bash
# Safe sequence
# 1. Apply migration to staging DB
DIRECT_URL="$STAGING_DIRECT_URL" python backend/scripts/migrate_xxx.py

# 2. Regenerate Prisma client against staging
cd backend && prisma generate

# 3. Deploy to staging and run your tests

# 4. Apply to production DB
DIRECT_URL="$PROD_DIRECT_URL" python backend/scripts/migrate_xxx.py

# 5. Production deploy (Render runs prisma generate in build command automatically)
# Just merge to main — Render handles the rest
```

### 6.3 — Never Expose `/docs` in Production

Already handled in `main.py` config above. Verify with:
```bash
curl https://api.dosteon.com/docs
# Expected: 404

curl https://staging-api.dosteon.com/docs
# Expected: 200 (Swagger UI, for internal testing)
```

### 6.4 — Health Check Endpoint

Ensure your health endpoint returns environment info (staging only):

```python
# backend/app/api/v1/router.py
from app.core.config import settings

@api_router.get("/health/live", tags=["system"])
async def liveness():
    return {
        "status": "alive",
        # Only expose env name on non-production — don't tell attackers what's prod
        **({"env": settings.APP_ENV} if not settings.is_production else {}),
    }
```

---

## Part 7 — Rollback Plan

### 7.1 — Frontend Rollback (Vercel)

```
Vercel Dashboard
→ Your production project
→ Deployments tab
→ Find last known-good deployment
→ "..." → "Promote to Production"
```
Takes ~30 seconds. Zero downtime.

Via CLI:
```bash
npx vercel rollback [deployment-url]
```

### 7.2 — Backend Rollback (Render)

```
Render Dashboard
→ dosteon-api (production service)
→ Events tab
→ Find last successful deploy
→ "Rollback to this deploy"
```

Or via git (creates a proper audit trail):
```bash
# Find the bad commit
git log --oneline main

# Revert it (creates a new commit — safe, doesn't rewrite history)
git revert [bad-commit-hash]
git push origin main
# Render auto-deploys the revert
```

### 7.3 — Database Rollback

**Your primary protection is: run migrations on staging first.** But if a bad migration reaches production:

```bash
# IMMEDIATELY — take a manual Supabase backup before touching anything
# Supabase Dashboard → Project → Database → Backups → Create new backup

# Write a reverse migration (add to backend/scripts/)
cat > backend/scripts/rollback_003.py << 'EOF'
import asyncio, os, asyncpg

SQL = """
ALTER TABLE inventory_events DROP COLUMN IF EXISTS consumption_reason;
ALTER TABLE inventory_events DROP COLUMN IF EXISTS waste_reason;
-- Note: do NOT drop enum types if rows already reference them
"""

async def main():
    conn = await asyncpg.connect(os.environ["DIRECT_URL"])
    await conn.execute(SQL)
    print("Rollback complete.")
    await conn.close()

asyncio.run(main())
EOF

# Apply rollback to production
DIRECT_URL="$PROD_DIRECT_URL" python backend/scripts/rollback_003.py

# Rollback backend code to matching version (see 7.2)
# Database schema and Python code MUST match
```

**Point-in-Time Recovery (Supabase Pro plan):**
```
Supabase Dashboard → Project → Database → Backups
→ Select timestamp before bad migration
→ Restore to new project
→ Update DATABASE_URL and DIRECT_URL to new project
→ Redeploy backend
```

**Break-glass runbook (catastrophic failure):**
```bash
# 1. Enable maintenance mode
# In Vercel: set NEXT_PUBLIC_MAINTENANCE=true → redeploy
# Your app should check this and show a maintenance page

# 2. Restore DB from backup (Supabase dashboard)

# 3. Rollback backend code to commit matching the restored DB schema

# 4. Disable maintenance mode
# In Vercel: remove NEXT_PUBLIC_MAINTENANCE → redeploy

# 5. Verify on staging first if possible
# 6. Write a post-mortem documenting what happened
```

---

## Checklist — Follow This Exactly, In Order

```
DATABASE
[ ] Create dosteon-staging Supabase project (same region as prod)
[ ] Save staging DB password to password manager
[ ] Run pg_dump schema export from production → apply to staging
[ ] Run seed_staging.py to create test org + brand
[ ] Confirm: staging DB has tables but 0 production rows
[ ] Confirm: staging Supabase anon key ≠ production anon key

BACKEND
[ ] pip install pydantic-settings (if not already installed)
[ ] Create backend/app/core/config.py with Settings class
[ ] Update backend/app/main.py to use settings (CORS, docs_url, logging)
[ ] Create backend/.env.local with dev values
[ ] Create backend/.env.staging.example (no real values)
[ ] Create backend/.env.production.example (no real values)
[ ] Add .env*, !*.env.example to .gitignore
[ ] Update render.yaml to add dosteon-staging-api service
[ ] Create develop branch: git checkout -b develop && git push origin develop
[ ] Set all staging env vars in Render dashboard for new service
[ ] Confirm build command includes: prisma generate
[ ] Deploy: git push origin develop → watch Render build log
[ ] Test: curl https://staging-api.dosteon.com/api/v1/health/live
[ ] Test: curl https://staging-api.dosteon.com/docs (should return 200)
[ ] Test: curl https://api.dosteon.com/docs (should return 404 — prod)

FRONTEND
[ ] Create frontend/lib/config.ts with validation
[ ] Replace all hardcoded API URLs with config.apiUrl
[ ] Add EnvironmentBanner component to root layout
[ ] Create second Vercel project: dosteon-staging
[ ] Set production branch → develop in that project
[ ] Set staging env vars in Vercel dashboard
[ ] Add custom domain staging.dosteon.com
[ ] Verify: https://staging.dosteon.com loads with amber banner

DNS
[ ] Add CNAME: staging → cname.vercel-dns.com
[ ] Add CNAME: staging-api → [your-staging-render-service].onrender.com
[ ] Wait for SSL certificates (~5-10 min)
[ ] Verify: https://staging.dosteon.com loads
[ ] Verify: https://staging-api.dosteon.com/api/v1/health/live → {"status":"alive","env":"staging"}

GIT
[ ] Set branch protection on main (require PR + review + CI)
[ ] Set branch protection on develop (require PR + CI)
[ ] Confirm Render auto-deploys staging on push to develop
[ ] Confirm Render auto-deploys production on push to main

VALIDATION (most important step)
[ ] Sign up with test@staging.dosteon.com on staging.dosteon.com
[ ] Confirm new row appears in STAGING Supabase, NOT production
[ ] Open production Supabase — confirm zero new rows from your test
[ ] Confirm amber banner visible on staging, no banner on production
[ ] Confirm staging API /docs is accessible
[ ] Confirm production API /docs returns 404
```

---

## What To Do Next (Immediate Order of Operations)

**Step 1 — Database (15 min):**
Create staging Supabase project → dump schema from prod → apply to staging → seed

**Step 2 — Backend config (30 min):**
Add `pydantic-settings`, create `config.py`, update `main.py`, create `.env.local`

**Step 3 — Create develop branch and deploy (20 min):**
```bash
git checkout -b develop && git push origin develop
```
Add staging service to `render.yaml`, set env vars in Render dashboard

**Step 4 — Frontend and Vercel (20 min):**
Create `config.ts`, add `EnvironmentBanner`, create second Vercel project pointing at `develop`

**Step 5 — DNS + validate (10 min + propagation):**
Add the two CNAME records, run the validation checklist

Total setup time: ~90 minutes. After that, your development workflow is:
`feature branch → PR into develop → auto-deploys to staging → test → PR into main → production`
