import { expect, test } from '@playwright/test';
import { CartPage } from './pages/CartPage';
import { CatalogPage } from './pages/CatalogPage';
import { LoginPage } from './pages/LoginPage';
import { Navbar } from './pages/Navbar';
import { ProductPage } from './pages/ProductPage';

/**
 * Not a test: this regenerates the images the README links to, so they stay in
 * step with the design tokens. Run it deliberately:
 *
 *   SCREENSHOTS=1 npx playwright test screenshots.spec --project=chromium
 */
test.describe('README screenshots', () => {
  test.skip(
    !process.env.SCREENSHOTS,
    'Set SCREENSHOTS=1 to refresh docs/screenshots.',
  );

  test.use({ viewport: { width: 1440, height: 900 } });

  test('catalog', async ({ page }) => {
    const catalogPage = new CatalogPage(page);

    await catalogPage.goto();
    await expect(catalogPage.productCards.first()).toBeVisible();

    // The README labels this "Catalog", so show the products rather than the
    // hero that sits above them.
    await catalogPage.productCards.first().scrollIntoViewIfNeeded();

    // Viewport only, not fullPage: the README puts this beside a landscape
    // shot, and a 1900px-tall image next to it looks broken.
    await page.screenshot({ path: '../../docs/screenshots/catalog.png' });
  });

  test('cart', async ({ page, request }) => {
    // A named account, so the navbar greets "שלום, דנה" rather than showing a
    // generated test address in a picture people will look at.
    const email = `demo-${Date.now()}@example.com`;
    await request.post('/api/auth/register', {
      data: { email, password: 'Password123', name: 'דנה' },
    });

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.signIn(email, 'Password123');
    // Wait for the session to land: the product page bounces to /login if it
    // still thinks nobody is signed in.
    await expect(new Navbar(page).greeting).toBeVisible();

    const catalogPage = new CatalogPage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);

    await catalogPage.goto();
    await catalogPage.openFirstProduct();
    await productPage.addToCart();
    await expect(cartPage.increaseQuantity).toBeVisible();

    // Trim the viewport to the content so the image has no dead space below.
    await page.setViewportSize({ width: 1440, height: 700 });
    await page.screenshot({ path: '../../docs/screenshots/cart.png' });
  });
});
