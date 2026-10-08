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
