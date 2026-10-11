import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { CatalogPage } from './pages/CatalogPage';

test('the catalog page has no accessibility violations', async ({ page }) => {
  const catalogPage = new CatalogPage(page);

  await catalogPage.goto();
  // Scan the finished page, not the loading skeleton.
  await expect(catalogPage.productCards.first()).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

    const summary = results.violations.map(
    (v) => `${v.id} (${v.impact}) on ${v.nodes.length} element(s)`,
  );

  expect(summary).toEqual([]);

});
