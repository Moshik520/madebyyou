import type { Locator, Page } from '@playwright/test';

export class ProductPage {
  readonly page: Page;
  readonly addToCartButton: Locator;
  readonly startDesigningLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addToCartButton = page.getByRole('button', { name: 'הוספה לעגלה' });
    this.startDesigningLink = page.getByRole('link', { name: 'התחילו לעצב' });
  }

  async goto(slug: string) {
    await this.page.goto(`/products/${slug}`);
  }

  async addToCart() {
    await this.addToCartButton.click();
  }
}
