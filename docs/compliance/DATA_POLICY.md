# Data Handling & Privacy Policy (MVP)

This document describes how the Dosteon MVP handles personal data, retention, and account deletion. It is **not** a formal legal policy, but a technical baseline to guide implementation.

> **TODO (legal review):** This document should be reviewed and adapted by legal counsel before being used as a customer-facing privacy policy.

## 1. Personal Data Collected

Dosteon collects and processes the following personal data at MVP stage:

- **Identity & contact**
  - Email address (Supabase auth user + Profile.email).
  - Phone number (business contact phone, collected during onboarding and stored in organization settings and/or Supabase user_metadata).
  - First and last name (user profile and Supabase metadata).
- **Business metadata**
  - Business / restaurant name (Organization.name).
  - Basic location/address details (stored in Organization settings and/or related tables).
- **Technical data**
  - IP address and user agent are typically captured in hosting / edge logs.
  - Request identifiers (request_id) and user/organization IDs in structured logs for debugging and audit.

No payment card data is stored by Dosteon.

## 2. Data Retention

Retention is designed to keep **operational data** long enough for audit and analytics, while limiting how long identifiable logs are kept.

- **Inventory and operational events**
  - Tables such as `contextual_products`, `inventory_events`, and `day_status` are retained **indefinitely**.
  - This allows long-term reporting on usage, waste, and stock behavior.
  - When an account is deleted, operational history is **anonymized** rather than hard-deleted (see section 4).

- **User and organization records**
  - Organizations and Profiles stay active as long as the restaurant account is active.
  - When a user requests account deletion, their Profile and Organization are **soft-deleted** via a `deleted_at` timestamp and anonymization of personal fields.

- **Logs**
  - Application logs include `request_id`, `user_id`, and `organization_id` as context fields.
  - For MVP, logs are expected to be retained for **30 days** by the hosting/logging provider where possible.
  - **Application policy:**
    - Request logs that contain user_id/organization_id should not be kept longer than **30 days**.
    - Authentication-related logs (e.g. login attempts) should not be kept longer than **90 days**.

> **TODO (retention review):** Confirm whether any customers or investors require stricter retention limits or data residency guarantees.

## 3. Right to Export

At MVP stage, data export is handled manually:

- A restaurant owner can request an export of their operational data.
- The operator runs ad-hoc queries filtered by `organization_id` (and user ID if needed) to produce a JSON or CSV export of:
  - Organization profile and settings.
  - User profiles associated with the organization.
  - Inventory master data (contextual products).
  - InventoryEvents and day status records.
- The resulting export is securely transferred to the requester (e.g. password-protected archive via email or a secure file link).

> **Future enhancement:** Add a self-service “Export my data” endpoint and/or UI that packages the above datasets automatically.

## 4. Right to Deletion (Account Deletion)

When a restaurant owner (OWNER/MANAGER role) requests account deletion, Dosteon performs a **soft-delete and anonymization** flow instead of destructive hard deletes. This preserves operational history while removing direct identifiers.

### 4.1 Technical behavior

The backend exposes an authenticated endpoint:

- `DELETE /api/v1/auth/account`
  - Requires a logged-in user with OWNER or MANAGER role (see `get_admin_context`).
  - On success returns HTTP `204 No Content`.

Implementation behavior (high level):

1. **Supabase auth user**
   - Calls `supabase.auth.admin.delete_user(user_id)` to delete the underlying Supabase auth user.
   - If Supabase deletion fails, the operation is best-effort; the API still attempts the remaining steps and logs any errors.

2. **Profile soft-delete**
   - The Prisma `Profile` row is updated to:
     - Set `deleted_at` to the current timestamp.
     - Anonymize personally identifiable fields, e.g.:
       - Replace `email` with a non-identifying placeholder (e.g. `deleted+<id>@example.invalid`).
       - Clear `first_name`, `last_name`, and `avatar_url`.

3. **Organization soft-delete**
   - The Prisma `Organization` row is updated to:
     - Set `deleted_at` to the current timestamp.
     - Optionally rename the organization (e.g. `"Deleted Organization <id>"`) to avoid exposing the real business name in future admin tools.

4. **InventoryEvents anonymization**
   - All `InventoryEvent` rows for the organization are anonymized by setting `organization_id = null`.
   - Event data (quantities, event_type, timestamps) is preserved for aggregate analytics, but no longer links to a specific organization.

> **Note:** Contextual products and other operational tables may still carry an `organization_id`. The primary anonymization step is on `inventory_events`, which are the main longitudinal activity log.

### 4.2 Practical semantics

- After deletion:
  - The user can no longer sign in (Supabase auth user is gone).
  - The organization is considered inactive and should not appear in any active tenant listings.
  - Inventory and event data remains only in anonymized form.
- Deletion is effectively **irreversible** from the UI/operational tooling perspective.

> **TODO (multi-tenant policy):** Decide how to handle multiple users within the same organization (e.g. team members) when the OWNER deletes the account (cascade soft-delete vs. orphaning).

## 5. Third-Party Processors

Dosteon relies on the following third-party processors at MVP stage:

- **Supabase** – Authentication and Postgres database hosting.
  - Stores user auth records, profiles, and all application data.
  - Provides backups, RLS, and JWT-based auth.
  - A Data Processing Addendum (DPA) is available from Supabase.

- **Render (or similar hosting)** – Hosts the FastAPI backend and Next.js frontend.
  - Handles TLS termination, deployment, and application logs.
  - May store short-lived logs and metrics for debugging.

> **TODO (DPAs):** Ensure DPAs are reviewed and accepted for each processor in any environment that processes real customer data.

## 6. Legal Basis for Processing

Dosteon currently relies on:

- **Legitimate interest** for processing operational data related to running the restaurant (inventory, usage logs, opening/closing states).
- **Contractual necessity** for core authentication and account management (creating and maintaining a user account to access the service).
- **Consent** for any future marketing communications.
  - At MVP, no marketing emails or tracking pixels are implemented.

Any expansion into marketing or analytics that uses personal data should:

- Be documented here.
- Include a clear consent mechanism in the UI.
- Provide an opt-out flow for users.
