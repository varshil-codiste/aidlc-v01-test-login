import { test, expect } from '@playwright/test';

// US-001 through US-005 happy path.

test('Landing → Sign Up → Account Setup → Dashboard → Logout', async ({ page }) => {
  const email = `e2e+${Date.now()}@example.com`;
  const password = 'CorrectHorseBattery42!';
  const displayName = 'E2E Tester';

  // 1. Landing
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /sign in to zone pos/i })).toBeVisible();

  // 2. Click "Sign Up" CTA → Signup page
  await page.getByTestId('landing-signup-cta').click();
  await expect(page).toHaveURL(/\/signup/);

  // 3. Fill signup
  await page.getByTestId('signup-email').fill(email);
  await page.getByTestId('signup-display-name').fill(displayName);
  await page.getByTestId('signup-password').fill(password);
  await page.getByTestId('signup-role-seller').check();
  await page.getByTestId('signup-submit').click();

  // 4. Land on Account Setup
  await expect(page).toHaveURL(/\/account-setup/);
  await expect(page.getByTestId('setup-display-name')).toHaveValue(displayName);

  // 5. Submit setup
  await page.getByTestId('setup-submit').click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByTestId('dashboard-greeting')).toContainText(displayName);

  // 6. Logout
  await page.getByTestId('dashboard-logout').click();
  await expect(page).toHaveURL('/');
  await expect(page.getByText(/signed out/i)).toBeVisible();
});
