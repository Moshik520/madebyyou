import type { Locator, Page } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;

  constructor(page: Page) {
    this.page = page;
    this.email = page.getByLabel('אימייל');
    this.password = page.getByLabel('סיסמה');
    this.submit = page.getByRole('button', { name: 'יצירת חשבון' });
  }

  async goto() {
    await this.page.goto('/register');
  }

  async register(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
