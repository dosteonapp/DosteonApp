# Dosteon — Engineering Candidate Assessment

**Role:** Full-Stack Engineer (Technical Collaborator)  
**Led by:** Jules Gatete, Technical Lead  
**Focus:** Backend · Frontend · Auth · Infrastructure · Security · Testing · Containerisation

---

## About the Role

You will work directly with the technical lead to build and scale Dosteon — a restaurant operations platform handling real-time inventory, procurement, and daily operations for restaurants.

This is not a "ticket-taker" role. You will own systems end-to-end, make architecture decisions, and be expected to raise concerns before they become problems. Speed matters, but correctness and security matter more — we have real users and real data.

**Our mission:** Give every restaurant kitchen the clarity to run without chaos — the right stock, the right data, the right alerts, every day.

---

## The Stack (What You Will Work With)

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+ (App Router), TypeScript, React 19, Tailwind CSS, Radix UI, React Query, Formik |
| Backend | FastAPI (Python), Prisma ORM (`prisma-client-py`), PostgreSQL |
| Auth | Supabase Auth — JWT, PKCE + implicit flow, CSRF double-submit cookie |
| Database | PostgreSQL via Supabase, multi-tenant schema with soft deletes |
| Hosting | Vercel (frontend), Render (backend) |
| Security | Rate limiting (slowapi), login lockout, anti-enumeration, CSRF |
| Analytics | PostHog (funnel tracking) |
| Email | Resend (transactional) |

---

## Section 1 — Quick Pulse (Multiple Choice)

> Conversational warm-up. One best answer per question. No tricks — just tell us where you stand.

---

**1. A user reports they can see another restaurant's inventory data. Your first move is:**

- A) Check the frontend filtering logic
- B) Check whether the backend queries are scoped by `organization_id`
- C) Restart the server and see if it goes away
- D) Ask the user to clear their cache

---

**2. You need to add a `notes` column to the `inventory_events` table in production. You:**

- A) Run `prisma migrate dev` on the production database
- B) Write the SQL manually and run it in Supabase SQL editor
- C) Create a Prisma migration locally, review the generated SQL, run `prisma migrate deploy` on production
- D) Add the column in the Prisma schema and push directly without a migration

---

**3. A new POST endpoint needs to update a user's profile. It is authenticated. You:**

- A) Add auth dependency only — that is enough
- B) Add auth + CSRF verification — mutations need both
- C) Skip auth since the user data is in the request body
- D) Add a rate limiter but no CSRF — rate limiting is enough protection

---

**4. You finish a feature. Before opening a PR you:**

- A) Push and open the PR immediately — reviewer will catch anything
- B) Test the happy path manually, then open the PR
- C) Test happy path, failure cases, and edge cases. Review your own diff first. Then open the PR
- D) Write a paragraph in Slack explaining what you built, then open the PR

---

**5. A background task (sending email) occasionally times out and the server log fills with unhandled exceptions. You:**

- A) Wrap it in `try/except` and silence the error
- B) Add `asyncio.wait_for()` with a timeout, catch `TimeoutError`, log it clearly, and never let it crash the main request
- C) Move it to a cron job
- D) Increase the server timeout setting

---

**6. `prisma migrate dev` vs `prisma migrate deploy` — which do you use in production?**

- A) `migrate dev` — it is more powerful
- B) `migrate deploy` — it only applies pending migrations without touching existing data
- C) Either — they do the same thing
- D) Neither — I write raw SQL for production

---

**7. You are about to delete rows from a production table. You:**

- A) Run the DELETE directly
- B) Run a SELECT with the same WHERE clause first, confirm the affected rows, then run the DELETE
- C) Take a backup, then delete
- D) B and C — preview first, backup if the data is irreplaceable

---

**8. A colleague opens a PR that drops a column from the `profiles` table. You:**

- A) Approve — if the column is unused, it is fine
- B) Ask whether the column has data in production and whether all code referencing it has been removed first
- C) Reject immediately — you never drop columns
- D) Merge it to staging first and see what happens

---

**9. The frontend needs to track when a user completes onboarding. You fire the analytics event:**

- A) Inside `useEffect` with no guard — it runs on mount
- B) Inside the `onSuccess` callback of the mutation, guarded by a `useRef` to prevent duplicate fires
- C) On every render of the completion screen
- D) In the backend response handler

---

**10. You are asked to log user activity for debugging. You log:**

- A) Full request body including email and password
- B) Request ID, user ID, org ID, action, timestamp — no PII
- C) Everything — you can filter it later
- D) Nothing — logs are a security risk

---

## Section 2 — Technical Depth

> Open questions. We want your reasoning, not just the answer.

### 2.1 Backend

1. We use `relationMode = "prisma"` in our Prisma schema. What does this mean, and what breaks if you `DELETE` a row directly in SQL instead of through Prisma?

2. Our `signup()` creates the Supabase user first, then the organization, then the profile. Why is that order critical? What was the bug when we had the organization created first?

3. We wrap background email tasks with `asyncio.wait_for(..., timeout=30.0)`. What problem does this solve? What would happen without it on a busy server?

4. Explain what `upsert` does in Prisma and why it is safer than a plain `create` in a signup flow that might retry.

5. We hash the email with SHA-256 before storing it in the `login_attempts` table. Why? What does this protect against?

---

### 2.2 Frontend

1. Our axios interceptor reads the `csrf_token` cookie and injects it as `X-CSRF-Token` on every non-GET request. What attack does this prevent, and why does it not work if the cookie is `httpOnly: true`?

2. We use `useRef(false)` to guard analytics events instead of `useState`. What is the practical difference in this context?

3. Next.js App Router — `PostHogProvider` is a `"use client"` component inside a server component layout. Why doesn't this force the entire page to become a client component?

4. React Query `staleTime` was reduced from 5 minutes to 30 seconds on the user profile. Give a real scenario where the 5-minute setting would cause a visible bug.

5. A junior engineer wants to use `localStorage` to store the JWT for easier access. What do you tell them?

---

### 2.3 Auth & Security

1. Explain the double-submit cookie CSRF pattern in plain terms. Why is it called "stateless"?

2. Our login lockout checks the attempt count **before** calling Supabase — not after. Why does the order matter for anti-enumeration?

3. What is a timing attack? Why do we use `secrets.compare_digest()` instead of `==` when comparing CSRF tokens?

4. PKCE vs implicit auth flow — which is more secure and why? When would you use each?

5. We use `SameSite=Lax` on the CSRF cookie. What does `Lax` protect against vs `Strict`? What does it still allow?

---

### 2.4 Testing

1. We have no automated tests yet. If you had one afternoon to add the highest-value tests to this codebase, what would you test first and why?

2. What is the difference between a unit test, integration test, and end-to-end test? Give a concrete example of each using our stack.

3. We use `prisma-client-py` with a real PostgreSQL database. Should tests hit a real database or a mock? What are the trade-offs?

4. How would you test that the login lockout works correctly — specifically that it blocks on the 5th attempt and unblocks after the cooldown?

5. Our frontend uses React Query and Formik. How would you test the signup form — what tool would you use and what cases would you cover?

---

### 2.5 Docker & Containerisation

1. We currently run the backend on Render directly (no Docker). What problems would Dockerising it solve? What new problems does it introduce?

2. Write the mental model for a `Dockerfile` for our FastAPI backend. What base image, what steps, and why?

3. What is the difference between `docker build` and `docker-compose up`? When would you use each?

4. We have a backend that connects to a Supabase-hosted PostgreSQL. In a `docker-compose.yml` for local development, should we include a local Postgres container or point at Supabase? What are the trade-offs?

5. What is a `.dockerignore` file and what should always be in it for a Python project?

---

## Section 3 — Practical Task

> Pick one. 48 hours. Submit a GitHub link — we review the actual code.

### Option A — Backend
Implement `DELETE /auth/account`:
- Requires auth + CSRF
- Deletes in correct order: `inventory_events` → `contextual_products` → `day_status` → `locations` → `organization` → `profile` → Supabase user
- Returns 204, idempotent on repeat calls
- Write at least one pytest test covering the happy path and one covering an unauthenticated call

### Option B — Frontend
Build a `useAccountDelete` hook:
- Calls `DELETE /auth/account`
- Confirmation modal before proceeding
- Clears Supabase session + React Query cache on success
- Redirects to `/auth/restaurant/signin?deleted=true`
- Toast shown on signin page when `?deleted=true` is present
- Write a test for the hook using your preferred testing tool

### Option C — Docker + Staging
Dockerise the backend and document a staging setup:
- Working `Dockerfile` for the FastAPI backend
- `docker-compose.yml` for local dev (backend + any supporting services)
- `.dockerignore` with the right exclusions
- Document the environment variables needed for staging vs production
- Explain how `prisma migrate deploy` fits into the Docker startup sequence

---

## Section 4 — Collaboration & Workflow

We work fast and communicate in code. Non-negotiables:

**Code**
- PRs are small and focused — one concern per PR
- Auth, security, and DB changes always have a comment explaining *why*
- No feature flags or backwards-compat shims — change the code directly
- Never `--no-verify` without flagging it

**Database**
- Schema changes go through Prisma migrations only — no raw SQL in production
- Migrations are additive unless explicitly agreed
- Always read the generated SQL in `/prisma/migrations/` before deploying

**Security**
- Every mutation endpoint gets CSRF verification
- No PII in logs — use request IDs and user IDs only
- Rate limit every public endpoint
- Soft-delete by default

**Communication**
- Blocked for 2+ hours → raise it, don't go silent
- Disagree with a decision → say so with a reason
- Shipped something touching real user data → document it

---

## Section 5 — What We Are Looking For

| Signal | What it looks like |
|--------|--------------------|
| **Ownership** | You finish what you start and flag adjacent issues you didn't cause |
| **Security instinct** | You think about the attacker before you think about the feature |
| **Pragmatism** | You know when to build properly and when to ship — you don't over-engineer |
| **Communication** | Your commits say *why*. You ask before assuming. |
| **Speed with care** | You move fast without leaving broken things behind |

---

## Scoring

| Area | Weight |
|------|--------|
| Multiple choice (Section 1) | 20% |
| Technical depth (Section 2) | 35% |
| Practical task (Section 3) | 35% |
| Collaboration fit (Section 4 discussion) | 10% |

**Minimum bar:** 70%+ on Sections 1–2 AND a working, reviewable Section 3 submission.

---

## What Happens Next

1. Submit Section 1–2 answers + Section 3 code via a GitHub repository link
2. 30-minute call — we walk through your Section 3 code together
3. Decision within 48 hours of the call

---

*Dosteon is building the operating system for restaurant kitchens. We want engineers who care about systems that work under pressure — not just systems that work in demos.*
