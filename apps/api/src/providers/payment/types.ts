export type ChargeInput = {
  orderId: string;
  /** Decimal string, e.g. "114.10" — never a JS number. */
  amount: string;
  currency: string;
  /** Opaque token from the payment form. Never raw card data. */
  cardToken: string;
};

export type ChargeResult =
  | { status: 'succeeded'; reference: string }
  | { status: 'failed'; reference: string; failureReason: string };

export interface PaymentProvider {
  readonly name: string;
  charge(input: ChargeInput): Promise<ChargeResult>;
}
