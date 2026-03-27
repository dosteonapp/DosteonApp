import { test, expect, Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000';

const onboardedEmail = process.env.E2E_ONBOARDED_EMAIL;
const onboardedPassword = process.env.E2E_ONBOARDED_PASSWORD;

// Optional: service role key for dynamically creating a fresh, non-onboarded user
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function loginOnboarded(page: Page) {
  await page.goto(`${baseURL}/auth/restaurant/signin`);

  await page.getByLabel('Email Address').fill(onboardedEmail!);
  await page.getByLabel('Password').fill(onboardedPassword!);
  await page.getByRole('button', { name: /log in/i }).click();

  await page.waitForURL('**/dashboard');
}

// --- Opening checklist persistence ---

test.describe('opening checklist persistence', () => {
  test.skip(!onboardedEmail || !onboardedPassword, 'E2E_ONBOARDED_EMAIL/PASSWORD must be set');

  test('opening checklist draft persists between reloads', async ({ page }) => {
    await loginOnboarded(page);

    // Go directly to the Daily Stock Count page
    await page.goto(`${baseURL}/dashboard/inventory/daily-stock-count`);

    await expect(page.getByRole('heading', { name: /daily stock count/i })).toBeVisible();

    // Confirm the first item in the list
    const firstConfirmButton = page.getByRole('button', { name: /^confirm$/i }).first();
    await expect(firstConfirmButton).toBeVisible();
    await firstConfirmButton.click();
    await expect(firstConfirmButton).toHaveText(/confirmed/i);

    // Save the draft
    await page.getByRole('button', { name: /save draft/i }).click();
    await expect(page.getByText(/draft saved/i)).toBeVisible();

    // Reload the page and ensure at least one item is still marked confirmed
    await page.reload();

    await expect(page.getByRole('heading', { name: /daily stock count/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /save draft/i })).toBeVisible();

    await expect(page.getByRole('button', { name: /confirmed/i }).first()).toBeVisible();
  });
});

// --- Inventory mutation via opening checklist ---

test.describe('opening checklist item updates', () => {
  test.skip(!onboardedEmail || !onboardedPassword, 'E2E_ONBOARDED_EMAIL/PASSWORD must be set');

  test('can adjust opening stock for a single item', async ({ page }) => {
    await loginOnboarded(page);

    await page.goto(`${baseURL}/dashboard/inventory/daily-stock-count`);
    await expect(page.getByRole('heading', { name: /daily stock count/i })).toBeVisible();

    // Open the edit modal for the first item
    const firstEditButton = page.getByRole('button', { name: /edit amount added/i }).first();
    await expect(firstEditButton).toBeVisible();
    await firstEditButton.click();

    const modal = page.getByRole('dialog', { name: /update item/i });
    await expect(modal).toBeVisible();

    const incomingInput = modal.getByPlaceholder('24 kg');
    const newQuantityInput = modal.locator('input[readonly]');

    const initialNewQuantity = await newQuantityInput.inputValue();

    await incomingInput.fill('5');

    await expect(newQuantityInput).not.toHaveValue(initialNewQuantity);

    await modal.getByRole('button', { name: /confirm update/i }).click();

    await expect(page.getByText(/inventory has been adjusted/i)).toBeVisible();
  });
});

// --- Onboarding gate for dynamically created user ---

const hasSupabaseAdminEnv = !!(supabaseUrl && supabaseServiceRoleKey);

test.describe('onboarding gate for newly created Supabase user', () => {
  test.skip(!hasSupabaseAdminEnv, 'SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL must be set');

  const tempPassword = process.env.E2E_DYNAMIC_ONBOARDING_PASSWORD || 'E2E-temp-Password-123!';
  let tempEmail: string;

  test.beforeAll(async () => {
    const adminClient = createClient(supabaseUrl!, supabaseServiceRoleKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    tempEmail = `e2e-onboarding-${Date.now()}@example.com`;

    const { error } = await adminClient.auth.admin.createUser({
      email: tempEmail,
      password: tempPassword,
      email_confirm: true,
    });

    if (error) {
      throw error;
    }
  });

  test('new un-onboarded user cannot skip onboarding', async ({ page }) => {
    await page.goto(`${baseURL}/auth/restaurant/signin`);

    await page.getByLabel('Email Address').fill(tempEmail);
    await page.getByLabel('Password').fill(tempPassword);
    await page.getByRole('button', { name: /log in/i }).click();

    // First login should land on onboarding
    await page.waitForURL('**/onboarding');
    await expect(page.getByRole('heading', { name: /business details/i })).toBeVisible();

    // Attempt to jump directly to dashboard should still be gated
    await page.goto(`${baseURL}/dashboard`);
    await page.waitForURL('**/onboarding');
    await expect(page.getByRole('heading', { name: /business details/i })).toBeVisible();
  });
});
