import { test, expect, Page } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000';

// --- Test user credentials ---
// E2E_ONBOARDING_EMAIL / E2E_ONBOARDING_PASSWORD
//   A restaurant user who has a valid account but NO organization_id set in the
//   database (i.e. has never completed onboarding). When this user signs in they
//   land on /dashboard and RoleProvider renders the @onboarding slot.
//   Note: the onboarding_completed Supabase metadata flag is NOT checked during
//   sign-in anymore — only organization_id matters here.
//
// E2E_ONBOARDED_EMAIL / E2E_ONBOARDED_PASSWORD
//   A restaurant user who has completed onboarding and has an organization_id.
//   Signs in → /dashboard → restaurant UI is shown.
//
// NOTE — new-user email-verification path:
//   When a brand-new user verifies their email, the auth/callback route checks
//   onboarding_completed in Supabase metadata and redirects to the standalone
//   /onboarding URL. This path cannot be reliably exercised in E2E without an
//   email-interception service (e.g. Mailhog, Inbucket). Test it separately
//   with a Supabase email webhook mock or a unit test against the callback route.

const onboardingEmail = process.env.E2E_ONBOARDING_EMAIL;
const onboardingPassword = process.env.E2E_ONBOARDING_PASSWORD;

const onboardedEmail = process.env.E2E_ONBOARDED_EMAIL;
const onboardedPassword = process.env.E2E_ONBOARDED_PASSWORD;

// Basic smoke test to confirm the app boots
// and the public landing page is reachable.
test('public landing page renders', async ({ page }: { page: Page }) => {
  await page.goto(baseURL);
  await expect(page).toHaveTitle(/Dosteon/i);
});

// ─────────────────────────────────────────────────────────────────────────────
// Restaurant user without an organization (no-org flow)
//
// Signing in as this user should land on /dashboard, where RoleProvider detects
// no organization_id and renders the @onboarding slot (same OnboardingPage
// component, different URL than the email-verification flow).
// ─────────────────────────────────────────────────────────────────────────────
test.describe('restaurant user without organization', () => {
  test.skip(!onboardingEmail || !onboardingPassword, 'E2E_ONBOARDING_EMAIL/PASSWORD must be set');

  test('lands on /dashboard and sees the onboarding UI', async ({ page }: { page: Page }) => {
    await page.goto(`${baseURL}/auth/restaurant/signin`);

    await page.getByLabel('Email Address').fill(onboardingEmail!);
    await page.getByLabel('Password').fill(onboardingPassword!);
    await page.getByRole('button', { name: /log in/i }).click();

    // Should stay at /dashboard — no redirect to /onboarding
    await page.waitForURL('**/dashboard');

    // RoleProvider renders the @onboarding slot which shows the first onboarding step
    await expect(page.getByRole('heading', { name: /set up your kitchen/i })).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Returning restaurant user (fully onboarded)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('returning restaurant user', () => {
  test.skip(!onboardedEmail || !onboardedPassword, 'E2E_ONBOARDED_EMAIL/PASSWORD must be set');

  test('lands on /dashboard and sees the restaurant dashboard', async ({ page }: { page: Page }) => {
    await page.goto(`${baseURL}/auth/restaurant/signin`);

    await page.getByLabel('Email Address').fill(onboardedEmail!);
    await page.getByLabel('Password').fill(onboardedPassword!);
    await page.getByRole('button', { name: /log in/i }).click();

    await page.waitForURL('**/dashboard');
    await expect(page.getByText(/welcome back/i)).toBeVisible();
  });
});
