import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { fetchUserCart, syncUserCart } from './CartService';
import Welcome from './Welcome';
import Home from './Home';
import Cart from './Cart';
import AuthModal from './AuthModal';
import Payment from './Payment';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [cartError, setCartError] = useState(null);
  
  const cartRef = useRef([]);

  const loadSavedCart = async (userId) => {
    try {
      const savedCart = await fetchUserCart(userId);
      cartRef.current = savedCart;
      setCart(savedCart);
    } catch {
      setCartError('Could not load your cart. Please try again.');
    }
  };

  useEffect(() => {
    // Single unified Auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // 1. Immediately dismiss modal & navigate to home
          setIsAuthOpen(false);
          setCurrentScreen((prev) => (prev === 'welcome' ? 'home' : prev));

          // 2. Fetch cart in the background
          loadSavedCart(currentUser.id);
        } else if (event === 'SIGNED_OUT') {
          cartRef.current = [];
          setCart([]);
          setIsAuthOpen(false);
          setCurrentScreen('welcome');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSetCart = async (action) => {
    const previousCart = cartRef.current;
    const newCart = typeof action === 'function' ? action(previousCart) : action;
    cartRef.current = newCart;
    setCart(newCart);

    if (!user) return;

    setCartError(null);
    try {
      await syncUserCart(newCart);
    } catch {
      cartRef.current = previousCart;
      setCart(previousCart);
      setCartError('Your cart could not be saved. Please try again.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (currentScreen === 'welcome') {
    return (
      <>
        <Welcome onGetStarted={() => setIsAuthOpen(true)} />
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </>
    );
  }

  if (currentScreen === 'cart') {
    return (
      <Cart
        cart={cart}
        setCart={handleSetCart}
        error={cartError}
        onBackToStore={() => setCurrentScreen('home')}
        onProceedToCheckout={() => setCurrentScreen('payment')}
      />
    );
  }

  if (currentScreen === 'payment') {
    return (
      <Payment
        cart={cart}
        cartError={cartError}
        onBackToCart={() => setCurrentScreen('cart')}
        onOrderPlaced={() => {
          cartRef.current = [];
          setCart([]);
        }}
        onOrderSuccess={() => setCurrentScreen('home')}
      />
    );
  }

  return (
    <>
      <Home
        user={user}
        cart={cart}
        setCart={handleSetCart}
        onOpenCart={() => setCurrentScreen('cart')}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}