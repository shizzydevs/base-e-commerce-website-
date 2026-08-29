import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          stores ( name, website_url ),
          categories ( name )
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

  if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Loading products...</div>;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Local Harvest Market</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((item) => (
          <div 
            key={item.id} 
            className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 h-full"
          >
            {/* Image Container with fixed height and fallback handling */}
            <div className="w-full h-48 bg-gray-100 relative shrink-0">
              <img 
                src={item.image_url || PLACEHOLDER_IMAGE} 
                alt={item.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = PLACEHOLDER_IMAGE;
                }}
              />
            </div>

            {/* Content Details */}
            <div className="p-5 flex flex-col flex-1 justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  {item.categories?.name || 'General'}
                </span>
                <h2 className="text-base font-bold text-gray-900 mt-1 line-clamp-1">
                  {item.title}
                </h2>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {item.description || 'No description available.'}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-lg font-extrabold text-gray-900">
                  ${Number(item.price_usd).toFixed(2)}
                </span>
                <span className="text-xs font-semibold text-gray-500 truncate max-w-[120px] text-right">
                  {item.stores?.name || 'Store'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}