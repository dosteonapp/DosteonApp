# Render Deployment Guide

---

## Staging — `dosteon-staging-api`

Auto-deploys from the `develop` branch on every push. Service is already defined in `render.yaml`.

### Step 1 — Connect repo (first time only)
Render dashboard → **New → Blueprint** → connect GitHub repo → Render reads `render.yaml` and creates both services.

### Step 2 — Set env vars for `dosteon-staging-api`
Render dashboard → `dosteon-staging-api` → **Environment** → add each key:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Supabase staging **pooler** URL |
| `DIRECT_URL` | Supabase staging **direct** URL |
| `SUPABASE_URL` | `https://uthliwmewwlfjlbskilw.supabase.co` |
| `SUPABASE_ANON_KEY` | Staging anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Staging service role key |
| `AUTH_REDIRECT_URL` | `https://staging.dosteon.com/auth/callback` |
| `DEV_EMAIL_OVERRIDE` | Your test inbox (e.g. `you+staging@gmail.com`) |

> `APP_ENV=staging`, `PYTHON_VERSION`, `LOG_LEVEL`, and `BACKEND_CORS_ORIGINS` are already
> hardcoded in `render.yaml` — do not re-add them in the dashboard.

**Where to find staging Supabase credentials:**
Supabase → staging project (`uthliwmewwlfjlbskilw`) → Settings → Database / API

### Step 3 — Trigger first deploy
```bash
git push origin develop   # already pushed? manually trigger from Render dashboard
```

### Step 4 — Verify health
```bash
curl https://dosteonapp-1.onrender.com/health/ready
# Expected: {"status": "ok"}
```

### Migrations (only when schema changed)
Run manually against staging before merging to main:
```bash
cd backend
DIRECT_URL="<staging-direct-url>" python scripts/migrate_sales_schema.py
```

---

## Production — `dosteon-backend`

Set these in: **Render Dashboard → `dosteon-backend` → Environment**

```env
APP_ENV=production

# Supabase
SUPABASE_URL=https://vtgdoxvvxosrcyhbfiii.supabase.co
SUPABASE_ANON_KEY=<production_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<production_service_role_key>

# Database (Supabase pooler)
DATABASE_URL=<production_pooler_url>
DIRECT_URL=<production_direct_url>

# Auth
AUTH_REDIRECT_URL=https://dosteon.com/auth/callback

# CORS
BACKEND_CORS_ORIGINS=["https://dosteon.com","https://dosteon-app.vercel.app"]

# Email
RESEND_API_KEY=<resend_api_key>
RESEND_FROM_EMAIL=no-reply@mail.dosteon.com
FROM_EMAIL=no-reply@mail.dosteon.com
```

### Notes
- `AUTH_REDIRECT_URL` must match the Supabase **Redirect URLs** allowlist exactly.
- `BACKEND_CORS_ORIGINS` must include every Vercel URL the frontend is deployed at.
- Migrations are **never** run automatically — run manually before each production deploy.
- Never run `prisma db push` on production — use migration scripts only.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Build fails: `ModuleNotFoundError` | Package missing from `requirements.txt` |
| 503 immediately after deploy | `DATABASE_URL` wrong or Supabase project paused |
| `socket hang up` in frontend logs | Handled automatically by `prisma.py` ping guard |
| Emails not arriving | Check `DEV_EMAIL_OVERRIDE` is set (staging) or Resend domain verified (prod) |
| Cold start 30s delay | Expected on free tier — upgrade to Starter before production traffic |
