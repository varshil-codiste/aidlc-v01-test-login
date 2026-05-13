import { test, expect } from '@playwright/test';

// US-010 (header badge) + US-011 (Profile + Logout).

test('Header badge present on /dashboard, /account-setup, /profile but NOT on Landing or /signup', async ({ page }) => {
  // Landing — no badge.
  await page.goto('/');
  await expect(page.getByTestId('header-role-badge')).toHaveCount(0);

  // /signup — no badge.
  await page.goto('/signup');
  await expect(page.getByTestId('header-role-badge')).toHaveCount(0);

  // Sign up to enter the authenticated zone.
  const email = `badge+${Date.now()}@example.com`;
  await page.getByTestId('signup-email').fill(email);
  await page.getByTestId('signup-display-name').fill('Badge Tester');
  await page.getByTestId('signup-password').fill('CorrectHorseBattery42!');
  await page.getByTestId('signup-role-merchant').check();
  await page.getByTestId('signup-submit').click();

  // /account-setup — badge visible.
  await expect(page).toHaveURL(/\/account-setup/);
  await expect(page.getByTestId('header-role-badge')).toBeVisible();

  await page.getByTestId('setup-submit').click();

  // /dashboard — badge visible.
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByTestId('header-role-badge')).toBeVisible();

  // Navigate to /profile via View-Profile link — badge visible.
  await page.getByTestId('dashboard-view-profile').click();
  await expect(page).toHaveURL(/\/profile/);
  await expect(page.getByTestId('header-role-badge')).toBeVisible();
});

test('Profile renders four read-only fields, and Profile-page Logout clears cookies + redirects to /', async ({ page }) => {
  const email = `profile+${Date.now()}@example.com`;
  const displayName = 'Profile Tester';

  // Sign up and complete setup.
  await page.goto('/signup');
  await page.getByTestId('signup-email').fill(email);
  await page.getByTestId('signup-display-name').fill(displayName);
  await page.getByTestId('signup-password').fill('CorrectHorseBattery42!');
  await page.getByTestId('signup-role-seller').check();
  await page.getByTestId('signup-submit').click();
  await page.getByTestId('setup-submit').click();
  await expect(page).toHaveURL(/\/dashboard/);

  // Go to profile.
  await page.getByTestId('dashboard-view-profile').click();
  await expect(page).toHaveURL(/\/profile/);

  // Four read-only field rows.
  await expect(page.getByTestId('profile-email')).toHaveText(email);
  await expect(page.getByTestId('profile-display-name')).toHaveText(displayName);
  await expect(page.getByTestId('profile-timezone')).toHaveText('Asia/Kolkata');
  await expect(page.getByTestId('profile-setup-complete')).toHaveText('Yes');

  // Logout from profile.
  await page.getByTestId('profile-logout').click();
  await expect(page).toHaveURL('/');
  await expect(page.getByText(/signed out/i)).toBeVisible();
});

test('Back-to-Dashboard link works from /profile', async ({ page }) => {
  const email = `back+${Date.now()}@example.com`;
  await page.goto('/signup');
  await page.getByTestId('signup-email').fill(email);
  await page.getByTestId('signup-display-name').fill('Back Tester');
  await page.getByTestId('signup-password').fill('CorrectHorseBattery42!');
  await page.getByTestId('signup-role-merchant').check();
  await page.getByTestId('signup-submit').click();
  await page.getByTestId('setup-submit').click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.getByTestId('dashboard-view-profile').click();
  await expect(page).toHaveURL(/\/profile/);
  await page.getByTestId('profile-back-dashboard').click();
  await expect(page).toHaveURL(/\/dashboard/);
});

test('Unauthenticated visit to /profile redirects to Landing', async ({ page, context }) => {
  await context.clearCookies();
  await page.goto('/profile');
  await expect(page).toHaveURL('/');
});
