# Registration Flow — Production Readiness Audit

**Date:** 2026-04-02  
**Overall Rating: 6.5 / 10 — Functional but not production-hardened**

---

## Flow Summary

```
Signup Form → POST /auth/signup → Resend Verification Email
→ Click Link → /auth/callback (client page) → Parse Hash/Code → setSession
→ /onboarding (3 steps) → Welcome Card → /dashboard
```

---

## What Is Working Well ✅

| Area | Detail |
|------|--------|
| Email delivery | Resend integration with background task — doesn't block signup response |
| Password validation | Enforced in both Pydantic (backend) and Yup (frontend) |
| Signup fallback | If `admin.create_user` fails, falls back to public `sign_up` with email recovery |
| Profile auto-creation | `deps.py` auto-creates missing profiles on first authenticated request |
| Rate limiting | Signup (5/min), login (5/min), magic-link (3/min), forgot-password (3/min) |
| Onboarding idempotency | Profile upsert prevents duplicates; org linked correctly |
| Error messages | Supabase errors mapped to friendly user-facing strings |
| Auth flow | Handles both implicit (hash) and PKCE (code) flows in callback |
| Session security | `nextParam` open-redirect check (`startsWith("/")`) |
| Structured logging | Request IDs, user IDs, org IDs in all backend logs |

---

## Critical Issues 🔴

### 1. Password Regex Mismatch
- **Frontend** (`frontend/schemas/auth.ts:9`): accepts any non-alphanumeric character (`[^A-Za-z0-9]`) — so `~`, `` ` ``, etc. pass
- **Backend** (`backend/app/schemas/auth.py:28`): only accepts `[!@#$%^&*(),.?\":{}|<>]`
- **Impact:** User enters `MyPass~1` → frontend accepts → backend rejects → confusing error with no explanation

### 2. No Rate Limit on Reset-Password
- **File:** `backend/app/api/v1/endpoints/auth.py:81`
- Every other auth endpoint has rate limiting. Reset-password does not.
- **Impact:** Brute-force reset token attacks possible

### 3. Auth Callback — No Session After Hash Processing
- **File:** `frontend/app/auth/callback/page.tsx`
- Supabase is using implicit flow (hash-based tokens). We manually parse the hash and call `setSession` — this works but is a workaround.
- **Proper fix:** Enable PKCE in Supabase → Authentication → Sign In / Providers → Email → Flow Type = PKCE

### 4. Onboard Endpoint Accepts Unauthenticated Requests
- **File:** `backend/app/api/v1/endpoints/auth.py:36`
- Uses `get_optional_user` — returns 200 with null org_id if called without auth
- **Impact:** Anyone can trigger the onboarding endpoint without a session; also explains `user_id: null` in logs

---

## High Priority Issues 🟠

### 5. Address Field Is a Placeholder
- **File:** `frontend/app/onboarding/page.tsx:149`
- UI shows "address" in subtitle but the field is hardcoded: `address: "Default Location"`
- Users cannot enter their real address despite the UI implying they can

### 6. Opening Quantity Has No Max Limit
- **File:** `frontend/app/onboarding/page.tsx:141-145`
- Users can submit `999999999` as opening stock — no backend cap
- Fixed to default 0 for empty fields but no upper bound

### 7. Role Mapping Silent Override
- **File:** `backend/app/services/auth_service.py:15-36`
- Any unrecognized role defaults to `"STAFF"` but `"supplier"` maps to `"OWNER"` via the ROLE_MAP
- Auto-created profiles (`deps.py:82`) always get `"OWNER"` regardless of actual role

### 8. Terms of Service Links Are Dead
- **File:** `frontend/app/auth/restaurant/signup/page.tsx:283-297`
- Both ToS and Privacy Policy links are `href="#"` — no-ops
- Required for GDPR / legal compliance in production

---

## Medium Priority Issues 🟡

### 9. X-Forwarded-For Not Handled in Rate Limiter
- All traffic behind Cloudflare or a reverse proxy appears as the same IP
- Rate limiting becomes ineffective in production deployment

### 10. No Timeout on Background Email Task
- **File:** `backend/app/services/auth_service.py:208`
- `asyncio.create_task` fires and forgets — hung email tasks accumulate silently with no alerting

### 11. Login Does Not Validate `setSession` Result
- **File:** `frontend/context/AuthContext.tsx:195-201`
- If Supabase `setSession` fails after login, the error is swallowed silently

### 12. Email Verification Link Not URL-Encoded in HTML
- **File:** `backend/app/services/email_service.py:127-129`
- Verification links embedded directly in HTML — if the link contains `&` or `<`, the email HTML breaks

### 13. 5-Minute Stale Cache for User Profile
- **File:** `frontend/context/UserContext.tsx:110`
- Profile changes (name, role, org) take up to 5 minutes to reflect in UI

---

## Low Priority / Polish 🟢

| # | Issue | File |
|---|-------|------|
| 14 | `verifyEmail: async () => {}` is dead code | `AuthContext.tsx:321` |
| 15 | Password field has both lock icon and toggle button (redundant) | `signup/page.tsx:187` |
| 16 | Form state resets on role change (loses user input) | `signup/page.tsx:36-42` |
| 17 | No "Save as Draft" for onboarding | `onboarding/page.tsx` |
| 18 | No analytics events for signup funnel drop-off | — |
| 19 | LCP warning: logo image missing `loading="eager"` | root layout |

---

## Security Checklist

| Check | Status |
|-------|--------|
| Password hashed by Supabase (never stored plain) | ✅ |
| HTTPS enforced (Vercel + Render) | ✅ |
| JWT verified server-side via Supabase | ✅ |
| CORS configured for known origins only | ✅ |
| Rate limiting on auth endpoints | ✅ (except reset-password) |
| Open redirect protection | ✅ (partial — `startsWith("/")` check) |
| Email enumeration prevention | ✅ (forgot-password is non-leaky) |
| No secrets in frontend code | ✅ |
| Password regex consistent frontend ↔ backend | ❌ |
| CSRF protection | ❌ |
| Account lockout after failed attempts | ❌ |
| 2FA support | ❌ (UI exists, not implemented) |
| Secure/SameSite cookie flags | ❌ |
| GDPR-compliant ToS/Privacy links | ❌ |

---

## Priority Fix Order

1. 🔴 Fix password regex mismatch (frontend vs backend)
2. 🔴 Add rate limit to reset-password endpoint
3. 🔴 Enable PKCE in Supabase (remove hash-based implicit flow dependency)
4. 🔴 Require auth on `/auth/onboard` (`get_current_user` not `get_optional_user`)
5. 🟠 Implement real address collection in onboarding step 1
6. 🟠 Add ToS and Privacy Policy pages with real links
7. 🟠 Fix rate limiter to read `X-Forwarded-For` for proxy/CDN environments
8. 🟡 Add timeout wrapper to background email tasks
9. 🟡 URL-encode verification links before HTML injection
10. 🟡 Add account lockout after 5 failed login attempts

---

## Verdict

The registration flow is **working and usable** — emails send, sessions establish, onboarding completes, and the dashboard loads. It is not yet production-hardened. The critical issues (regex mismatch, missing rate limit, unauthenticated onboard endpoint) should be fixed before public launch. The security gaps (no CSRF, no 2FA, no account lockout) are acceptable for an early-access MVP but must be addressed before scaling.

**Target rating after fixing critical + high issues: 8.5 / 10**
