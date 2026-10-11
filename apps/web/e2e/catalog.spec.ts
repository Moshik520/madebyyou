import { expect, test } from '@playwright/test';
import { CatalogPage } from './pages/CatalogPage';

test('the catalog lists products', async ({ page }) => {
  const catalogPage = new CatalogPage(page);

  await catalogPage.goto();

  await expect(catalogPage.title).toBeVisible();
  await expect(catalogPage.productCards.first()).toBeVisible();
});

test('shows an error when the catalog fails to load', async ({ page }) => {

     const catalogPage = new CatalogPage(page);
    await page.route('**/api/products', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'boom' } }),
    }),
  );


  await catalogPage.goto();

  await expect(catalogPage.error).toBeVisible();
  await expect(catalogPage.productCards).toHaveCount(0);

});

