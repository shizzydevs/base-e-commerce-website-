import { supabase } from './supabaseClient';


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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User must be logged in to place an order");

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 2.99;
  const tip = Number(tipAmount) || 0;
  const totalAmount = subtotal + deliveryFee + tip;

  // 1. Create order record
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

  // 2. Insert order items
  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    quantity: item.quantity,
    price_at_purchase: item.price,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  // 3. Clear user's cart
  await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id);

  return order;
}
