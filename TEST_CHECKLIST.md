# Test Checklist & Setup Guide

This document is **legacy** and describes how to verify the application against an old Node-based mock backend.

The current stack uses **FastAPI + Supabase** as the primary backend. For up-to-date environment and testing guidance, see:

- `docs/ENVIRONMENT.md`
- `docs/backend.md`
- `review.md`

## 1. Setup

### Prerequisites
- Node.js installed
- Dependencies installed (`npm install`)

### Environment Variables
Ensure your `.env.local` or `.env` file points the frontend backend proxy at the mock API:
```
BACKEND_URL=http://localhost:4000
```
*(Note: The provided mock server runs on port 4000 by default)*

## 2. Start Services

1. **Start the Backend (current stack)**:
  Follow the instructions in `docs/backend.md` to run the FastAPI app locally.

2. **Start the Frontend** (if not already running):
  ```bash
  pnpm dev
  ```

## 3. Test Scenarios

Go through the following flows to verify integration.

### A. Authentication
- [ ] **Navigate to Sign In**: Go to `/auth/restaurant/signin`.
- [ ] **Login**: Enter any email/password (e.g., `test@example.com` / `password`).
  - *Expectation*: Successful redirect to Dashboard.
- [ ] **Verify User Session**: Refresh the page.
  - *Expectation*: You remain logged in (UserContext fetches from `/user`).
- [ ] **Logout**: Click Logout.
  - *Expectation*: Redirected back to Sign In page; cookies/storage cleared.
- [ ] **Sign Up**: Go to `/auth/restaurant/signup`.
  - *Expectation*: Form submits successfully.

### B. Dashboard & Data
- [ ] **Restaurant Dashboard**: Navigate to `/dashboard`.
  - *Expectation*: Core stats (inventory, usage, etc.) are visible and not zero (loaded from the real API or controlled seed data, not the old mock server).
- [ ] **Loading States**: Verify skeletons/loaders appear while fetching.

### C. Inventory Management
- [ ] **View Inventory**: Go to `/dashboard/inventory`.
  - *Expectation*: List of items (empty or mock data) loads without error.
- [ ] **Add Item**: Click "Add Item", fill form, submit.
  - *Expectation*: Success toast/message; list updates (if mock supports state, otherwise check console/network).
  - *Note*: The simple mock script resets data on restart unless extended.

### D. Networking & Discovery
- [ ] **Product Categories**: Check if categories dropdowns are populated (Mock returns Vegetables, Meat, Dairy).

## 4. Troubleshooting
- **CORS Errors**: Ensure the mock server is setting headers and the port matches `BACKEND_URL`.
- **Axios Errors**: Check the browser console network tab. If calls go to `localhost:3000/api/v1/...`, your env var is not set correctly.
