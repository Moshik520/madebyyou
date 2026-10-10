import type { Locator, Page } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly title: Locator;
  readonly increaseQuantity: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByRole('heading',{name: 'העגלה שלך'});
    this.increaseQuantity = page.getByRole('button',{name: 'הוספת כמות'});
  }

  async goto() {
    await this.page.goto('/cart');
  }

}
