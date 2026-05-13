import { test, expect } from '@playwright/test';

// US-009 — sign up as Merchant or Seller (ACs 1-5; AC6 verified via BE migration test).

test('Signup form disables submit until a role is selected; Merchant path returns role=MERCHANT', async ({ page }) => {
  const email = `merchant+${Date.now()}@example.com`;
  await page.goto('/signup');

  await page.getByTestId('signup-email').fill(email);
  await page.getByTestId('signup-display-name').fill('Merchant E2E');
  await page.getByTestId('signup-password').fill('CorrectHorseBattery42!');

  // Submit must be disabled because role is not yet picked (AC1+AC4).
  await expect(page.getByTestId('signup-submit')).toBeDisabled();

  await page.getByTestId('signup-role-merchant').check();
  await expect(page.getByTestId('signup-submit')).toBeEnabled();
  await page.getByTestId('signup-submit').click();

  // Lands on /account-setup; the header should now show the MERCHANT badge.
  await expect(page).toHaveURL(/\/account-setup/);
  await expect(page.getByTestId('header-role-badge')).toHaveText('Merchant');
});

test('Seller signup variant sets role=SELLER and badge label "Seller"', async ({ page }) => {
  const email = `seller+${Date.now()}@example.com`;
  await page.goto('/signup');

  await page.getByTestId('signup-email').fill(email);
  await page.getByTestId('signup-display-name').fill('Seller E2E');
  await page.getByTestId('signup-password').fill('CorrectHorseBattery42!');
  await page.getByTestId('signup-role-seller').check();
  await page.getByTestId('signup-submit').click();

  await expect(page).toHaveURL(/\/account-setup/);
  await expect(page.getByTestId('header-role-badge')).toHaveText('Seller');
});
