import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useLocation } from './useLocation';
import CityModal from './CityModal';
import { 
  MapPin, 
  ArrowUpDown, 
  ExternalLink, 
  Star, 
  ShoppingBag, 
  Cookie, 
  Coffee, 
  Smartphone, 
  Layers,
  Search,
  X,
  Plus,
  LogOut,
  User as UserIcon
} from 'lucide-react';

const CATEGORY_ICONS = {
  ShoppingBag,
  Cookie,
  Coffee,
  Smartphone,
};

export default function Home({ user, cart, setCart, onOpenCart, onLogout, onOpenAuth }) {
  const { cities, selectedCity } = useLocation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('quality');
  const [loading, setLoading] = useState(true);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const currentCity = cities.find((c) => c.id === selectedCity);
  const totalCartCount = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;

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

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prevCart,
        {
          id: product.id,
          name: product.title,
          price: product.price_usd,
          producer: product.stores?.name || 'Local Store',
          image: product.image_url,
          quantity: 1,
        },
      ];
    });
  };

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const matchesTitle = product.title?.toLowerCase().includes(query);
    const matchesDescription = product.description?.toLowerCase().includes(query);
    const matchesStore = product.stores?.name?.toLowerCase().includes(query);
    const matchesCategory = product.categories?.name?.toLowerCase().includes(query);

    return matchesTitle || matchesDescription || matchesStore || matchesCategory;
  });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-4 sm:p-6 lg:p-8 w-full relative overflow-hidden">
      <CityModal isOpen={isCityModalOpen} onClose={() => setIsCityModalOpen(false)} />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-800/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Local<span className="text-emerald-400">Harvest</span>Hub
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Fresh produce & local goods delivered from farms near you.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="flex items-center gap-2 bg-stone-900 border border-stone-800 hover:border-emerald-500/50 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-stone-200"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{currentCity?.name || 'Select City'}</span>
            </button>

            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/10"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Basket</span>
              {totalCartCount > 0 && (
                <span className="bg-stone-950 text-emerald-400 text-[10px] font-black rounded-full px-1.5 py-0.5 ml-1">
                  {totalCartCount}
                </span>
              )}
            </button>

            {user ? (
              <button
                onClick={onLogout}
                className="p-2.5 bg-stone-900 border border-stone-800 text-stone-400 hover:text-white rounded-xl transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 text-xs font-bold text-stone-300 hover:text-white bg-stone-900 border border-stone-800 px-3.5 py-2.5 rounded-xl transition-all"
              >
                <UserIcon className="w-4 h-4" /> Sign In
              </button>
            )}
          </div>
        </header>

        <div className="relative w-full">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-stone-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search products, stores, or categories in ${currentCity?.name || 'your area'}...`}
              className="w-full bg-stone-900/80 border border-stone-800 rounded-2xl pl-12 pr-10 py-3.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500/60 transition-all backdrop-blur-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 text-stone-500 hover:text-stone-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none w-full">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border ${
              selectedCategory === null
                ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-md'
                : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>All Categories</span>
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
                    ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-md'
                    : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                <IconComponent className="w-4 h-4 shrink-0" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-stone-900/40 backdrop-blur-md p-4 border border-stone-800/80 rounded-2xl">
          <div className="flex items-center gap-2 text-xs text-stone-400 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">Sort By:</span>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {[
              { id: 'quality', label: 'Best Quality' },
              { id: 'price_low', label: 'Price: Low to High' },
              { id: 'price_high', label: 'Price: High to Low' },
              { id: 'top_rated', label: 'Highest Rated' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setSortBy(option.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  sortBy === option.id
                    ? 'bg-stone-800 text-emerald-400 border-emerald-500/50'
                    : 'bg-stone-950/40 border-stone-800/80 text-stone-400 hover:text-stone-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-stone-900/40 border border-stone-800 rounded-2xl p-4 h-80 animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-stone-900/30 border border-stone-800 rounded-3xl p-8">
            <p className="text-stone-400 text-sm font-semibold mb-2">No items found.</p>
            <p className="text-xs text-stone-500">Try adjusting your search query or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-stone-900/70 backdrop-blur-md border border-stone-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-stone-700 transition-all shadow-xl group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-stone-800/80 text-xs">
                    <span className="font-bold text-stone-300 truncate">{product.stores?.name}</span>
                    {product.stores?.website_url && (
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

                  {product.image_url ? (
                    <div className="h-44 w-full bg-stone-950 rounded-xl mb-4 overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="h-44 w-full bg-stone-950/80 rounded-xl mb-4 flex items-center justify-center text-stone-600 text-xs font-bold border border-stone-800/60">
                      No Image
                    </div>
                  )}

                  <h3 className="text-base font-bold text-white mb-1 line-clamp-1">{product.title}</h3>
                  <p className="text-xs text-stone-400 line-clamp-2 mb-4 min-h-[32px]">{product.description}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-4">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
                      {product.rating}
                    </span>
                    <span className="text-stone-400 font-medium text-[11px]">
                      Quality: <strong className="text-emerald-400">{product.quality_score}%</strong>
                    </span>
                  </div>

                  <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-xl font-black text-emerald-400">${product.price_usd}</span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-stone-950 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
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