import { test, expect, Page } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000';

const onboardingEmail = process.env.E2E_ONBOARDING_EMAIL;
const onboardingPassword = process.env.E2E_ONBOARDING_PASSWORD;

const onboardedEmail = process.env.E2E_ONBOARDED_EMAIL;
const onboardedPassword = process.env.E2E_ONBOARDED_PASSWORD;

// Basic smoke test to confirm app boots
// and the public landing page is reachable.

test('public landing page renders', async ({ page }: { page: Page }) => {
  await page.goto(baseURL);
  await expect(page).toHaveTitle(/Dosteon/i);
});

// These tests assume that you have provisioned test users in Supabase:
// - One restaurant user who has NOT completed onboarding yet
//   (E2E_ONBOARDING_EMAIL / E2E_ONBOARDING_PASSWORD)
// - One restaurant user who HAS completed onboarding
//   (E2E_ONBOARDED_EMAIL / E2E_ONBOARDED_PASSWORD)
// Each suite will be skipped automatically if the corresponding env vars are missing.

test.describe('restaurant onboarding flow', () => {
  test.skip(!onboardingEmail || !onboardingPassword, 'E2E_ONBOARDING_EMAIL/PASSWORD must be set');

  test('not-onboarded restaurant user is sent to onboarding', async ({ page }: { page: Page }) => {
    await page.goto(`${baseURL}/auth/restaurant/signin`);

    await page.getByLabel('Email Address').fill(onboardingEmail!);
    await page.getByLabel('Password').fill(onboardingPassword!);
    await page.getByRole('button', { name: /log in/i }).click();

    await page.waitForURL('**/onboarding');
    await expect(page.getByRole('heading', { name: /business details/i })).toBeVisible();
  });
});

test.describe('returning restaurant user', () => {
  test.skip(!onboardedEmail || !onboardedPassword, 'E2E_ONBOARDED_EMAIL/PASSWORD must be set');

  test('onboarded restaurant user can reach dashboard home', async ({ page }: { page: Page }) => {
    await page.goto(`${baseURL}/auth/restaurant/signin`);

    await page.getByLabel('Email Address').fill(onboardedEmail!);
    await page.getByLabel('Password').fill(onboardedPassword!);
    await page.getByRole('button', { name: /log in/i }).click();

    await page.waitForURL('**/dashboard');
    await expect(page.getByText(/welcome back/i)).toBeVisible();
  });
});
