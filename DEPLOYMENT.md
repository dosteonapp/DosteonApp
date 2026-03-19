# Dosteon Deployment Guidelines

This document outlines the steps required to deploy the **Frontend (Next.js)** and **Backend (FastAPI)** to a production environment.

## 🏛️ Infrastructure Overview

- **Database**: Supabase (PostgreSQL) + Prisma ORM.
- **Authentication**: Supabase Auth (JWT).
- **Backend**: FastAPI (Python 3.10+).
- **Frontend**: Next.js 15 (App Router).

---

## 🐍 Backend Deployment (FastAPI)

### 1. Environment Variables
Ensure the following variables are set in your production environment (e.g., Railway, Render, or Docker):

```env
DATABASE_URL=         # Connection pooling URL (port 6543)
DIRECT_URL=           # Direct DB URL for migrations (port 5432)
SUPABASE_URL=         # Your Supabase Project URL
SUPABASE_ANON_KEY=     # Project Anon Key
SUPABASE_SERVICE_ROLE_KEY= # Service Role Key (CRITICAL for RLS bypass)
AUTH_REDIRECT_URL=    # e.g., https://yourapp.com/auth/callback
ENV=production
```

### 2. Database Migrations
Before starting the server, apply Prisma migrations:
```bash
cd backend
npx prisma migrate deploy
```

### 3. Production Server
Do **NOT** use `uvicorn --reload` in production. Use a process manager like `gunicorn`:
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
```

---

## ⚛️ Frontend Deployment (Next.js)

### 1. Environment Variables
Next.js requires these at **Build Time** (for client-side access):

```env
NEXT_PUBLIC_API_URL=          # e.g., https://api.yourapp.com
NEXT_PUBLIC_SUPABASE_URL=     
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 2. Build & Optimization
1. **Build**: `npm run build`
2. **Start**: `npm run start`

### 3. Rewrites & Proxy
Ensure `next.config.mjs` is configured to point to your production backend URL. If you are using a separate domain for the API (e.g., `api.dosteon.com`), ensure **CORS** is correctly configured in `backend/app/core/config.py`.

---

## 🔐 Production Checklist

1. **CORS Settings**: Update `BACKEND_CORS_ORIGINS` in `config.py` to only allow your production domain.
2. **Supabase RLS**: Ensure your tables have proper RLS policies enabled. The backend uses the `SERVICE_ROLE_KEY` to bypass these, but client-side calls (via Supabase Client) will respect them.
3. **SSL**: Ensure both Frontend and Backend are served over HTTPS.
4. **Error Masking**: Ensure `ENV=production` is set so the backend doesn't leak tracebacks to the client.

---

## 🚀 Recommended Hosting
- **Frontend**: [Vercel](https://vercel.com) (native support for Next.js).
- **Backend/DB**: [Railway](https://railway.app) or [Render](https://render.com) (Native Python support + Docker).
- **Database**: [Supabase](https://supabase.com).
