# Test Checklist & Setup Guide

This document outlines the steps to verify the application functionality using a local mock backend.

## 1. Setup

### Prerequisites
- Node.js installed
- Dependencies installed (`npm install`)

### Environment Variables
Ensure your `.env.local` or `.env` file points to the mock API:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```
*(Note: The provided mock server runs on port 4000 by default)*

## 2. Start Services

1. **Start the Mock Backend**:
   Run the following command in a terminal:
   ```bash
   node scripts/mock-api.js
   ```

2. **Start the Frontend** (if not already running):
   ```bash
   npm run dev
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
  - *Expectation*: Stats (Revenue, Orders) are visible and not zero (loaded from mock).
- [ ] **Loading States**: Verify skeletons/loaders appear while fetching.

### C. Inventory Management
- [ ] **View Inventory**: Go to `/restaurant/inventory` (or equivalent).
  - *Expectation*: List of items (empty or mock data) loads without error.
- [ ] **Add Item**: Click "Add Item", fill form, submit.
  - *Expectation*: Success toast/message; list updates (if mock supports state, otherwise check console/network).
  - *Note*: The simple mock script resets data on restart unless extended.

### D. Networking & Discovery
- [ ] **Product Categories**: Check if categories dropdowns are populated (Mock returns Vegetables, Meat, Dairy).

## 4. Troubleshooting
- **CORS Errors**: Ensure the mock server is setting headers and the port matches `NEXT_PUBLIC_API_URL`.
- **Axios Errors**: Check the browser console network tab. If calls go to `localhost:3000/api/v1/...`, your env var is not set correctly.
