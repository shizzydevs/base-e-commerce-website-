import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Sparkles, SlidersHorizontal, Star, Store, Leaf } from 'lucide-react';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          stores ( name, website_url, city_id, cities ( name ) ),
          categories ( name, slug )
        `);

      if (error) {
        console.error('Error fetching products:', error.message);
      } else if (data) {
        // Deduplicate items by product ID
        const uniqueProducts = Array.from(
          new Map(data.map((item) => [item.id, item])).values()
        );
        setProducts(uniqueProducts);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  // Filter & Sort logic
  const filteredProducts = products.filter(item => {
    if (selectedCategory === 'All') return true;
    return item.categories?.name === selectedCategory;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price_usd - b.price_usd;
    if (sortBy === 'price-high') return b.price_usd - a.price_usd;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  const categories = ['All', ...new Set(products.map(p => p.categories?.name).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d110f] text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-emerald-400 font-medium">
          <Sparkles className="w-6 h-6 animate-spin" /> Loading Local Harvest Hub...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d110f] text-white relative overflow-hidden selection:bg-emerald-500 selection:text-black">
      {/* Ambient Emerald & Warm Glow Effects matching the original hero */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navigation / Header Bar */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Leaf className="w-5 h-5 text-black fill-black" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            LocalHarvest<span className="text-emerald-400">Hub</span>
          </span>
        </div>

        <button className="px-5 py-2 rounded-xl text-sm font-semibold bg-zinc-900 text-zinc-200 border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all shadow-sm">
          Sign In
        </button>
      </header>

      {/* Hero Banner Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-12 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium mb-6 shadow-inner">
          <Leaf className="w-3.5 h-3.5" />
          Connecting Neighborhoods to Nearby Farms
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          Taste the Freshness of <br />
          <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
            Your Local Community.
          </span>
        </h1>

        <p className="text-zinc-400 text-base md:text-lg mt-6 max-w-2xl mx-auto font-normal">
          Skip the long supply chain. Order artisanal bread, organic produce, and farm-fresh dairy straight from local producers within miles of your home.
        </p>
      </section>

      {/* Main Marketplace Content Section */}
      <main className="max-w-7xl mx-auto px-6 pb-20 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-t border-zinc-900 pt-10">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Explore Marketplace</h2>
            <p className="text-zinc-400 text-sm mt-0.5">Browse available items from verified regional vendors.</p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 rounded-xl px-4 py-2 shadow-sm">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-sm text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="default" className="bg-zinc-900">Featured Items</option>
              <option value="price-low" className="bg-zinc-900">Price: Low to High</option>
              <option value="price-high" className="bg-zinc-900">Price: High to Low</option>
              <option value="rating" className="bg-zinc-900">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((item) => (
            <div 
              key={item.id} 
              className="flex flex-col bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl hover:border-emerald-500/40 transition-all duration-300 group"
            >
              {/* Product Image */}
              <div className="w-full h-52 bg-zinc-950 relative overflow-hidden">
                <img 
                  src={item.image_url || PLACEHOLDER_IMAGE} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = PLACEHOLDER_IMAGE;
                  }}
                />
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10 shadow-md">
                  <Star className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  <span className="text-xs font-bold text-white">{item.rating || '4.8'}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    {item.categories?.name || 'General'}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5 line-clamp-1 group-hover:text-emerald-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                    {item.description || 'No description available.'}
                  </p>
                </div>

                {/* Footer / Pricing & Store */}
                <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-extrabold text-white">
                      ${Number(item.price_usd).toFixed(2)}
                    </span>
                    {item.price_lbp && (
                      <p className="text-[11px] text-zinc-500 font-medium">
                        {item.price_lbp.toLocaleString()} LBP
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-zinc-400 text-xs bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700/40">
                    <Store className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="max-w-[90px] truncate">{item.stores?.name || 'Store'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-lg">No products found in this category.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 text-center text-xs text-zinc-500">
        Local Harvest Hub © 2026 — Built for local growth.
      </footer>
    </div>
  );
}