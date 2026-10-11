import type { Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    this.page = page;
    this.email = page.getByLabel('אימייל');
    this.password = page.getByLabel('סיסמה');
    this.submit = page.getByRole('button', { name: 'התחברות' });
    this.error = page.getByRole('alert');

  }

  async goto() {
    await this.page.goto('/login');
  }


  async signIn(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
