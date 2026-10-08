import { test as base, expect, type Page } from '@playwright/test';

type AuthFixtures = {
  signedInPage: Page;
};

export const test = base.extend<AuthFixtures>({
  signedInPage: async ({ page }, use) => {
    const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

    await page.goto('/register');
    await page.getByLabel('אימייל').fill(email);
    await page.getByLabel('סיסמה').fill('Password123');
    await page.getByRole('button', { name: 'יצירת חשבון' }).click();
    await expect(page.getByText('שלום,')).toBeVisible();

    await use(page);
  },
});

export { expect } from '@playwright/test';
