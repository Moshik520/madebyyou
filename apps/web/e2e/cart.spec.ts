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
