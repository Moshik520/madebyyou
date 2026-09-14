import { config } from '../../platform/config.js';
import { mockPaymentProvider } from './mock.provider.js';
import type { PaymentProvider } from './types.js';

function createPaymentProvider(): PaymentProvider {
  switch (config.PAYMENT_PROVIDER) {
    case 'mock':
      return mockPaymentProvider;
    default:
      throw new Error(
        `Unknown payment provider: ${config.PAYMENT_PROVIDER as string}`,
      );
  }
}

export const paymentProvider = createPaymentProvider();
export type { ChargeInput, ChargeResult, PaymentProvider } from './types.js';
