import { expect, test } from '@playwright/test';

test('rejects a password shorter than eight characters', async ({ request }) => {
  const response = await request.post('/api/auth/register', {
    data: {
      email: `e2e-${Date.now()}@example.com`,
      password: 'short',
    },
  });

  expect(response.status()).toBe(400);

  const body = await response.json();
  expect(body.error.code).toBe('VALIDATION_ERROR');
});

test('rejects an email that is already registered', async ({ request }) => {

    const email = `e2e-${Date.now()}@example.com`;
  await request.post('/api/auth/register', {
    data: {
      email,
      password: 'Password123',
    },
  });
 const response = await request.post('/api/auth/register', {
    data: {
      email,
      password: 'Password123',
    },
  });
 

  expect(response.status()).toBe(409);

  const body = await response.json();
  expect(body.error.code).toBe('CONFLICT');
});

test('rejects a login with the wrong password', async ({ request }) => {

    const email = `e2e-${Date.now()}@example.com`;
  await request.post('/api/auth/register', {
    data: {
      email,
      password: 'Password123',
    },
  });
 const response = await request.post('/api/auth/login', {
    data: {
      email,
      password: 'Password1234',
    },
  });
 

  expect(response.status()).toBe(401);

  const body = await response.json();
  expect(body.error.code).toBe('UNAUTHORIZED');
});
