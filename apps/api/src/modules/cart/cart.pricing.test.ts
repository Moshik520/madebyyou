import { Decimal } from 'decimal.js';
import { describe, expect, it } from 'vitest';
import { buildCartResponse, buildLineKey, type CartItemRow } from './cart.pricing.js';

function item(price: string, quantity: number, designId?: string): CartItemRow {
  return {
    id: `item-${price}-${quantity}`,
    quantity,
    product: {
      id: 'p1',
      slug: 'steel-bottle',
      name: 'Steel Bottle',
      imageUrl: '/assets/products/steel-bottle.png',
      basePrice: new Decimal(price),
    },
    designVersion: designId
      ? { id: designId, versionNumber: 2, mockup: { storageKey: 'mockup/a.png' } }
      : null,
  };
}

describe('buildLineKey', () => {
  it('separates the same product with different designs', () => {
    expect(buildLineKey('p1', 'v1')).not.toBe(buildLineKey('p1', 'v2'));
  });

  it('collapses plain lines of the same product', () => {
    expect(buildLineKey('p1', null)).toBe(buildLineKey('p1', null));
  });

  it('never produces a null segment, which a unique index cannot handle', () => {
    expect(buildLineKey('p1', null)).toBe('p1:none');
  });
});

describe('buildCartResponse', () => {
  it('sums prices exactly, where floating point would not', () => {
    // 0.1 + 0.2 !== 0.3 in binary floating point.
    const cart = buildCartResponse('c1', [item('0.10', 1), item('0.20', 1)]);

    expect(cart.subtotal).toBe('0.30');
  });

  it('multiplies unit price by quantity', () => {
    const cart = buildCartResponse('c1', [item('24.90', 4)]);

    expect(cart.items[0]?.lineTotal).toBe('99.60');
    expect(cart.subtotal).toBe('99.60');
  });

  it('always formats money with two decimals', () => {
    const cart = buildCartResponse('c1', [item('19', 1)]);

    expect(cart.items[0]?.unitPrice).toBe('19.00');
  });

  it('counts units rather than lines', () => {
    const cart = buildCartResponse('c1', [item('10.00', 3), item('5.00', 2)]);

    expect(cart.itemCount).toBe(5);
  });

  it('exposes the design mockup when a line carries a design', () => {
    const cart = buildCartResponse('c1', [item('10.00', 1, 'v1')]);

    expect(cart.items[0]?.design?.mockupUrl).toBe('/static/mockup/a.png');
  });

  it('leaves design null for a plain product line', () => {
    const cart = buildCartResponse('c1', [item('10.00', 1)]);

    expect(cart.items[0]?.design).toBeNull();
  });
});
