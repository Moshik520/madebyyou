import type { Locator, Page } from '@playwright/test';

export class DesignerPage {
  readonly page: Page;
  readonly title: Locator;
  readonly messageInput: Locator;
  readonly sendButton: Locator;
  readonly bubbles: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByRole('heading', { name: 'סוכן העיצוב' });
    this.messageInput = page.getByPlaceholder('כתבו מה תרצו על המוצר…');
    this.sendButton   = page.getByRole('button', { name: 'שליחה' });
    this.bubbles = page.locator('.bubble')

  }

    async send(message: string) {
    await this.messageInput.fill(message);
    await this.sendButton.click();
  }
}