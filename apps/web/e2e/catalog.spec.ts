import { expect, test } from '@playwright/test';

test('the catalog lists products', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'המוצרים שלנו' }),
  ).toBeVisible();

  await expect(page.getByRole('article').first()).toBeVisible();
});
