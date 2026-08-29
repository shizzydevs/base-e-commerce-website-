import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useLocation } from './useLocation';
import CityModal from './CityModal';
import { 
  MapPin, 
  ArrowUpDown, 
  ExternalLink, 
  Star, 
  Flame, 
  ShoppingBag, 
  Cookie, 
  Coffee, 
  Smartphone, 
  Layers,
  Sparkles
} from 'lucide-react';

const CATEGORY_ICONS = {
  ShoppingBag: ShoppingBag,
  Cookie: Cookie,
  Flame: Flame,
  Coffee: Coffee,
  Smartphone: Smartphone,
};

export default function Home() {
  const { cities, selectedCity } = useLocation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('quality');
  const [loading, setLoading] = useState(true);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const currentCity = cities.find((c) => c.id === selectedCity);

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (!error && data) setCategories(data);
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      if (!selectedCity) return;
      setLoading(true);

      let query = supabase
        .from('products')
        .select(`
          *,
          stores!inner(name, city_id, website_url, app_link, logo_url, delivery_available),
          categories(name)
        `)
        .eq('stores.city_id', selectedCity);

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      switch (sortBy) {
        case 'quality':
          query = query.order('quality_score', { ascending: false });
          break;
        case 'price_low':
          query = query.order('price_usd', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price_usd', { ascending: false });
          break;
        case 'most_bought':
          query = query.order('sales_count', { ascending: false });
          break;
        case 'top_rated':
          query = query.order('rating', { ascending: false });
          break;
        default:
          query = query.order('quality_score', { ascending: false });
      }

      const { data, error } = await query;
      if (!error && data) setProducts(data);
      setLoading(false);
    }

    fetchProducts();
  }, [selectedCity, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-4 sm:p-6 lg:p-8 w-full max-w-none relative overflow-hidden selection:bg-emerald-500/30">
      {/* Background Ambient Glow FX */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* City Modal */}
        <CityModal isOpen={isCityModalOpen} onClose={() => setIsCityModalOpen(false)} />

        {/* Top Header & Location Switcher */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-800/80 backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white bg-gradient-to-r from-white via-stone-200 to-stone-400 bg-clip-text text-transparent">
                Lebanon Store Hub
              </h1>
              <Sparkles className="w-5 h-5 text-emerald-400 animate-bounce" />
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Compare products, prices, and ratings across online Lebanese stores.
            </p>
          </div>

          <button
            onClick={() => setIsCityModalOpen(true)}
            className="group flex items-center gap-2.5 bg-stone-900/90 hover:bg-stone-900 border border-stone-800 hover:border-emerald-500/40 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 shadow-lg hover:shadow-emerald-500/10 active:scale-95 shrink-0"
          >
            <MapPin className="w-4 h-4 text-emerald-400 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" />
            <span>Location: <strong className="text-emerald-400 group-hover:underline">{currentCity?.name || 'Select City'}</strong></span>
          </button>
        </header>

        {/* Category Horizontal Filter Bar */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none w-full py-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all duration-300 border backdrop-blur-md active:scale-95 ${
              selectedCategory === null
                ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-lg shadow-emerald-500/25 scale-[1.02]'
                : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-white hover:border-stone-700 hover:bg-stone-900'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:rotate-6" />
            <span className="whitespace-nowrap">All Categories</span>
          </button>

          {categories.map((cat) => {
            const IconComponent = CATEGORY_ICONS[cat.icon_name] || Layers;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all duration-300 border backdrop-blur-md active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-lg shadow-emerald-500/25 scale-[1.02]'
                    : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-white hover:border-stone-700 hover:bg-stone-900'
                }`}
              >
                <IconComponent className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Sort & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-stone-900/40 backdrop-blur-md p-4 border border-stone-800/80 rounded-2xl shadow-inner">
          <div className="flex items-center gap-2 text-xs text-stone-400 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
            <span className="font-semibold tracking-wide">Sort Feed By:</span>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {[
              { id: 'quality', label: 'Best Quality' },
              { id: 'price_low', label: 'Price: Low to High' },
              { id: 'price_high', label: 'Price: High to Low' },
              { id: 'most_bought', label: 'Most Bought' },
              { id: 'top_rated', label: 'Highest Rated' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setSortBy(option.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 border active:scale-95 ${
                  sortBy === option.id
                    ? 'bg-stone-800 text-emerald-400 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                    : 'bg-stone-950/40 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Display Grid */}
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-stone-400 text-xs font-semibold tracking-wide">Fetching items for {currentCity?.name}...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center bg-stone-900/20 border border-stone-800/80 rounded-3xl p-8 backdrop-blur-sm">
            <p className="text-stone-300 text-sm font-semibold mb-1">No items found for {currentCity?.name} in this category.</p>
            <p className="text-xs text-stone-500">Try selecting a different category or switching cities.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group relative bg-stone-900/60 hover:bg-stone-900/90 border border-stone-800/80 hover:border-stone-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/5"
              >
                <div>
                  {/* Store Header Info */}
                  <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-stone-800/80 text-xs">
                    <span className="font-bold text-stone-300 truncate tracking-wide">{product.stores.name}</span>
                    {product.stores.website_url && (
                      <a
                        href={product.stores.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold text-[11px] shrink-0 transition-colors group/link"
                      >
                        Visit Store <ExternalLink className="w-3 h-3 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                      </a>
                    )}
                  </div>

                  {/* Product Image Holder */}
                  {product.image_url ? (
                    <div className="h-48 w-full bg-stone-950 rounded-xl mb-4 overflow-hidden relative">
                      <img 
                        src={product.image_url} 
                        alt={product.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-stone-950/70 rounded-xl mb-4 flex items-center justify-center text-stone-600 text-xs font-bold border border-stone-800/60 group-hover:border-stone-700/60 transition-colors">
                      No Image Available
                    </div>
                  )}

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-white mb-1.5 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-xs text-stone-400 line-clamp-2 mb-4 min-h-[32px] leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Badges & Metrics */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-4 bg-stone-950/40 px-3 py-2 rounded-xl border border-stone-800/40">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
                      {product.rating}
                    </span>
                    <span className="text-stone-400 font-medium text-[11px]">
                      Quality: <strong className="text-emerald-400">{product.quality_score}%</strong>
                    </span>
                    <span className="text-stone-400 font-medium text-[11px]">
                      Sold: <strong className="text-stone-200">{product.sales_count}</strong>
                    </span>
                  </div>

                  {/* Pricing Display */}
                  <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-xl font-black text-emerald-400 tracking-tight">${product.price_usd}</span>
                      {product.price_lbp && (
                        <span className="text-[11px] text-stone-400 block font-semibold mt-0.5">
                          {Number(product.price_lbp).toLocaleString()} LBP
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}