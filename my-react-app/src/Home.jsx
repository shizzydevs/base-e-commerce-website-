import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Sparkles, SlidersHorizontal, Star, Store } from 'lucide-react';

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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-indigo-400 font-medium">
          <Sparkles className="w-6 h-6 animate-spin" /> Loading Local Harvest...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Ambient Radial Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Local Harvest Market
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Discover top-rated products from stores across Lebanon.
            </p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-sm text-gray-200 focus:outline-none cursor-pointer"
            >
              <option value="default" className="bg-zinc-900">Featured</option>
              <option value="price-low" className="bg-zinc-900">Price: Low to High</option>
              <option value="price-high" className="bg-zinc-900">Price: High to Low</option>
              <option value="rating" className="bg-zinc-900">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
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
              className="flex flex-col bg-zinc-900/80 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl hover:border-indigo-500/50 transition-all duration-300 group"
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
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-bold text-white">{item.rating || '4.8'}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    {item.categories?.name || 'General'}
                  </span>
                  <h2 className="text-base font-bold text-white mt-1.5 line-clamp-1 group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-sm text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                    {item.description || 'No description available.'}
                  </p>
                </div>

                {/* Footer / Pricing & Store */}
                <div className="pt-4 mt-4 border-t border-zinc-800 flex items-center justify-between">
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
                  <div className="flex items-center gap-1 text-zinc-400 text-xs bg-zinc-800/60 px-2.5 py-1 rounded-lg border border-zinc-700/50">
                    <Store className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="max-w-[100px] truncate">{item.stores?.name || 'Store'}</span>
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
    </div>
  );
}