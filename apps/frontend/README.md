# Dosteon Frontend

This is the Next.js frontend application for the Dosteon project. It provides the user interface for Restaurants and Suppliers, managing authentication state and dashboard views.

## Prerequisites

- Node.js (Latest LTS)
- NPM or Yarn
- A running instance of the Dosteon Backend (`http://localhost:8000`)

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env.local` file in this directory and add the following:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    BACKEND_URL=http://localhost:8000
    ```

3.  **Run in Development Mode**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

## Features

- **Role-Based Auth**: Specialized flows for Suppliers and Restaurants in `/auth`.
- **Auth Methods**:
    - Email/Password (via Backend API).
    - Magic Link (via Supabase SDK).
    - Social Login (Google/Apple via Supabase SDK).
- **Dashboard**: Dynamic role-based dashboard rendering in `/dashboard`.

## Testing

Access the following routes to verify authentication:
- Supplier Login: `/auth/supplier/signin`
- Restaurant Signup: `/auth/restaurant/signup`
- Callback Handler: `/auth/callback` (Automatic redirect after login)
