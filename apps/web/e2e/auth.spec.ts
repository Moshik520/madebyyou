import { expect, test } from '@playwright/test';
import { Navbar } from './pages/Navbar';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';

test('a new user can register and ends up signed in', async ({ page }) => {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

  const registerPage = new RegisterPage(page);
  await registerPage.goto();
  await registerPage.register(email, 'Password123');

  await expect(new Navbar(page).greeting).toBeVisible();
});


test('shows an error when the password is wrong', async ({ page,request }) => {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

   await request.post('/api/auth/register', {
    data: { email, password: 'Password123' },
  });


  
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.signIn(email, 'Password1234');

  await expect(loginPage.error).toBeVisible()




});