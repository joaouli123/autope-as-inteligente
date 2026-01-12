import { supabase } from './supabaseClient';
import { PRODUCTS, STORES } from './mockData';
import { Product, Store } from '../types';

// Converts Snake_case from DB to CamelCase for frontend if needed, 
// but for simplicity we will map manually.

const getMockProductsWithStores = () => {
  return PRODUCTS.map(product => {
    const store = STORES.find(s => s.id === product.storeId);
    return { ...product, store };
  });
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=300&q=80';

export const dataService = {
  getProducts: async (): Promise<Product[]> => {
    try {
      // Check if URL is configured
      if (!supabase.supabaseUrl || supabase.supabaseUrl.includes('SUA_URL_AQUI')) {
        console.warn("Supabase URL not configured. Using Mock Data.");
        return getMockProductsWithStores();
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          store:stores(*)
        `);

      if (error) {
        // Specific check for table not found error code (42P01) or message
        if (error.code === '42P01' || error.message?.includes('Could not find the table')) {
            console.warn("Supabase tables not found. Using Mock Data.");
            return getMockProductsWithStores();
        }
        throw error;
      }
      
      if (!data || data.length === 0) return getMockProductsWithStores(); // Fallback if DB empty

      // Map DB response to Frontend Types
      return data.map((item: any) => {
        // Handle potential array return for relation (Supabase can return array for relations)
        const storeData = Array.isArray(item.store) ? item.store[0] : item.store;

        return {
          id: item.id,
          name: item.name,
          description: item.description,
          price: Number(item.price), // Ensure numeric type from DB
          category: item.category,
          imageUrl: item.image_url || DEFAULT_IMAGE, // Robust fallback for missing images
          storeId: item.store_id,
          store: storeData ? {
              id: storeData.id,
              name: storeData.name,
              rating: Number(storeData.rating),
              address: storeData.address,
              distance: storeData.distance
          } : undefined,
          compatibleModels: typeof item.compatible_models === 'string' 
            ? JSON.parse(item.compatible_models) 
            : (item.compatible_models || [])
        };
      });

    } catch (error: any) {
      const errorMessage = error.message || JSON.stringify(error);
      // Suppress 'table not found' errors from the client library (schema cache issues)
      if (errorMessage.includes('Could not find the table') || errorMessage.includes('schema cache')) {
         console.warn("Supabase tables not configured yet. Using Mock Data.");
         return getMockProductsWithStores();
      }

      console.error("Error fetching products from Supabase (falling back to mock):", errorMessage);
      return getMockProductsWithStores();
    }
  },

  getStores: async (): Promise<Store[]> => {
    try {
      if (!supabase.supabaseUrl || supabase.supabaseUrl.includes('SUA_URL_AQUI')) return STORES;

      const { data, error } = await supabase.from('stores').select('*');
      
      if (error) {
         if (error.code === '42P01' || error.message?.includes('Could not find the table')) {
             return STORES;
         }
         throw error;
      }
      
      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        rating: Number(item.rating),
        address: item.address,
        distance: item.distance
      }));
    } catch (error) {
      // Silent fail for stores, return mock
      return STORES;
    }
  }
};