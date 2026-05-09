# Backend Setup Guide

## Quick Setup (You've Already Done Most of This!)

Your backend environment is already configured. Here's how to run it:

### Option 1: Using Make (Recommended)

```bash
# Start backend only
make dev-backend
```

### Option 2: Manual Start

```bash
cd apps/backend
.venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Verify Backend is Running

Once started, you should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Test the Backend

1. **Health Check**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status":"ok"}`

2. **API Documentation**
   Open in browser: http://localhost:8000/docs

3. **Test Database Connection**
   ```bash
   curl http://localhost:8000/health/ready
   ```

## Frontend Setup (To Fix Your Current Error)

The error you're seeing is because the **frontend** can't connect to the backend. Let's set up the frontend:

### 1. Check Frontend Environment

```bash
# Check if frontend .env exists
ls apps/frontend/.env.local
```

### 2. Create Frontend .env.local

```bash
cd apps/frontend
cp .env.example .env.local
```

### 3. Edit Frontend .env.local

Add these values:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://untqbcbhcmzehlhjfzys.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVudHFiY2JoY216ZWhsaGpmenlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjM1MjMsImV4cCI6MjA5MzgzOTUyM30.X-dDOErgS4b78a8EIyGcdJtjV6DuqRPkHM9i5uh4zXA
```

## Running Both Backend and Frontend

### Option 1: Both Together (Recommended)

```bash
# From project root
make dev
```

This starts:
- Backend on http://localhost:8000
- Frontend on http://localhost:3000

### Option 2: Separately (For Debugging)

**Terminal 1 - Backend:**
```bash
make dev-backend
```

**Terminal 2 - Frontend:**
```bash
make dev-frontend
```

## Troubleshooting

### Backend Won't Start

1. **Check if port 8000 is in use:**
   ```bash
   lsof -i :8000
   # If something is using it, kill it:
   kill -9 <PID>
   ```

2. **Check Python virtual environment:**
   ```bash
   cd apps/backend
   ls .venv/bin/python
   ```

3. **Reinstall dependencies:**
   ```bash
   cd apps/backend
   .venv/bin/pip install -r requirements.txt
   ```

### Frontend Can't Connect to Backend

1. **Make sure backend is running first**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Check frontend .env.local has correct API URL**
   ```bash
   cat apps/frontend/.env.local | grep API_URL
   ```
   Should show: `NEXT_PUBLIC_API_URL=http://localhost:8000`

3. **Restart frontend after changing .env.local**
   ```bash
   # Stop frontend (Ctrl+C)
   # Start again
   make dev-frontend
   ```

### Database Connection Issues

1. **Test database connection:**
   ```bash
   cd apps/backend
   .venv/bin/python scripts/maintenance/quick_verify.py
   ```

2. **Check if migrations are needed:**
   ```bash
   make db-migrate
   ```

## Common Commands

```bash
# Start everything
make dev

# Start backend only
make dev-backend

# Start frontend only  
make dev-frontend

# Run tests
make test

# Check database
make db-studio

# Run migrations
make db-migrate

# Verify setup
cd apps/backend && .venv/bin/python scripts/maintenance/quick_verify.py
```

## What's Running Where

- **Backend API**: http://localhost:8000
- **Backend Docs**: http://localhost:8000/docs
- **Frontend**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555 (when running `make db-studio`)

## Next Steps After Setup

1. **Create a test user** via the frontend signup page
2. **Test authentication** by logging in
3. **Explore the API** at http://localhost:8000/docs
4. **Check the database** with `make db-studio`

## Need Help?

Run the verification script:
```bash
cd apps/backend
.venv/bin/python scripts/maintenance/quick_verify.py
```

This will tell you exactly what's working and what needs attention.
