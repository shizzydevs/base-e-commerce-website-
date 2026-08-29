export const DELIVERY_FEE = 2.99;

export function calculateCartSubtotal(cart) {
  return cart.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity),
    0
  );
}

export function calculateCartTotal(cart, tipAmount = 0) {
  const deliveryFee = cart.length > 0 ? DELIVERY_FEE : 0;
  return calculateCartSubtotal(cart) + deliveryFee + tipAmount;
}

export function toCartPayload(cart) {
  return cart.map(({ id, quantity }) => ({
    product_id: id,
    quantity: Math.max(1, Math.floor(Number(quantity) || 0)),
  }));
}
