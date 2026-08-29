import { useState } from 'react';
import { ArrowLeft, Banknote, CreditCard, CheckCircle2, HeartHandshake, ShieldCheck } from 'lucide-react';
import { createOrder } from './CartService';
import { calculateCartSubtotal, calculateCartTotal, DELIVERY_FEE } from './cartUtils';

const TIP_OPTIONS = [0, 2, 3, 5];

export default function Payment({ cart, cartError, onBackToCart, onOrderPlaced, onOrderSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' or 'card'
  const [selectedTip, setSelectedTip] = useState(2);
  const [customTip, setCustomTip] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Mock Card Form State
  const [cardDetails, setCardDetails] = useState({ name: '', number: '', expiry: '', cvc: '' });

  const subtotal = calculateCartSubtotal(cart);
  const tipAmount = customTip !== '' ? Number(customTip) || 0 : selectedTip;
  const grandTotal = calculateCartTotal(cart, tipAmount);

  const processOrder = async () => {
    if (!address.trim()) return setError('Enter a delivery address before placing your order.');
    if (tipAmount < 0 || tipAmount > 100) return setError('Enter a tip between $0 and $100.');
    
    if (paymentMethod === 'card') {
      if (!cardDetails.name || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) {
        return setError('Please complete all card payment details.');
      }
    }

    setLoading(true);
    setError(null);
    try {
      await createOrder(cart, address, tipAmount);
      onOrderPlaced();
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || 'We could not place your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen w-full bg-stone-900 text-stone-100 flex items-center justify-center p-6">
        <div className="bg-stone-800 border border-stone-700 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-white">Order Confirmed!</h2>
          <p className="text-stone-400 text-sm">
            Your {paymentMethod === 'card' ? 'card' : 'cash-on-delivery'} order has been placed successfully.
          </p>
          <button
            onClick={onOrderSuccess}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-xl transition-colors"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-stone-900 text-stone-100 font-sans p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBackToCart}
          className="flex items-center gap-2 text-stone-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <section className="md:col-span-2 space-y-6">
            <h1 className="text-3xl font-black text-white">Checkout</h1>

            {(error || cartError) && (
              <div role="alert" className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl">
                {error || cartError}
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-400 uppercase">Select Payment Method</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Cash on Delivery Card */}
                <div
                  onClick={() => setPaymentMethod('cash')}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-stone-800 border-emerald-500 ring-1 ring-emerald-500'
                      : 'bg-stone-800/40 border-stone-700/60 hover:bg-stone-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Banknote className={`w-6 h-6 ${paymentMethod === 'cash' ? 'text-emerald-400' : 'text-stone-400'}`} />
                    <div>
                      <h2 className="font-bold text-white text-sm">Cash on Delivery</h2>
                      <p className="text-xs text-stone-400">Pay when your order arrives.</p>
                    </div>
                  </div>
                </div>

                {/* Credit / Debit Card Option */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-stone-800 border-emerald-500 ring-1 ring-emerald-500'
                      : 'bg-stone-800/40 border-stone-700/60 hover:bg-stone-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-emerald-400' : 'text-stone-400'}`} />
                    <div>
                      <h2 className="font-bold text-white text-sm">Debit / Credit Card</h2>
                      <p className="text-xs text-stone-400">Pay securely online.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Card Details Form (Only shown if Card is selected) */}
            {paymentMethod === 'card' && (
              <div className="bg-stone-800/40 border border-stone-700/60 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white">Card Details</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Cardholder Name"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Card Number (e.g. 4532 •••• •••• 8890)"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      className="bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="CVC"
                      value={cardDetails.cvc}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                      className="bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Courier Tip Block */}
            <div className="bg-stone-800/40 border border-stone-700/60 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-400" />
                <h2 className="font-bold text-white">Add Courier Tip</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {TIP_OPTIONS.map((tip) => (
                  <button
                    key={tip}
                    type="button"
                    onClick={() => {
                      setSelectedTip(tip);
                      setCustomTip('');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedTip === tip && customTip === ''
                        ? 'bg-emerald-500 text-stone-950'
                        : 'bg-stone-800 text-stone-300 border border-stone-700 hover:bg-stone-700'
                    }`}
                  >
                    {tip === 0 ? 'No Tip' : `$${tip}`}
                  </button>
                ))}
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  inputMode="decimal"
                  aria-label="Custom courier tip"
                  placeholder="Custom"
                  value={customTip}
                  onChange={(e) => {
                    setCustomTip(e.target.value);
                    setSelectedTip(null);
                  }}
                  className="w-28 bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 text-center"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-2 pt-2">
              <label htmlFor="delivery-address" className="text-xs font-bold text-stone-400 uppercase">
                Delivery Address
              </label>
              <textarea
                id="delivery-address"
                required
                rows="3"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, building, apartment, city, and delivery notes"
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </section>

          {/* Sidebar Order Summary */}
          <aside className="bg-stone-800/60 border border-stone-700/80 rounded-2xl p-6 h-fit space-y-4">
            <h2 className="font-bold text-lg text-white">Order Summary</h2>
            <div className="space-y-2 text-sm text-stone-400 border-b border-stone-700/60 pb-4">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Local Delivery Fee</span>
                <span className="text-white">${cart.length ? DELIVERY_FEE.toFixed(2) : '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span>Courier Tip</span>
                <span className="text-emerald-400">+${tipAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-black text-white pt-2">
              <span>Total</span>
              <span className="text-emerald-400">${grandTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={processOrder}
              disabled={loading || cart.length === 0}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? 'Placing Order...' : paymentMethod === 'card' ? 'Pay with Card' : 'Place Cash Order'}
            </button>
            <div className="flex items-center justify-center gap-1.5 text-xs text-stone-500 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Prices are verified securely at checkout</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}