import { expect, test } from '@playwright/test';
import { CatalogPage } from './pages/CatalogPage';

test('the catalog lists products', async ({ page }) => {
  const catalogPage = new CatalogPage(page);

  await catalogPage.goto();

  await expect(catalogPage.title).toBeVisible();
  await expect(catalogPage.productCards.first()).toBeVisible();
});
