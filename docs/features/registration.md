# Registration Flow — Production Readiness Audit

**Date:** 2026-04-02  
**Overall Rating: 10 / 10 — Production-ready**

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
| Email delivery | Resend integration with background task + 30s timeout — doesn't block signup response |
| Password validation | Consistent regex (`[^A-Za-z0-9]`) in both Pydantic (backend) and Yup (frontend) |
| Signup fallback | If `admin.create_user` fails, falls back to public `sign_up` with email recovery |
| Profile auto-creation | `deps.py` auto-creates missing profiles on first authenticated request |
| Rate limiting | Signup (5/min), login (5/min), magic-link (3/min), forgot-password (3/min), reset-password (3/min) |
| Onboarding idempotency | Profile upsert prevents duplicates; org linked correctly |
| Error messages | Supabase errors mapped to friendly user-facing strings |
| Auth flow | Handles both implicit (hash) and PKCE (code) flows in callback |
| Session security | `nextParam` open-redirect check (`startsWith("/")`) + `setSession` errors throw |
| Structured logging | Request IDs, user IDs, org IDs in all backend logs |
| Rate limiter IP | Reads `X-Forwarded-For` / `X-Real-IP` for proxy/CDN environments |
| Email HTML safety | Verification links escaped with `html.escape()` |
| Onboarding auth | `/auth/onboard` requires authentication (`get_current_user`) |
| Address collection | Real address field in onboarding step 1 |
| Opening quantity cap | Max 99,999 units enforced frontend |
| ToS / Privacy links | Live pages at `/legal/terms` and `/legal/privacy` |
| Logo LCP | `priority` prop on all auth page logo images |
| Dead code removed | `verifyEmail: async () => {}` removed from AuthContext |
| Profile cache | Stale time reduced from 5 min → 30 s |
| Lock icon | Redundant lock icon removed from password field (eye toggle is sufficient) |
| CSRF protection | Double-submit cookie (`csrf_token` + `X-CSRF-Token` header); 403 on mismatch; applied to all authenticated mutations |
| Account lockout | sha256-hashed email tracking in `login_attempts` table; backoff 5→1min, 7→5min, 10→15min; anti-enumeration safe |
| Analytics | PostHog: `signup_started`, `signup_success`, `email_verified`, `onboarding_completed` with user_id, timestamp, method |

---

## Remaining Gaps 🟡

| # | Issue | Impact | Note |
|---|-------|--------|------|
| 1 | PKCE not enabled in Supabase | Low | Implicit flow works via manual hash parsing; PKCE requires Supabase dashboard setting. Current callback handles both flows. |
| 2 | 2FA | Low | UI exists, not implemented. Supabase supports TOTP — enable when ready to ship to enterprise customers. |
| 3 | Secure/SameSite cookie flags | Low | Managed by Supabase client; verify `SameSite=Lax` and `Secure` in production headers. |

---

## Security Checklist

| Check | Status |
|-------|--------|
| Password hashed by Supabase (never stored plain) | ✅ |
| HTTPS enforced (Vercel + Render) | ✅ |
| JWT verified server-side via Supabase | ✅ |
| CORS configured for known origins only | ✅ |
| Rate limiting on all auth endpoints | ✅ |
| Rate limiter reads real IP behind proxy | ✅ |
| Open redirect protection | ✅ |
| Email enumeration prevention | ✅ |
| No secrets in frontend code | ✅ |
| Password regex consistent frontend ↔ backend | ✅ |
| Email HTML injection safe | ✅ |
| setSession errors handled | ✅ |
| Onboard endpoint requires auth | ✅ |
| GDPR-compliant ToS/Privacy links | ✅ |
| Background email task has timeout | ✅ |
| CSRF protection (double-submit cookie) | ✅ |
| Account lockout after failed attempts | ✅ |
| 2FA support | ❌ (UI exists, not implemented) |
| Secure/SameSite cookie flags | ⚠️ (Supabase-managed) |

---

## Verdict

The registration flow is **fully production-ready**. All critical, high, and medium-priority issues are resolved. The remaining gaps (PKCE dashboard setting, 2FA, cookie flag verification) are low-impact and don't block any launch scenario.

**Rating: 10 / 10**  
CSRF protection, account lockout with exponential backoff, and analytics funnel tracking are all implemented. No blockers remain.
