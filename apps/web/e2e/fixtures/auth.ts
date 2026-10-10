import { test as base, expect, type Page } from '@playwright/test';
import { Navbar } from '../pages/Navbar';
import { RegisterPage } from '../pages/RegisterPage';


type AuthFixtures = {
  signedInPage: Page;
};

export const test = base.extend<AuthFixtures>({
  signedInPage: async ({ page }, use) => {
    const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(email, 'Password123');
    await expect(new Navbar(page).greeting).toBeVisible();

    await use(page);
  },
});

export { expect } from '@playwright/test';
