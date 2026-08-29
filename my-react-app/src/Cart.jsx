import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, ShieldCheck } from 'lucide-react';
import { calculateCartSubtotal, DELIVERY_FEE } from './cartUtils';

export default function Cart({ cart, setCart, error, onBackToStore, onProceedToCheckout }) {
  const handleUpdateQuantity = (productId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveItem = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const subtotal = calculateCartSubtotal(cart);
  const deliveryFee = cart.length > 0 ? DELIVERY_FEE : 0;
  const grandTotal = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 sm:pb-6">
          <button
            onClick={onBackToStore}
            className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors text-xs sm:text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </button>

          {cart.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
            >
              Clear Basket
            </button>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
          <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" /> Your Produce Cart
        </h1>

        {error && (
          <div role="alert" className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl">
            {error}
          </div>
        )}

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-stone-800/30 rounded-3xl border border-dashed border-stone-800 space-y-4">
            <p className="text-stone-400 font-medium">Your cart is currently empty.</p>
            <button
              onClick={onBackToStore}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-xl transition-colors text-sm"
            >
              Browse Local Goods
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const itemPrice = Number(item.price);
                const itemTotal = itemPrice * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between bg-stone-800/60 border border-stone-700/60 p-4 rounded-2xl gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl bg-stone-900 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm sm:text-base truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs text-stone-400 truncate">
                          by {item.producer}
                        </p>
                        <span className="text-xs font-semibold text-emerald-400 mt-1 block">
                          ${itemPrice.toFixed(2)} each
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-stone-700/50">
                      <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-700 p-1 rounded-xl">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="p-1.5 hover:bg-stone-800 text-stone-300 hover:text-white rounded-lg transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-black text-emerald-400 px-2">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="p-1.5 hover:bg-stone-800 text-stone-300 hover:text-white rounded-lg transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right w-20">
                        <span className="font-bold text-white text-sm block">
                          ${itemTotal.toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-stone-500 hover:text-red-400 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-stone-800/60 border border-stone-700/80 rounded-2xl p-6 h-fit space-y-4">
              <h2 className="font-bold text-lg text-white">Cart Summary</h2>

              <div className="space-y-2 text-sm text-stone-400 border-b border-stone-700/60 pb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="text-white">${deliveryFee.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-black text-white pt-2">
                <span>Total</span>
                <span className="text-emerald-400">${grandTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
              >
                Proceed to Checkout
              </button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-stone-500 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Local Producer Direct Guarantee</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}