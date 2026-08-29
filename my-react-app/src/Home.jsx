import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

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

  if (loading) return <div className="p-6 text-center text-gray-500">Loading products...</div>;

  return (
    <main className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Local Harvest Market</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((item) => (
          <div key={item.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
            <img 
              src={item.image_url} 
              alt={item.title} 
              className="w-full h-48 object-cover"
            />
            <div className="p-4 flex flex-col justify-between h-52">
              <div>
                <span className="text-xs font-semibold uppercase text-indigo-600">
                  {item.categories?.name || 'General'}
                </span>
                <h2 className="text-lg font-bold text-gray-800 line-clamp-1">{item.title}</h2>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
              </div>
              <div className="pt-2 border-t flex justify-between items-center text-sm">
                <span className="font-extrabold text-gray-900">${item.price_usd}</span>
                <span className="text-gray-500 text-xs font-medium">{item.stores?.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}