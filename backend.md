# Dosteon Backend Implementation Plan (Restaurant Focus V1)

## Overview

The Dosteon backend (Version 1) focuses exclusively on **Restaurant Operations**. This scalable MVP provides a high-performance API layer for managing internal restaurant workflows using **FastAPI** and **Supabase**.

---

## 1. Implementation Roadmap (Phased Approach)

### Phase 1-2: Foundation, Auth, and Organization Onboarding

This phase establishes the identity and security of the platform.

- **Foundation**:
  - Database schema for `organizations`, `profiles`, `teams`, and `roles`.
  - Global error handling and logging infrastructure.
- **Auth & Security**:
  - Supabase Auth integration (Magic Links, Social Login).
  - JWT-based session management in FastAPI.
  - **Row Level Security (RLS)**: Crucial for multi-tenant safety.
- **Organization Onboarding & Settings**:
  - **Organization Profile**: Name, contact info, and branding.
  - **Operational Settings**: Defining default **Opening & Closing times** (essential for the frontend lifecycle triggers).
  - **Access Control**:
    - Defining roles: `Admin` (full access), `Manager` (operational control), `Staff` (counting/logging only).
    - Team assignments (e.g., Kitchen vs. Front of House).
  - **Inventory Configuration**: Setting up units (kg, L, units) and categories.

### Phase 3: Core Inventory and Daily Lifecycle (The "Heart")

Establishing the source of truth for all restaurant items.

- **Inventory Master Data**:
  - CRUD operations for `inventory_items`.
  - Stock thresholds (Low vs. Critical levels).
- **Daily Lifecycle State Management**:
  - Tracking the `DayStatus` (PRE_OPEN, OPEN, CLOSING_IN_PROGRESS, CLOSED).
  - Persisting the history of daily operational states.

### Phase 4: Real-time Kitchen Service Monitoring & Alerts

Supporting the fast-paced kitchen environment.

- **Usage & Waste Logging**:
  - Optimized endpoints for logging real-time consumption.
  - Wastage tracking with mandatory reason-codes (Safety/Compliance).
- **Intelligent Alerts**:
  - Push or polling-based alerts for "Running Low" items.
  - Service-level summaries (Health vs. Criticality).

### Phase 5: Opening & Closing Workflows

The systematic reconciliation of stock at the start and end of each shift.

- **Opening Part**:
  - Checklist retrieval and verification.
  - Initial stock capture and timestamping.
- **Closing Part**:
  - End-of-day reconciliation logic (Opening + Received - Used - Wasted = Expected Closing).
  - Verification workflows for staff to confirm final counts.
  - Automated daily report generation (Audit Ready).

---

## 2. Security & Compliance Strategy

### A. Secured Data Access

- **Isolation**: Every API request is context-aware. A user can _never_ access data outside their assigned `organization_id`.
- **RBAC (Role-Based Access Control)**: Onboarding checks ensure that only Admins can change organization settings or edit Master Inventory data.

### B. Safety & Integrity

- **Atomic Transactions**: Ensuring that stock updates are synchronized across the database (e.g., deducting stock and adding a log entry must happen together or not at all).
- **Sanitization**: All inputs are validated via Pydantic to prevent injection or malformed data entering the system.

---

## 3. Integration Plan

1.  **Swagger Specs**: Backend auto-generates documentation for the frontend team.
2.  **Service Transition**: One-by-one replacement of mock services in `frontend/lib/services/` with real API calls.
3.  **Authentication Handshake**: Frontend captures the Supabase JWT and passes it in the `Authorization` header via Axios.
