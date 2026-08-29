-- Run in Supabase SQL Editor. products must have id, name, price, category, producer, distance, image.
create table if not exists public.cart_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity between 1 and 99),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete restrict,
  total_amount numeric(12,2) not null check (total_amount >= 0),
  tip_amount numeric(12,2) not null default 0 check (tip_amount between 0 and 100),
  delivery_fee numeric(12,2) not null default 2.99 check (delivery_fee >= 0),
  payment_method text not null check (payment_method in ('cash_on_delivery')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled')),
  shipping_address text not null check (char_length(trim(shipping_address)) between 10 and 500),
  created_at timestamptz not null default now()
);
create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity between 1 and 99),
  price numeric(12,2) not null check (price >= 0),
  unique (order_id, product_id)
);

alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
do $$
declare policy_row record;
begin
  for policy_row in select schemaname, tablename, policyname from pg_policies where schemaname = 'public' and tablename in ('products', 'cart_items', 'orders', 'order_items') loop
    execute format('drop policy if exists %I on %I.%I', policy_row.policyname, policy_row.schemaname, policy_row.tablename);
  end loop;
end;
$$;
drop policy if exists "Anyone can view products" on public.products;
create policy "Anyone can view products" on public.products for select using (true);
drop policy if exists "Users view own cart" on public.cart_items;
create policy "Users view own cart" on public.cart_items for select using (auth.uid() = user_id);
drop policy if exists "Users view own orders" on public.orders;
create policy "Users view own orders" on public.orders for select using (auth.uid() = user_id);
drop policy if exists "Users view own order items" on public.order_items;
create policy "Users view own order items" on public.order_items for select using (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));

-- No direct write policies: only the guarded functions below can mutate carts/orders.
create or replace function public.replace_cart(p_items jsonb) returns void language plpgsql security definer set search_path = public as $$
declare item jsonb; product bigint; item_quantity integer;
begin
  if auth.uid() is null then raise exception 'Authentication is required'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 100 then raise exception 'Cart must contain between 0 and 100 items'; end if;
  delete from public.cart_items where user_id = auth.uid();
  for item in select value from jsonb_array_elements(p_items) loop
    product := (item->>'product_id')::bigint; item_quantity := (item->>'quantity')::integer;
    if item_quantity not between 1 and 99 then raise exception 'Invalid item quantity'; end if;
    if not exists (select 1 from public.products where id = product) then raise exception 'Product not found'; end if;
    insert into public.cart_items (user_id, product_id, quantity) values (auth.uid(), product, item_quantity);
  end loop;
end;
$$;

create or replace function public.place_cash_order(p_items jsonb, p_shipping_address text, p_tip_amount numeric) returns public.orders language plpgsql security definer set search_path = public as $$
declare item jsonb; product bigint; item_quantity integer; product_price numeric(12,2); subtotal numeric(12,2) := 0; new_order public.orders;
begin
  if auth.uid() is null then raise exception 'Authentication is required'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 100 then raise exception 'Cart is empty or too large'; end if;
  if char_length(trim(coalesce(p_shipping_address, ''))) not between 10 and 500 then raise exception 'Invalid delivery address'; end if;
  if coalesce(p_tip_amount, 0) not between 0 and 100 then raise exception 'Invalid tip'; end if;
  for item in select value from jsonb_array_elements(p_items) loop
    product := (item->>'product_id')::bigint; item_quantity := (item->>'quantity')::integer;
    if item_quantity not between 1 and 99 then raise exception 'Invalid item quantity'; end if;
    select price into product_price from public.products where id = product;
    if product_price is null then raise exception 'Product not found'; end if;
    subtotal := subtotal + product_price * item_quantity;
  end loop;
  insert into public.orders (user_id, total_amount, tip_amount, delivery_fee, payment_method, shipping_address)
  values (auth.uid(), subtotal + 2.99 + coalesce(p_tip_amount, 0), coalesce(p_tip_amount, 0), 2.99, 'cash_on_delivery', trim(p_shipping_address)) returning * into new_order;
  for item in select value from jsonb_array_elements(p_items) loop
    product := (item->>'product_id')::bigint; item_quantity := (item->>'quantity')::integer;
    select price into product_price from public.products where id = product;
    insert into public.order_items (order_id, product_id, quantity, price) values (new_order.id, product, item_quantity, product_price);
  end loop;
  delete from public.cart_items where user_id = auth.uid();
  return new_order;
end;
$$;
revoke all on function public.replace_cart(jsonb) from public;
grant execute on function public.replace_cart(jsonb) to authenticated;
revoke all on function public.place_cash_order(jsonb, text, numeric) from public;
grant execute on function public.place_cash_order(jsonb, text, numeric) to authenticated;
