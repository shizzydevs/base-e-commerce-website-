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
  Layers 
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
    <div className="min-h-screen bg-stone-950 text-stone-100 p-4 sm:p-6 lg:p-8 w-full relative overflow-hidden">
      {/* Landing Page Ambient Radial Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-emerald-950/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full space-y-6 relative z-10">
        {/* City Modal */}
        <CityModal isOpen={isCityModalOpen} onClose={() => setIsCityModalOpen(false)} />

        {/* Top Header & Location Switcher */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-800/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Lebanon Store Hub
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Compare products, prices, and ratings across online Lebanese stores.
            </p>
          </div>

          <button
            onClick={() => setIsCityModalOpen(true)}
            className="flex items-center gap-2 bg-stone-900/90 border border-stone-800 hover:border-emerald-500/50 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all text-stone-200 hover:text-white shrink-0 shadow-lg"
          >
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Location: <strong className="text-emerald-400">{currentCity?.name || 'Select City'}</strong></span>
          </button>
        </header>

        {/* Category Horizontal Filter Bar */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none w-full">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border ${
              selectedCategory === null
                ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-lg shadow-emerald-500/10'
                : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-white hover:border-stone-700'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">All Categories</span>
          </button>

          {categories.map((cat) => {
            const IconComponent = CATEGORY_ICONS[cat.icon_name] || Layers;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                  isSelected
                    ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-lg shadow-emerald-500/10'
                    : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-white hover:border-stone-700'
                }`}
              >
                <IconComponent className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Sort & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-stone-900/40 backdrop-blur-md p-4 border border-stone-800/80 rounded-2xl">
          <div className="flex items-center gap-2 text-xs text-stone-400 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-emerald-400 shrink-0" />
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
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  sortBy === option.id
                    ? 'bg-stone-800 text-emerald-400 border-emerald-500/50 shadow-sm'
                    : 'bg-stone-950/40 border-stone-800/80 text-stone-400 hover:text-stone-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Display Grid */}
        {loading ? (
          <div className="py-20 text-center text-stone-500 text-sm font-semibold">
            Loading items for {currentCity?.name}...
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center bg-stone-900/30 border border-stone-800 rounded-3xl p-8">
            <p className="text-stone-400 text-sm font-semibold mb-2">
              No items found for {currentCity?.name} in this category.
            </p>
            <p className="text-xs text-stone-500">Try switching categories or locations to view options.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-stone-900/70 backdrop-blur-md border border-stone-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-stone-700 transition-all shadow-xl group"
              >
                <div>
                  {/* Store Header Info */}
                  <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-stone-800/80 text-xs">
                    <span className="font-bold text-stone-300 truncate">{product.stores.name}</span>
                    {product.stores.website_url && (
                      <a
                        href={product.stores.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold text-[11px] shrink-0"
                      >
                        Visit Store <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Product Image Holder */}
                  {product.image_url ? (
                    <div className="h-48 w-full bg-stone-950 rounded-xl mb-4 overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-stone-950/80 rounded-xl mb-4 flex items-center justify-center text-stone-600 text-xs font-bold border border-stone-800/60">
                      No Image Available
                    </div>
                  )}

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-white mb-1 line-clamp-1">{product.title}</h3>
                  <p className="text-xs text-stone-400 line-clamp-2 mb-4 min-h-[32px]">{product.description}</p>
                </div>

                {/* Badges & Metrics */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-4">
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
                      <span className="text-xl font-black text-emerald-400">${product.price_usd}</span>
                      {product.price_lbp && (
                        <span className="text-[11px] text-stone-400 block font-semibold">
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