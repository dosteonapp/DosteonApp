# Vercel — Frontend Production Environment

Set these in: **Vercel Dashboard → Project → Settings → Environment Variables**
Apply to: `Production` (and `Preview` if needed)

---

```env
NEXT_PUBLIC_SUPABASE_URL=https://vtgdoxvvxosrcyhbfiii.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0Z2RveHZ2eG9zcmN5aGJmaWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDk5NTUsImV4cCI6MjA4ODYyNTk1NX0.kXuhKCDPLDoEI4av0nuCX4iJJCqTB-ZBhLcm-nCeOOg

# Points to the Render backend — server-side only (not exposed to browser)
BACKEND_URL=https://dosteonapp.onrender.com

# Public-facing API URL (used in docs/debug — same as above)
NEXT_PUBLIC_API_URL=https://dosteonapp.onrender.com

# Feature flags — keep both false in production
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_BYPASS_AUTH=false
```

---

## Notes

- `BACKEND_URL` is server-side only (no `NEXT_PUBLIC_` prefix) — never exposed to the browser. Next.js API routes use it to proxy requests to Render.
- Do NOT set `NEXT_PUBLIC_BYPASS_AUTH=true` in production — it skips authentication entirely.
- After adding/changing env vars, redeploy the project for them to take effect.
