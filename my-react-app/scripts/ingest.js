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
  // Existing Electronics & Groceries
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
  },

  // New Additions: Electronics & Appliances
  {
    store_name: "Abed Tahan",
    city_name: "Beirut",
    website_url: "https://abedtahan.com",
    category_name: "Electronics & Gadgets",
    title: "Espresso Coffee Machine",
    description: "15-bar pump pressure espresso maker with milk frother wand.",
    price_usd: 145.00,
    price_lbp: 12977500,
    rating: 4.6,
    quality_score: 92,
    sales_count: 140,
    image_url: "https://images.unsplash.com/photo-1517668808822-9e4288246ede?auto=format&fit=crop&w=600&q=80"
  },
  {
    store_name: "Virgin Megastore",
    city_name: "Beirut",
    website_url: "https://virginmegastore.com.lb",
    category_name: "Electronics & Gadgets",
    title: "Wireless Over-Ear Noise-Canceling Headphones",
    description: "Active noise cancellation with 30-hour battery life and deep bass.",
    price_usd: 199.99,
    price_lbp: 17899105,
    rating: 4.7,
    quality_score: 95,
    sales_count: 215,
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
  },

  // New Additions: Supermarkets & Groceries
  {
    store_name: "Spinneys",
    city_name: "Jounieh",
    website_url: "https://spinneys-lebanon.com",
    category_name: "Groceries",
    title: "Raw Wildflower Honey 500g",
    description: "100% natural unfiltered honey harvested from Mount Lebanon floral fields.",
    price_usd: 18.00,
    price_lbp: 1611000,
    rating: 4.9,
    quality_score: 99,
    sales_count: 520,
    image_url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80"
  },
  {
    store_name: "Spinneys",
    city_name: "Jounieh",
    website_url: "https://spinneys-lebanon.com",
    category_name: "Groceries",
    title: "Roasted Lebanese Coffee Grounds 250g",
    description: "Traditional dark roast ground coffee blended with aromatic cardamom.",
    price_usd: 6.50,
    price_lbp: 581750,
    rating: 4.8,
    quality_score: 94,
    sales_count: 890,
    image_url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80"
  },

  // New Additions: Fashion & Beauty
  {
    store_name: "Feel22",
    city_name: "Byblos",
    website_url: "https://feel22.com",
    category_name: "Beauty & Personal Care",
    title: "Hydrating Facial Serum 30ml",
    description: "Hyaluronic acid serum for intense skin moisture and radiance booster.",
    price_usd: 24.00,
    price_lbp: 2148000,
    rating: 4.7,
    quality_score: 93,
    sales_count: 410,
    image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80"
  },
  {
    store_name: "GS Stores",
    city_name: "Tripoli",
    website_url: "https://gs.com.lb",
    category_name: "Fashion & Apparel",
    title: "Classic Denim Jacket",
    description: "100% cotton vintage washed denim jacket with button closure.",
    price_usd: 65.00,
    price_lbp: 5817500,
    rating: 4.5,
    quality_score: 90,
    sales_count: 175,
    image_url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80"
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
    const citySlug = slugify(item.city_name);
    const storeSlug = slugify(item.store_name);
    const categorySlug = slugify(item.category_name);

    // 1. Get or Create City (check by slug OR name)
    let { data: city } = await supabase.from('cities').select('id').or(`slug.eq.${citySlug},name.ilike.${item.city_name}`).maybeSingle();
    if (!city) {
      const { data: newCity, error: cityErr } = await supabase.from('cities').insert({ 
        name: item.city_name,
        slug: citySlug
      }).select().single();
      
      if (cityErr) {
        console.error(`❌ Error inserting city ${item.city_name}:`, cityErr.message);
        continue;
      }
      city = newCity;
    }

    // 2. Get or Create Store (check by slug OR name)
    let { data: store } = await supabase.from('stores').select('id').or(`slug.eq.${storeSlug},name.ilike.${item.store_name}`).maybeSingle();
    if (!store) {
      const { data: newStore, error: storeErr } = await supabase.from('stores').insert({
        name: item.store_name,
        slug: storeSlug,
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

    // 3. Get or Create Category (check by slug OR name)
    let { data: category } = await supabase.from('categories').select('id').or(`slug.eq.${categorySlug},name.ilike.${item.category_name}`).maybeSingle();
    if (!category) {
      const { data: newCategory, error: catErr } = await supabase.from('categories').insert({ 
        name: item.category_name,
        slug: categorySlug
      }).select().single();

      if (catErr) {
        console.error(`❌ Error inserting category ${item.category_name}:`, catErr.message);
        continue;
      }
      category = newCategory;
    }

    // 4. Upsert Product Record
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