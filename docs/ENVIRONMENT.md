# Environment Setup Guide

## Local Configuration

### Backend (FastAPI)

- **Port**: 8000
- **URL**: `http://localhost:8000`
- **Docs**: `http://localhost:8000/docs`
- **Setup**:
  - Run `pip install -r requirements.txt`
  - Create `backend/.env` from `backend/.env.example`
  - Start with `uvicorn app.main:app --reload`

### Frontend (Next.js)

- **Port**: 3000
- **URL**: `http://localhost:3000`
- **Setup**:
  - Run `npm install`
  - Create `frontend/.env` from `frontend/.env.example`
  - Start with `npm run dev`

## Feature Flags

- `NEXT_PUBLIC_USE_MOCKS`: Set to `true` to use centralized mock data for unfinished features. Default is `false`.
- `NEXT_PUBLIC_BYPASS_AUTH`: Set to `true` to disable all authentication guards and inject a mock restaurant user. Useful for rapid UI development of the dashboard without needing to sign in. Default is `false`.

## Consistency Rules

1. Always use `http://localhost:8000` for backend references.
2. Use `.env.example` as the source of truth for required variables.
3. No secrets should be committed to Git.
