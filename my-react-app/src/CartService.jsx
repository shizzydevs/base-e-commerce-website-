import { supabase } from './supabaseClient';
import { DELIVERY_FEE } from './cartUtils';

/**
 * Fetches saved cart items for a given user ID
 */
export async function fetchUserCart(userId) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('quantity, products(*)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user cart:', error);
    throw error;
  }

  return (data || []).map((item) => ({
    ...item.products,
    quantity: item.quantity,
  }));
}

/**
 * Synchronizes the frontend local cart state with Supabase cart_items table
 */
export async function syncUserCart(cart) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // 1. Clear existing cart items for the user
  const { error: deleteError } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id);

  if (deleteError) {
    console.error('Error clearing cart items:', deleteError);
    throw deleteError;
  }

  // 2. Insert new cart items if array contains products
  if (cart && cart.length > 0) {
    const payload = cart.map((item) => ({
      user_id: user.id,
      product_id: item.id, // String UUID matching products.id
      quantity: item.quantity,
    }));

    const { error: insertError } = await supabase
      .from('cart_items')
      .insert(payload);

    if (insertError) {
      console.error('Error saving cart items:', insertError);
      throw insertError;
    }
  }
}

/**
 * Creates an order record and populates associated order items
 */
export async function createOrder(cartItems, shippingAddress, tipAmount = 0) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User must be logged in to place an order");

  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price_usd || item.price) * item.quantity), 0);
  const tip = Number(tipAmount) || 0;
  const totalAmount = subtotal + DELIVERY_FEE + tip;

  // 1. Create entry in orders table
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

  if (orderError) {
    console.error('Error creating order:', orderError);
    throw orderError;
  }

  // 2. Create entries in order_items table using UUID product_id
  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.id, // String UUID matching products.id
    quantity: item.quantity,
    price: Number(item.price_usd || item.price),
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Error inserting order items:', itemsError);
    throw itemsError;
  }

  // 3. Clear database cart upon successful order
  await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id);

  return order;
}