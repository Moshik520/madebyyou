import type { Locator, Page } from '@playwright/test';

export class CatalogPage {
  readonly page: Page;
  readonly title: Locator;
  readonly productCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByRole('heading', { name: 'המוצרים שלנו' });
    this.productCards = page.getByRole('article');
  }

  async goto() {
    await this.page.goto('/');
  }

  /** Navigates the way a shopper does, rather than relying on a seeded slug. */
  async openFirstProduct() {
    await this.productCards.first().getByRole('link').first().click();
  }
}
