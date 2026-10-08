import { expect, test } from './fixtures/auth';


test('a signed-in user can add a product to the cart'
, async ({ signedInPage: page }) => {
  await page.goto('/');

   await page.getByRole('article').first().getByRole('link').first().click();
  await page.getByRole('button', { name: 'הוספה לעגלה' }).click();

  await expect(page.getByRole('heading',{name: 'העגלה שלך'})).toBeVisible();
   await expect(page.getByRole('button',{name: 'הוספת כמות'})).toBeVisible();
});