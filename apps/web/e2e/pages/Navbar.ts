import type { Locator, Page } from '@playwright/test';

/**
 * The navbar is on every page, so it gets its own object rather than being
 * copied into each page class.
 */
export class Navbar {
  readonly page: Page;
  readonly greeting: Locator;
  readonly cartLink: Locator;
  readonly ordersLink: Locator;
  readonly signOutButton: Locator;
  readonly signInLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.greeting = page.getByText('שלום,');
    this.cartLink = page.getByRole('link', { name: 'העגלה שלי' });
    this.ordersLink = page.getByRole('link', { name: 'ההזמנות שלי' });
    this.signOutButton = page.getByRole('button', { name: 'התנתקות' });
    this.signInLink = page.getByRole('link', { name: 'התחברות' });
  }

  async signOut() {
    await this.signOutButton.click();
  }
}
