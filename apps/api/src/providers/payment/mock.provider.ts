import { randomUUID } from 'node:crypto';
import type { ChargeInput, ChargeResult, PaymentProvider } from './types.js';

/**
 * Sandbox provider. Mirrors how real gateways expose test cards:
 * a specific token always fails, everything else succeeds.
 */
export const mockPaymentProvider: PaymentProvider = {
  name: 'mock',

  async charge(input: ChargeInput): Promise<ChargeResult> {
    // Simulate network latency so the UI's loading state is real.
    await new Promise((resolve) => setTimeout(resolve, 600));

    const reference = `mock_${randomUUID()}`;

    if (input.cardToken === 'tok_decline') {
      return {
        status: 'failed',
        reference,
        failureReason: 'Card was declined',
      };
    }

    return { status: 'succeeded', reference };
  },
};