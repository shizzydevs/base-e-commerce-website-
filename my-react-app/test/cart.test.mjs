import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCartSubtotal, calculateCartTotal, toCartPayload } from '../src/cartUtils.js';
const cart = [{ id: 1, price: '3.50', quantity: 2 }, { id: 2, price: 4, quantity: 3 }];
test('calculates a cart subtotal and total with delivery and tip', () => {
  assert.equal(calculateCartSubtotal(cart), 19);
  assert.equal(calculateCartTotal(cart, 2), 23.99);
  assert.equal(calculateCartTotal([], 0), 0);
});
test('sends only product identifiers and valid whole quantities to Supabase', () => {
  assert.deepEqual(toCartPayload([{ id: 7, quantity: '2.8', name: 'Ignore me' }]), [{ product_id: 7, quantity: 2 }]);
});
