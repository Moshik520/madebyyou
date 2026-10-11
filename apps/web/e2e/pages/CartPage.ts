import type { Locator, Page } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly title: Locator;
  readonly increaseQuantity: Locator;
  readonly signInPrompt: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByRole('heading', { name: 'העגלה שלך' });
    this.increaseQuantity = page.getByRole('button', { name: 'הוספת כמות' });
    // Shown instead of the cart contents when nobody is signed in.
    this.signInPrompt = page.getByRole('link', { name: 'להתחברות' });
  }

  async goto() {
    await this.page.goto('/cart');
  }
}
