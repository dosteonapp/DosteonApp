# Render — Backend Production Environment

Set these in: **Render Dashboard → Service → Environment**

---

```env
ENV=production

# Supabase
SUPABASE_URL=https://vtgdoxvvxosrcyhbfiii.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0Z2RveHZ2eG9zcmN5aGJmaWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDk5NTUsImV4cCI6MjA4ODYyNTk1NX0.kXuhKCDPLDoEI4av0nuCX4iJJCqTB-ZBhLcm-nCeOOg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0Z2RveHZ2eG9zcmN5aGJmaWlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA0OTk1NSwiZXhwIjoyMDg4NjI1OTU1fQ.XDfUn64w0GvvRI2XM_lxWwkA_Bf9BCGRr2BN9HRVusQ

# Database (Supabase pooler — connection limit suited for serverless/render)
DATABASE_URL=postgresql://postgres.vtgdoxvvxosrcyhbfiii:Dosteon%402026@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?connection_limit=5
DIRECT_URL=postgresql://postgres.vtgdoxvvxosrcyhbfiii:Dosteon%402026@aws-1-eu-west-1.pooler.supabase.com:5432/postgres

# Auth — MUST point to the production Vercel URL for email links to work
AUTH_REDIRECT_URL=https://dosteon-app.vercel.app/auth/callback

# CORS — all Vercel deployment URLs that need access to this backend
BACKEND_CORS_ORIGINS=["https://dosteon-app.vercel.app","https://dosteon-app-git-main-dosteonapp.vercel.app","https://dosteon-app-git-main-dosteonapp-dosteonapp.vercel.app"]

# Email (Resend)
RESEND_API_KEY=re_18teXkHH_CGmKC8gCxwsEfo9PxmCNyipE
RESEND_FROM_EMAIL=no-reply@mail.dosteon.com
FROM_EMAIL=no-reply@mail.dosteon.com
```

---

## Notes

- `AUTH_REDIRECT_URL` is the most critical auth setting. If this is wrong, all email links (verification, magic link, password reset) will redirect users to the wrong place.
- `SUPABASE_SERVICE_ROLE_KEY` is required for admin user creation flow. Without it, signup falls back to standard Supabase flow (no org auto-creation).
- `BACKEND_CORS_ORIGINS` must include every Vercel URL your frontend is deployed at, including preview URLs if applicable.
- `RESEND_FROM_EMAIL` domain (`mail.dosteon.com`) must be verified in the Resend dashboard, otherwise emails will not deliver.
- Do NOT add SMTP vars in production — Resend is the active email provider.
