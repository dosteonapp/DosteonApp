import { test, expect, Page } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000';

// --- Test user credentials ---
//
// E2E_ONBOARDING_EMAIL / E2E_ONBOARDING_PASSWORD
//   A restaurant user who has a valid Supabase account but has NOT completed
//   onboarding (profile.onboarding_completed = false in the DB).
//   After sign-in + email verification the auth callback routes them to /onboarding.
//
// E2E_ONBOARDED_EMAIL / E2E_ONBOARDED_PASSWORD
//   A restaurant user who has already completed onboarding
//   (profile.onboarding_completed = true).
//   After sign-in they are routed directly to /dashboard.
//
// NOTE — new-user email-verification path:
//   When a brand-new user verifies their email, the auth/callback route calls
//   GET /api/v1/auth/me and checks profile.onboarding_completed. If false,
//   the user is redirected to /onboarding. This path requires email interception
//   and should be tested with the dynamic-user suite below or a Supabase webhook mock.

const onboardingEmail = process.env.E2E_ONBOARDING_EMAIL;
const onboardingPassword = process.env.E2E_ONBOARDING_PASSWORD;

const onboardedEmail = process.env.E2E_ONBOARDED_EMAIL;
const onboardedPassword = process.env.E2E_ONBOARDED_PASSWORD;

// Basic smoke test — confirm the app boots and landing page renders.
test('public landing page renders', async ({ page }: { page: Page }) => {
  await page.goto(baseURL);
  await expect(page).toHaveTitle(/Dosteon/i);
});

// ─────────────────────────────────────────────────────────────────────────────
// Un-onboarded user
//
// A user with onboarding_completed = false in the DB should be redirected
// to /onboarding after sign-in and see the first step of the new 4-step flow.
// ─────────────────────────────────────────────────────────────────────────────
test.describe('un-onboarded restaurant user', () => {
  test.skip(!onboardingEmail || !onboardingPassword, 'E2E_ONBOARDING_EMAIL/PASSWORD must be set');

  test('is redirected to /onboarding after sign-in', async ({ page }: { page: Page }) => {
    await page.goto(`${baseURL}/auth/restaurant/signin`);

    await page.getByLabel('Email Address').fill(onboardingEmail!);
    await page.getByLabel('Password').fill(onboardingPassword!);
    await page.getByRole('button', { name: /log in/i }).click();

    // Should land on /onboarding
    await page.waitForURL('**/onboarding');

    // Step 1 heading is visible
    await expect(
      page.getByRole('heading', { name: /tell us about your food business/i })
    ).toBeVisible();
  });

  test('cannot skip onboarding by navigating directly to /dashboard', async ({ page }: { page: Page }) => {
    await page.goto(`${baseURL}/auth/restaurant/signin`);

    await page.getByLabel('Email Address').fill(onboardingEmail!);
    await page.getByLabel('Password').fill(onboardingPassword!);
    await page.getByRole('button', { name: /log in/i }).click();

    await page.waitForURL('**/onboarding');

    // Attempting to jump to dashboard should stay gated
    await page.goto(`${baseURL}/dashboard`);
    await page.waitForURL('**/onboarding');
    await expect(
      page.getByRole('heading', { name: /tell us about your food business/i })
    ).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Returning (fully onboarded) user
// ─────────────────────────────────────────────────────────────────────────────
test.describe('returning onboarded restaurant user', () => {
  test.skip(!onboardedEmail || !onboardedPassword, 'E2E_ONBOARDED_EMAIL/PASSWORD must be set');

  test('lands on /dashboard directly', async ({ page }: { page: Page }) => {
    await page.goto(`${baseURL}/auth/restaurant/signin`);

    await page.getByLabel('Email Address').fill(onboardedEmail!);
    await page.getByLabel('Password').fill(onboardedPassword!);
    await page.getByRole('button', { name: /log in/i }).click();

    await page.waitForURL('**/dashboard');
    await expect(page.getByText(/welcome back/i)).toBeVisible();
  });

  test('is redirected away from /onboarding to /dashboard', async ({ page }: { page: Page }) => {
    await page.goto(`${baseURL}/auth/restaurant/signin`);

    await page.getByLabel('Email Address').fill(onboardedEmail!);
    await page.getByLabel('Password').fill(onboardedPassword!);
    await page.getByRole('button', { name: /log in/i }).click();

    await page.waitForURL('**/dashboard');

    // Completed user trying to navigate directly to /onboarding is bounced back
    await page.goto(`${baseURL}/onboarding`);
    await page.waitForURL('**/dashboard');
  });
});
