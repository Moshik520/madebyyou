import { expect, test } from './fixtures/auth';
import { CartPage } from './pages/CartPage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductPage } from './pages/ProductPage';

test('a signed-in user can add a product to the cart', async ({
  signedInPage: page,
}) => {
  const catalogPage = new CatalogPage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);

  await catalogPage.goto();
  await catalogPage.openFirstProduct();
  await productPage.addToCart();

  await expect(cartPage.title).toBeVisible();
  await expect(cartPage.increaseQuantity).toBeVisible();
});

// Deliberately uses the plain `page`, not the signed-in fixture: the whole
// point is what a visitor without an account sees.
test('prompts a signed-out visitor to sign in', async ({ page }) => {
  const cartPage = new CartPage(page);

  await cartPage.goto();

  await expect(cartPage.signInPrompt).toBeVisible();
  await expect(cartPage.increaseQuantity).toBeHidden();
});
