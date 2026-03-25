# Render — Backend Production Environment

Set these in: **Render Dashboard → Service → Environment**

---

```env
ENV=production

# Supabase
SUPABASE_URL=https://vtgdoxvvxosrcyhbfiii.supabase.co
SUPABASE_ANON_KEY=<your_supabase_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<your_supabase_service_role_key>

# Database (Supabase pooler — connection limit suited for serverless/render)
DATABASE_URL=<your_database_url>
DIRECT_URL=<your_direct_url>

# Auth — MUST point to the production Vercel URL for email links to work
AUTH_REDIRECT_URL=https://dosteon-app.vercel.app/auth/callback

# CORS — all Vercel deployment URLs that need access to this backend
BACKEND_CORS_ORIGINS=["https://dosteon-app.vercel.app","https://dosteon-app-git-main-dosteonapp.vercel.app","https://dosteon-app-git-main-dosteonapp-dosteonapp.vercel.app"]

# Email (Resend)
RESEND_API_KEY=<your_resend_api_key>
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
