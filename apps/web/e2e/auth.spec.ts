import { expect, test } from '@playwright/test';
import { Navbar } from './pages/Navbar';
import { RegisterPage } from './pages/RegisterPage';

test('a new user can register and ends up signed in', async ({ page }) => {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

  const registerPage = new RegisterPage(page);
  await registerPage.goto();
  await registerPage.register(email, 'Password123');

  await expect(new Navbar(page).greeting).toBeVisible();
});
