import { Decimal } from 'decimal.js';
import { localStorageProvider } from '../../providers/storage/local.provider.js';

/**
 * Pure cart maths, kept away from anything that touches the database so it can
 * be tested directly.
 */

export type CartItemRow = {
  id: string;
  quantity: number;
  product: {
    id: string;
    slug: string;
    name: string;
    imageUrl: string;
    basePrice: { toString(): string };
  };
  designVersion: {
    id: string;
    versionNumber: number;
    mockup: { storageKey: string } | null;
  } | null;
};

/**
 * One line per (product, design) pair.
 *
 * A unique index over a nullable column cannot express this: Postgres treats
 * every NULL as distinct, so two plain-product lines would both be accepted.
 * A computed key that is never null sidesteps that.
 */
export function buildLineKey(
  productId: string,
  designVersionId: string | null,
): string {
  return `${productId}:${designVersionId ?? 'none'}`;
}

export function buildCartResponse(cartId: string, items: CartItemRow[]) {
  let subtotal = new Decimal(0);

  const mapped = items.map((item) => {
    const unitPrice = new Decimal(item.product.basePrice.toString());
    const lineTotal = unitPrice.mul(item.quantity);

    subtotal = subtotal.add(lineTotal);

    const design = item.designVersion;

    return {
      id: item.id,
      quantity: item.quantity,
      unitPrice: unitPrice.toFixed(2),
      lineTotal: lineTotal.toFixed(2),
      product: {
        id: item.product.id,
        slug: item.product.slug,
        name: item.product.name,
        imageUrl: item.product.imageUrl,
      },
      design: design
        ? {
            id: design.id,
            versionNumber: design.versionNumber,
            mockupUrl: design.mockup
              ? localStorageProvider.publicUrl(design.mockup.storageKey)
              : null,
          }
        : null,
    };
  });

  return {
    id: cartId,
    items: mapped,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: subtotal.toFixed(2),
  };
}
