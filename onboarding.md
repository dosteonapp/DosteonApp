# Dosteon Onboarding & Authentication Overview (Phase 1-2)

## 1. Authentication Roadmap: "The Previous Flow"

We have restored the systematic auth cycle that moves from signup to a real verified dashboard session.

### Full Lifecycle:

1.  **Signup (Frontend)**: User provides name, email, password, and organization name.
2.  **Auth Request (Backend)**: Backend signals Supabase to register the user + create the organization.
3.  **Google App SMTP Integration**:
    - **The Key to Success**: To avoid the "Email rate limit hit" error you saw, you must connect your **Google App Password** to Supabase.
    - **How it works**: Once configured, Supabase will send its verification emails through your Gmail account immediately, bypassing all starter limits.
4.  **Verification Email**: User receives a branded activation email at `gatetejules1@gmail.com`.
5.  **Confirmation (`/auth/callback`)**: Clicking the link triggers the frontend callback, which exchanges the verification code for a secure session.
6.  **Profile Synchronization**: A Postgres trigger automatically populates the `profiles` table to link the user to their restaurant.
7.  **Auto-Redirect**: The frontend detects the session and lands the user on the Home Dashboard.

---

## 2. Onboarding Requirements

### Organization Setup (Admin Only)

- **Initialization**: Every signup with an `organization_name` creates a new row in the `organizations` table.
- **Default Settings**: The organization is initialized with your standard hours (e.g., 08:00 - 22:00 for restaurant operations).

### Secure Access Control (RBAC)

- **Admin**: Total control over the Organization, its Teams, and Settings.
- **Manager**: Can manage inventory and view all team activity.
- **Staff**: Limited to operational logging (Counting stock, Usage, Waste).
- **Strict Isolation**: Enforced by Row Level Security (RLS) so no organization can ever view another's data.

---

## 3. How to complete the Google Integration

To restore the **Google App email sending** in your new project:

1.  **Supabase Dashboard** -> **Authentication** -> **Email Settings**.
2.  **Enable SMTP**: Toggle this to ON.
3.  **SMTP Provider**: Custom.
4.  **Host**: `smtp.gmail.com` | **Port**: `587`.
5.  **User**: `gatetejules1@gmail.com`.
6.  **Password**: Your **Google App Password** (16-digit code from Google Account Security).

---

## 4. Current Integration Metrics

- ✅ **Signup UI**: Live in `frontend/app/auth/restaurant/signup/page.tsx`.
- ✅ **Verification Check**: `EmailCheckScreen` component is active.
- ✅ **Backend Routing**: Auth API handles organization and user creation as a single atomic unit.
- ✅ **Status**: Ready for verification once SMTP is enabled.
