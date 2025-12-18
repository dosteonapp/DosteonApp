# Dosteon Backend

This is the Express.js backend server for the Dosteon project. It handles core authentication logic, user profile management, and database interactions via the Supabase Admin SDK.

## Prerequisites

- Node.js (Latest LTS)
- NPM or Yarn
- Access to a Supabase project (specifically the Service Role Key)

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file in this directory and add the following:
    ```env
    PORT=4000
    SUPABASE_URL=your_supabase_project_url
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
    ```

3.  **Run in Development Mode**:
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:4000`.

## Architecture

- `routes/auth.js`: Handles email/password signup (with admin user creation) and login.
- `supabaseClient.js`: Initializes the Supabase client with the Service Role Key for backend operations.
- `index.js`: Main entry point setting up Express and middleware (CORS, JSON).

## Testing

You can use the provided integration script to test the backend logic separately:
```bash
node scripts/integration-test.js
```
