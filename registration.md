# Registration Flow — Production Readiness Audit

**Date:** 2026-04-02  
**Overall Rating: 9.5 / 10 — Production-ready**

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

---

## Remaining Gaps 🟡

| # | Issue | Impact | Note |
|---|-------|--------|------|
| 1 | PKCE not enabled in Supabase | Low | Implicit flow works via manual hash parsing; PKCE requires Supabase dashboard setting (not available on free tier UI). Current callback handles both. |
| 2 | CSRF protection | Medium | No CSRF tokens — acceptable for JWT/Supabase-based auth where cookies are HttpOnly, but worth adding for form endpoints |
| 3 | Account lockout after failed logins | Medium | No lockout after N failed attempts — Supabase handles some throttling but not hard lockout |
| 4 | 2FA | Low | UI exists, not implemented. Supabase supports TOTP — enable when ready to ship to enterprise customers |
| 5 | Secure/SameSite cookie flags | Low | Managed by Supabase client; verify `SameSite=Lax` and `Secure` in production headers |
| 6 | Analytics / funnel drop-off | Low | No events for signup abandonment |

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
| CSRF protection | ❌ |
| Account lockout after failed attempts | ❌ |
| 2FA support | ❌ (UI exists, not implemented) |
| Secure/SameSite cookie flags | ⚠️ (Supabase-managed) |

---

## Verdict

The registration flow is **production-ready for launch**. All critical and high-priority issues have been resolved. The remaining gaps (CSRF, account lockout, 2FA) are acceptable for an early-access launch and should be addressed before scaling to a large user base.

**Rating: 9.5 / 10**  
The 0.5 gap is held by CSRF protection and account lockout — neither blocks launch but both should be on the post-launch security roadmap.
