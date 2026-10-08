import { expect, test } from '@playwright/test';


test('a new user can register and ends up signed in', async ({ page }) => {
    const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  await page.goto('/register');

   await page.getByLabel('אימייל').fill(email);
   await page.getByLabel('סיסמה').fill('Password123');

  await page.getByRole('button', { name: 'יצירת חשבון' }).click();

  await expect(page.getByText('שלום,')).toBeVisible();
});