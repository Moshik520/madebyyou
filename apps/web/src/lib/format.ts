const priceFormatter = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
});

/**
 * Prices arrive from the API as decimal strings ("24.90").
 * Number() here is for display only — never for arithmetic.
 */
export function formatPrice(value: string): string {
  return priceFormatter.format(Number(value));
}

const dateFormatter = new Intl.DateTimeFormat('he-IL', {
  dateStyle: 'long',
  timeStyle: 'short',
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export const orderStatusLabels: Record<string, string> = {
  PENDING: 'ממתינה לתשלום',
  PAID: 'שולמה',
  FAILED: 'התשלום נכשל',
  CANCELLED: 'בוטלה',
};
