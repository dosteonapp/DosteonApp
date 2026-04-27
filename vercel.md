# Vercel Deployment Guide

---

## Staging — new Vercel project pointing at `develop`

### Step 1 — Create staging project
1. [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. **Root Directory**: `frontend`
4. **Framework**: Next.js (auto-detected)
5. **Branch**: `develop`
6. Name the project `dosteon-staging` (or similar)

### Step 2 — Set env vars
Vercel → `dosteon-staging` → **Settings → Environment Variables**
Apply to: **Preview** and **Production** (Vercel calls the `develop`-branch deploy "Production" for this project)

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_ENV` | `staging` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://uthliwmewwlfjlbskilw.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Staging anon key |
| `BACKEND_URL` | `https://dosteonapp-1.onrender.com` |
| `NEXT_PUBLIC_USE_MOCKS` | `false` |
| `NEXT_PUBLIC_BYPASS_AUTH` | `false` |

> `BACKEND_URL` has **no** `NEXT_PUBLIC_` prefix — it's server-side only and proxies
> `/api/v1/*` requests to Render. It is never exposed to the browser.

### Step 3 — Add redirect URL to Supabase
Supabase → staging project (`uthliwmewwlfjlbskilw`) →
**Authentication → URL Configuration → Redirect URLs** → add:

```
https://dosteon-app-7u3b-quqiv0swx-dosteons-projects.vercel.app/auth/callback
```

Without this, email confirmation links will fail with a redirect error.

### Step 4 — Add staging domain (optional)
Vercel → `dosteon-staging` → **Settings → Domains** → add `staging.dosteon.com`
Then point DNS: `CNAME staging → cname.vercel-dns.com`

### Step 5 — Verify deploy
After deploy completes:
- Open the Vercel preview URL
- You should see a **blue "STAGING" banner** at the top of every page
- Sign in → dashboard loads → BrandSwitcherCard shows **CLOSED** (no open day yet)

---

## Production — existing Vercel project

Set these in: **Vercel → production project → Settings → Environment Variables**

```env
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://vtgdoxvvxosrcyhbfiii.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production_anon_key>
BACKEND_URL=https://dosteon-backend.onrender.com
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_BYPASS_AUTH=false
```

Production deploys automatically from the `main` branch after merging `develop → main`.

---

## Notes

- After adding/changing env vars → **Redeploy** for them to take effect (Vercel doesn't hot-reload env changes).
- `vercel.json` in `frontend/` sets `installCommand: npm install --legacy-peer-deps` — this is required; do not remove it.
- TypeScript errors in supplier/auth pages are pre-existing and do not block the build (`next build` only errors on emit-blocking issues).

---

## Staging → Production workflow

```
develop branch  →  staging.dosteon.com   (auto on every push)
     ↓
  PR: develop → main
     ↓
main branch     →  dosteon.com           (auto on merge)
```

Always verify staging is working before opening the PR to main.
