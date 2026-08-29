import { supabase } from './supabaseClient';
import { DELIVERY_FEE } from './cartUtils';

export async function fetchUserCart(userId) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('quantity, products(*)')
    .eq('user_id', userId);

  if (error) throw error;

  return (data || []).map((item) => ({
    ...item.products,
    quantity: item.quantity,
  }));
}

export async function syncUserCart(cart) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Clear existing items for the user
  const { error: deleteError } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id);

  if (deleteError) {
    console.error('Failed to clear cart:', deleteError);
    throw deleteError;
  }

  // Insert new items if cart has content
  if (cart && cart.length > 0) {
    const payload = cart.map((item) => ({
      user_id: user.id,
      product_id: Number(item.id), // Ensures numeric parsing for bigint/integer columns
      quantity: item.quantity,
    }));

    const { error: insertError } = await supabase
      .from('cart_items')
      .insert(payload);

    if (insertError) {
      console.error('Failed to insert cart items:', insertError);
      throw insertError;
    }
  }
}

export async function createOrder(cartItems, shippingAddress, tipAmount) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User must be logged in to place an order");

  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const tip = Number(tipAmount) || 0;
  const totalAmount = subtotal + DELIVERY_FEE + tip;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([
      {
        user_id: user.id,
        shipping_address: shippingAddress.trim(),
        tip_amount: tip,
        total_amount: totalAmount,
        status: 'pending',
        payment_method: 'cash',
      },
    ])
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: Number(item.id),
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id);

  return order;
}