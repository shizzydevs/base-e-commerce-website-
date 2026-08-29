import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { ShoppingCart, Search, MapPin, Heart, Sparkles, Filter, Plus, Minus, Eye, X, LogOut } from 'lucide-react';

const CATEGORIES = ['All', 'Produce', 'Bakery', 'Dairy', 'Artisanal'];

export default function Home({ user, onLogout, cart, setCart, onOpenCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching products from Supabase:', error.message);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.producer.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

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

  const toggleFavorite = (productId) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const totalCartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans relative overflow-hidden">

      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="sticky top-0 z-40 bg-stone-900/80 backdrop-blur-xl border-b border-stone-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 text-white p-2 rounded-xl shadow-lg shadow-emerald-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Local<span className="text-emerald-400">Harvest</span>Hub
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <MapPin className="w-3.5 h-3.5" />
              <span>Downtown Radius (5mi)</span>
            </div>

            <button
              onClick={onOpenCart}
              className="relative p-2.5 bg-stone-800 hover:bg-stone-700 rounded-xl transition-colors text-stone-300"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-stone-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {totalCartCount}
                </span>
              )}
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2.5 bg-stone-800/80 hover:bg-red-500/20 text-stone-400 hover:text-red-400 border border-stone-700/60 rounded-xl transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </nav>

      <header className="relative py-16 px-6 text-center max-w-4xl mx-auto space-y-6">
        <span className="inline-block px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">
          {user ? `Welcome back, ${user.name || user.email}!` : 'Directly from nearby farms & artisans'}
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
          Freshness Harvested <br />
          <span className="text-emerald-400">Right Around the Corner.</span>
        </h1>

        <div className="pt-2 max-w-xl mx-auto">
          <div className="relative flex items-center bg-stone-800/80 border border-stone-700 rounded-2xl overflow-hidden focus-within:border-emerald-400 transition-colors">
            <Search className="absolute left-4 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search sourdough, honey, fresh herbs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-stone-500 font-medium focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="pr-4 text-xs font-bold text-stone-500 hover:text-white">
                CLEAR
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-stone-500 mr-2" />
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-emerald-500 text-stone-950 font-bold shadow-lg shadow-emerald-500/20 scale-105'
                    : 'bg-stone-800/60 border border-stone-700/80 text-stone-300 hover:bg-stone-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <p className="text-xs font-semibold text-stone-500">
            Showing {filteredProducts.length} items
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-stone-800/40 rounded-2xl p-4 h-80 animate-pulse border border-stone-800 space-y-4">
                <div className="bg-stone-800 h-48 rounded-xl"></div>
                <div className="bg-stone-800 h-4 w-3/4 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-stone-800/30 rounded-3xl border border-dashed border-stone-800">
            <p className="text-stone-400 font-medium">No produce found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 text-xs font-bold text-emerald-400 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const isFav = favorites.includes(product.id);
              const cartItem = cart.find((item) => item.id === product.id);
              const itemQuantity = cartItem ? cartItem.quantity : 0;
              const productPrice = Number(product.price);

              return (
                <div
                  key={product.id}
                  className="group bg-stone-800/50 backdrop-blur-sm rounded-2xl border border-stone-700/60 overflow-hidden shadow-lg hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative overflow-hidden aspect-[4/3] bg-stone-900">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-stone-200 text-xs font-bold px-2.5 py-1 rounded-lg border border-stone-700/50">
                      {product.category}
                    </div>

                    {itemQuantity > 0 && (
                      <div className="absolute bottom-3 left-3 bg-emerald-500 text-stone-950 text-xs font-black px-2.5 py-1 rounded-lg shadow-md border border-emerald-400">
                        {itemQuantity} in basket
                      </div>
                    )}

                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-3 right-3 p-2 bg-stone-900/80 backdrop-blur-md rounded-full shadow-md text-stone-400 hover:text-red-400 border border-stone-700/50 transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium mb-1">
                        <MapPin className="w-3 h-3" />
                        <span>{product.distance}</span>
                      </div>
                      <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-stone-400 font-medium">by {product.producer}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-stone-700/50 flex items-center justify-between">
                      <span className="text-xl font-black text-white">
                        ${productPrice.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="p-2.5 bg-stone-700/50 hover:bg-stone-700 text-stone-200 rounded-xl transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {itemQuantity > 0 ? (
                          <div className="flex items-center gap-1.5 bg-stone-900 border border-emerald-500/40 p-1 rounded-xl shadow-md">
                            <button
                              onClick={() => handleUpdateQuantity(product.id, -1)}
                              className="p-1.5 hover:bg-stone-800 text-stone-300 hover:text-white rounded-lg transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-black text-emerald-400 px-1.5">
                              {itemQuantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(product.id, 1)}
                              className="p-1.5 hover:bg-stone-800 text-stone-300 hover:text-white rounded-lg transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-stone-950 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-500/20"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-800 border border-stone-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-stone-900/80 backdrop-blur-md rounded-full text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-56 object-cover" />
            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{selectedProduct.category}</span>
                <h2 className="text-2xl font-bold text-white">{selectedProduct.name}</h2>
                <p className="text-sm text-stone-400">Produced by {selectedProduct.producer} • {selectedProduct.distance}</p>
              </div>
              <p className="text-stone-300 text-sm leading-relaxed">
                Freshly sourced directly from local producers within your immediate radius to guarantee minimal transport time and maximum nutrient retention.
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-stone-700/60">
                <span className="text-2xl font-black text-white">${Number(selectedProduct.price).toFixed(2)}</span>
                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="bg-emerald-500 text-stone-950 font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-emerald-400 transition-colors"
                >
                  Add to Shopping Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}