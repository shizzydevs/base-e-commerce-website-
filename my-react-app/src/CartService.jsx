import { supabase } from './supabaseClient';
import { toCartPayload } from './cartUtils';

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
  // Get current logged-in user session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // 1. Delete existing cart items for this user
  const { error: deleteError } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id);

  if (deleteError) throw deleteError;

  // 2. Insert new cart items if cart isn't empty
  if (cart && cart.length > 0) {
    const payload = cart.map((item) => ({
      user_id: user.id,
      product_id: item.id,
      quantity: item.quantity,
    }));

    const { error: insertError } = await supabase
      .from('cart_items')
      .insert(payload);

    if (insertError) throw insertError;
  }
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
