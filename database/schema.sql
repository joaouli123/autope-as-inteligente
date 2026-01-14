-- =====================================================
-- Comprehensive Database Schema for AutoPeças Inteligente
-- =====================================================
-- Execute this in Supabase Dashboard → SQL Editor
-- This script is idempotent and can be run multiple times

-- =====================================================
-- 1. VEHICLE BRANDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vehicle_brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  fipe_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert 20 popular Brazilian car brands
INSERT INTO public.vehicle_brands (name, fipe_code) VALUES
  ('Chevrolet', '6'),
  ('Volkswagen', '59'),
  ('Fiat', '21'),
  ('Ford', '22'),
  ('Renault', '43'),
  ('Toyota', '56'),
  ('Honda', '26'),
  ('Hyundai', '27'),
  ('Nissan', '38'),
  ('Jeep', '28'),
  ('Peugeot', '41'),
  ('Citroën', '14'),
  ('Mitsubishi', '37'),
  ('Kia', '31'),
  ('Audi', '6'),
  ('BMW', '9'),
  ('Mercedes-Benz', '36'),
  ('Volvo', '60'),
  ('Land Rover', '32'),
  ('Chery', '12')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 2. VEHICLE MODELS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vehicle_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.vehicle_brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  fipe_code TEXT,
  year_start INTEGER,
  year_end INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_id, name)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_vehicle_models_brand_id ON public.vehicle_models(brand_id);

-- Insert popular models (examples for Chevrolet, VW, Fiat, Ford)
INSERT INTO public.vehicle_models (brand_id, name, year_start, year_end) 
SELECT 
  vb.id,
  model.name,
  model.year_start,
  model.year_end
FROM public.vehicle_brands vb
CROSS JOIN (
  SELECT 'Onix' as name, 2012 as year_start, NULL as year_end UNION ALL
  SELECT 'Celta', 2000, 2015 UNION ALL
  SELECT 'Prisma', 2006, NULL UNION ALL
  SELECT 'Cruze', 2011, NULL UNION ALL
  SELECT 'S10', 1995, NULL
) model
WHERE vb.name = 'Chevrolet'
ON CONFLICT (brand_id, name) DO NOTHING;

INSERT INTO public.vehicle_models (brand_id, name, year_start, year_end) 
SELECT 
  vb.id,
  model.name,
  model.year_start,
  model.year_end
FROM public.vehicle_brands vb
CROSS JOIN (
  SELECT 'Gol' as name, 1980 as year_start, NULL as year_end UNION ALL
  SELECT 'Polo', 2002, NULL UNION ALL
  SELECT 'Fox', 2003, 2021 UNION ALL
  SELECT 'Voyage', 2008, NULL UNION ALL
  SELECT 'T-Cross', 2019, NULL
) model
WHERE vb.name = 'Volkswagen'
ON CONFLICT (brand_id, name) DO NOTHING;

INSERT INTO public.vehicle_models (brand_id, name, year_start, year_end) 
SELECT 
  vb.id,
  model.name,
  model.year_start,
  model.year_end
FROM public.vehicle_brands vb
CROSS JOIN (
  SELECT 'Uno' as name, 1984 as year_start, NULL as year_end UNION ALL
  SELECT 'Palio', 1996, 2017 UNION ALL
  SELECT 'Strada', 1998, NULL UNION ALL
  SELECT 'Argo', 2017, NULL UNION ALL
  SELECT 'Toro', 2016, NULL
) model
WHERE vb.name = 'Fiat'
ON CONFLICT (brand_id, name) DO NOTHING;

INSERT INTO public.vehicle_models (brand_id, name, year_start, year_end) 
SELECT 
  vb.id,
  model.name,
  model.year_start,
  model.year_end
FROM public.vehicle_brands vb
CROSS JOIN (
  SELECT 'Fiesta' as name, 1996 as year_start, 2019 as year_end UNION ALL
  SELECT 'Focus', 2000, 2019 UNION ALL
  SELECT 'EcoSport', 2003, NULL UNION ALL
  SELECT 'Ka', 1997, NULL UNION ALL
  SELECT 'Ranger', 1998, NULL
) model
WHERE vb.name = 'Ford'
ON CONFLICT (brand_id, name) DO NOTHING;

-- =====================================================
-- 3. VEHICLE ENGINES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vehicle_engines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  displacement TEXT NOT NULL, -- 1.0, 1.4, 1.6, etc.
  valves INTEGER NOT NULL, -- 8, 12, 16
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert 16 common engine types
INSERT INTO public.vehicle_engines (name, displacement, valves) VALUES
  ('1.0 8V', '1.0', 8),
  ('1.0 12V', '1.0', 12),
  ('1.4 8V', '1.4', 8),
  ('1.4 16V', '1.4', 16),
  ('1.5 8V', '1.5', 8),
  ('1.5 16V', '1.5', 16),
  ('1.6 8V', '1.6', 8),
  ('1.6 16V', '1.6', 16),
  ('1.8 8V', '1.8', 8),
  ('1.8 16V', '1.8', 16),
  ('2.0 8V', '2.0', 8),
  ('2.0 16V', '2.0', 16),
  ('2.4 16V', '2.4', 16),
  ('2.5 16V', '2.5', 16),
  ('3.0 V6', '3.0', 24),
  ('3.6 V6', '3.6', 24)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 4. UPDATE PRODUCTS TABLE
-- =====================================================
-- Add part_code and position columns if they don't exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS part_code VARCHAR(50);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS position VARCHAR(50);

-- Create indexes for optimized searches
CREATE INDEX IF NOT EXISTS idx_products_part_code ON public.products(part_code);
CREATE INDEX IF NOT EXISTS idx_products_position ON public.products(position);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON public.products USING gin(to_tsvector('portuguese', name));
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products(store_id);

-- Update category column to allow longer names
ALTER TABLE public.products ALTER COLUMN category TYPE VARCHAR(100);

-- Drop old category constraint if exists
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;

-- Add new category constraint with 11 categories
ALTER TABLE public.products ADD CONSTRAINT products_category_check 
CHECK (category IN (
  'Acessórios',
  'Alinhamento e Balanceamento',
  'Bateria',
  'Escapamento',
  'Estofamento/Interior',
  'Lubrificantes',
  'Elétrica/Injeção',
  'Funilaria',
  'Mecânica',
  'Pneus',
  'Outros'
));

-- Drop old position constraint if exists
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_position_check;

-- Add position constraint with 6 positions
ALTER TABLE public.products ADD CONSTRAINT products_position_check 
CHECK (position IS NULL OR position IN (
  'Dianteiro Direito',
  'Dianteiro Esquerdo',
  'Traseiro Direito',
  'Traseiro Esquerdo',
  'Central',
  'Universal'
));

-- =====================================================
-- 5. PRODUCT COMPATIBILITY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.product_compatibility (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year_start INTEGER NOT NULL,
  year_end INTEGER,
  engine TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast compatibility lookups
CREATE INDEX IF NOT EXISTS idx_product_compatibility_product_id ON public.product_compatibility(product_id);
CREATE INDEX IF NOT EXISTS idx_product_compatibility_brand ON public.product_compatibility(brand);
CREATE INDEX IF NOT EXISTS idx_product_compatibility_model ON public.product_compatibility(model);
CREATE INDEX IF NOT EXISTS idx_product_compatibility_year ON public.product_compatibility(year_start, year_end);

-- =====================================================
-- 6. USER VEHICLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  engine TEXT,
  license_plate TEXT,
  nickname TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_vehicles_user_id ON public.user_vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vehicles_is_primary ON public.user_vehicles(user_id, is_primary);

-- =====================================================
-- 7. UPDATE STORES TABLE
-- =====================================================
-- Add city, state, and description columns if they don't exist
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS description TEXT;

-- Create indexes for location-based searches
CREATE INDEX IF NOT EXISTS idx_stores_city ON public.stores(city);
CREATE INDEX IF NOT EXISTS idx_stores_state ON public.stores(state);
CREATE INDEX IF NOT EXISTS idx_stores_is_active ON public.stores(is_active);

-- =====================================================
-- 8. INTELLIGENT SEARCH FUNCTION
-- =====================================================
-- Function to search products by partial name (starting letters)
CREATE OR REPLACE FUNCTION search_products_by_partial_name(search_term TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  price DECIMAL,
  category TEXT,
  part_code VARCHAR,
  position VARCHAR,
  store_id UUID,
  match_length INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.price,
    p.category,
    p.part_code,
    p.position,
    p.store_id,
    CASE 
      WHEN LOWER(p.name) LIKE LOWER(SUBSTRING(search_term FROM 1 FOR 7)) || '%' THEN 7
      WHEN LOWER(p.name) LIKE LOWER(SUBSTRING(search_term FROM 1 FOR 6)) || '%' THEN 6
      WHEN LOWER(p.name) LIKE LOWER(SUBSTRING(search_term FROM 1 FOR 5)) || '%' THEN 5
      WHEN LOWER(p.name) LIKE LOWER(SUBSTRING(search_term FROM 1 FOR 4)) || '%' THEN 4
      WHEN LOWER(p.name) LIKE LOWER(SUBSTRING(search_term FROM 1 FOR 3)) || '%' THEN 3
      WHEN LOWER(p.name) LIKE LOWER(SUBSTRING(search_term FROM 1 FOR 2)) || '%' THEN 2
      ELSE 0
    END as match_length
  FROM public.products p
  WHERE p.is_active = true
    AND (
      LOWER(p.name) LIKE LOWER(SUBSTRING(search_term FROM 1 FOR 7)) || '%' OR
      LOWER(p.name) LIKE LOWER(SUBSTRING(search_term FROM 1 FOR 6)) || '%' OR
      LOWER(p.name) LIKE LOWER(SUBSTRING(search_term FROM 1 FOR 5)) || '%' OR
      LOWER(p.name) LIKE LOWER(SUBSTRING(search_term FROM 1 FOR 4)) || '%' OR
      LOWER(p.name) LIKE LOWER(SUBSTRING(search_term FROM 1 FOR 3)) || '%' OR
      LOWER(p.name) LIKE LOWER(SUBSTRING(search_term FROM 1 FOR 2)) || '%'
    )
  ORDER BY match_length DESC, p.name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. VEHICLE COMPATIBILITY FUNCTION
-- =====================================================
-- Function to get products compatible with user's vehicle
CREATE OR REPLACE FUNCTION get_products_for_user_vehicle(
  p_user_id UUID
)
RETURNS TABLE (
  product_id UUID,
  product_name TEXT,
  price DECIMAL,
  category TEXT,
  store_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.name as product_name,
    p.price,
    p.category,
    s.name as store_name
  FROM public.products p
  INNER JOIN public.stores s ON p.store_id = s.id
  INNER JOIN public.product_compatibility pc ON p.id = pc.product_id
  INNER JOIN public.user_vehicles uv ON 
    LOWER(pc.brand) = LOWER(uv.brand) AND
    LOWER(pc.model) = LOWER(uv.model) AND
    uv.year >= pc.year_start AND
    (pc.year_end IS NULL OR uv.year <= pc.year_end)
  WHERE uv.user_id = p_user_id
    AND uv.is_primary = true
    AND p.is_active = true
    AND s.is_active = true
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. PRODUCTS FULL INFO VIEW
-- =====================================================
CREATE OR REPLACE VIEW products_full_info AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.category,
  p.sku,
  p.brand,
  p.model,
  p.price,
  p.stock_quantity,
  p.images,
  p.specifications,
  p.part_code,
  p.position,
  p.is_active,
  p.sales_count,
  p.created_at,
  p.updated_at,
  s.id as store_id,
  s.name as store_name,
  s.slug as store_slug,
  s.rating as store_rating,
  s.city as store_city,
  s.state as store_state,
  COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'brand', pc.brand,
          'model', pc.model,
          'year_start', pc.year_start,
          'year_end', pc.year_end,
          'engine', pc.engine
        )
      )
      FROM public.product_compatibility pc
      WHERE pc.product_id = p.id
    ),
    '[]'::json
  ) as compatibility_list
FROM public.products p
INNER JOIN public.stores s ON p.store_id = s.id
WHERE p.is_active = true AND s.is_active = true;

-- =====================================================
-- 11. ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Enable RLS on all tables
ALTER TABLE public.vehicle_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_engines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vehicles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vehicle_brands (public read)
DROP POLICY IF EXISTS "vehicle_brands_public_read" ON public.vehicle_brands;
CREATE POLICY "vehicle_brands_public_read" ON public.vehicle_brands
  FOR SELECT USING (true);

-- RLS Policies for vehicle_models (public read)
DROP POLICY IF EXISTS "vehicle_models_public_read" ON public.vehicle_models;
CREATE POLICY "vehicle_models_public_read" ON public.vehicle_models
  FOR SELECT USING (true);

-- RLS Policies for vehicle_engines (public read)
DROP POLICY IF EXISTS "vehicle_engines_public_read" ON public.vehicle_engines;
CREATE POLICY "vehicle_engines_public_read" ON public.vehicle_engines
  FOR SELECT USING (true);

-- RLS Policies for product_compatibility (public read)
DROP POLICY IF EXISTS "product_compatibility_public_read" ON public.product_compatibility;
CREATE POLICY "product_compatibility_public_read" ON public.product_compatibility
  FOR SELECT USING (true);

-- Store owners can manage their product compatibility
DROP POLICY IF EXISTS "product_compatibility_store_owner_manage" ON public.product_compatibility;
CREATE POLICY "product_compatibility_store_owner_manage" ON public.product_compatibility
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.products p
      INNER JOIN public.stores s ON p.store_id = s.id
      WHERE p.id = product_compatibility.product_id
        AND s.owner_id = auth.uid()
    )
  );

-- RLS Policies for user_vehicles
DROP POLICY IF EXISTS "user_vehicles_user_read" ON public.user_vehicles;
CREATE POLICY "user_vehicles_user_read" ON public.user_vehicles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_vehicles_user_manage" ON public.user_vehicles;
CREATE POLICY "user_vehicles_user_manage" ON public.user_vehicles
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 12. GRANT PERMISSIONS
-- =====================================================
-- Grant access to authenticated users
GRANT SELECT ON public.vehicle_brands TO authenticated;
GRANT SELECT ON public.vehicle_models TO authenticated;
GRANT SELECT ON public.vehicle_engines TO authenticated;
GRANT SELECT ON public.product_compatibility TO authenticated;
GRANT ALL ON public.user_vehicles TO authenticated;
GRANT SELECT ON products_full_info TO authenticated;

-- Grant access to anonymous users for reading public data
GRANT SELECT ON public.vehicle_brands TO anon;
GRANT SELECT ON public.vehicle_models TO anon;
GRANT SELECT ON public.vehicle_engines TO anon;
GRANT SELECT ON public.product_compatibility TO anon;
GRANT SELECT ON products_full_info TO anon;

-- =====================================================
-- 13. COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE public.vehicle_brands IS 'Catalog of vehicle brands (20 pre-registered)';
COMMENT ON TABLE public.vehicle_models IS 'Catalog of vehicle models by brand';
COMMENT ON TABLE public.vehicle_engines IS 'Catalog of common engine types (16 configurations)';
COMMENT ON TABLE public.product_compatibility IS 'Maps products to compatible vehicles';
COMMENT ON TABLE public.user_vehicles IS 'User-registered vehicles';
COMMENT ON COLUMN public.products.part_code IS 'Part code for exact search (e.g., KL1045008)';
COMMENT ON COLUMN public.products.position IS 'Part position on vehicle';
COMMENT ON FUNCTION search_products_by_partial_name IS 'Intelligent search by first 2-7 letters of product name';
COMMENT ON FUNCTION get_products_for_user_vehicle IS 'Returns products compatible with user primary vehicle';
COMMENT ON VIEW products_full_info IS 'Complete product information with store and compatibility data';

-- =====================================================
-- END OF SCHEMA
-- =====================================================
