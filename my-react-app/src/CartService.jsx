import { supabase } from './supabaseClient';
import { toCartPayload } from './cart';

export async function fetchUserCart(userId) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('quantity, products(*)')
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return data.map((item) => ({
    ...item.products,
    quantity: item.quantity,
  }));
}

export async function syncUserCart(cart) {
  const { error } = await supabase.rpc('replace_cart', {
    p_items: toCartPayload(cart),
  });

  if (error) throw error;
}

export async function createOrder(cartItems, shippingAddress, tipAmount) {
  const { data, error } = await supabase.rpc('place_cash_order', {
    p_items: toCartPayload(cartItems),
    p_shipping_address: shippingAddress.trim(),
    p_tip_amount: Number(tipAmount) || 0,
  });

  if (error) throw error;
  return data;
}
