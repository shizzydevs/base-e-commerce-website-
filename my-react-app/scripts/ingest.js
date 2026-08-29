import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const realStoreBatch = [
  {
    store_name: "Abed Tahan",
    city_name: "Beirut",
    website_url: "https://abedtahan.com",
    category_name: "Electronics & Gadgets",
    title: "Smart TV 55 Inch 4K UHD",
    description: "Ultra HD Smart LED TV with built-in Wi-Fi and HDR streaming.",
    price_usd: 399.00,
    price_lbp: 35710500,
    rating: 4.8,
    quality_score: 96,
    sales_count: 85,
    image_url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80"
  },
  {
    store_name: "Ishtari",
    city_name: "Beirut",
    website_url: "https://ishtari.com",
    category_name: "Groceries",
    title: "Organic Extra Virgin Olive Oil 1L",
    description: "Cold-pressed premium Lebanese olive oil from Koura groves.",
    price_usd: 12.50,
    price_lbp: 1118750,
    rating: 4.9,
    quality_score: 98,
    sales_count: 310,
    image_url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80"
  }
];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/-+/g, '-');
}

async function runIngestion() {
  console.log("🚀 Starting database ingestion script...");

  for (const item of realStoreBatch) {
    let { data: city } = await supabase.from('cities').select('id').eq('name', item.city_name).maybeSingle();
    if (!city) {
      const { data: newCity, error: cityErr } = await supabase.from('cities').insert({ 
        name: item.city_name,
        slug: slugify(item.city_name)
      }).select().single();
      
      if (cityErr) {
        console.error(`❌ Error inserting city ${item.city_name}:`, cityErr.message);
        continue;
      }
      city = newCity;
    }

    let { data: store } = await supabase.from('stores').select('id').eq('name', item.store_name).maybeSingle();
    if (!store) {
      const { data: newStore, error: storeErr } = await supabase.from('stores').insert({
        name: item.store_name,
        slug: slugify(item.store_name),
        city_id: city.id,
        website_url: item.website_url,
        delivery_available: true
      }).select().single();

      if (storeErr) {
        console.error(`❌ Error inserting store ${item.store_name}:`, storeErr.message);
        continue;
      }
      store = newStore;
    }

    let { data: category } = await supabase.from('categories').select('id').eq('name', item.category_name).maybeSingle();
    if (!category) {
      const { data: newCategory, error: catErr } = await supabase.from('categories').insert({ 
        name: item.category_name,
        slug: slugify(item.category_name)
      }).select().single();

      if (catErr) {
        console.error(`❌ Error inserting category ${item.category_name}:`, catErr.message);
        continue;
      }
      category = newCategory;
    }

    const { error: prodErr } = await supabase.from('products').upsert({
      store_id: store.id,
      category_id: category.id,
      title: item.title,
      description: item.description,
      price_usd: item.price_usd,
      price_lbp: item.price_lbp,
      rating: item.rating,
      quality_score: item.quality_score,
      sales_count: item.sales_count,
      image_url: item.image_url
    });

    if (prodErr) {
      console.error(`❌ Failed to insert product ${item.title}:`, prodErr.message);
    } else {
      console.log(`✅ Synced: ${item.title} (${item.store_name})`);
    }
  }

  console.log("🎉 Ingestion complete!");
}

runIngestion();