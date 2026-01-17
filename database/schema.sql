-- =========================================================================
-- AUTOPEÇAS INTELIGENTE - BANCO DE DADOS COMPLETO V4.0
-- Script revisado, testado e à prova de erros
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =========================================================================
-- TABELA: MARCAS DE VEÍCULOS
-- =========================================================================

CREATE TABLE IF NOT EXISTS vehicle_brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  fipe_code VARCHAR(20),
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar UNIQUE constraint se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vehicle_brands_name_key'
  ) THEN
    ALTER TABLE vehicle_brands ADD CONSTRAINT vehicle_brands_name_key UNIQUE (name);
  END IF;
END $$;

DROP INDEX IF EXISTS idx_vehicle_brands_name;
CREATE INDEX idx_vehicle_brands_name ON vehicle_brands(LOWER(name));

-- =========================================================================
-- TABELA: MODELOS DE VEÍCULOS
-- =========================================================================

CREATE TABLE IF NOT EXISTS vehicle_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES vehicle_brands(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  fipe_code VARCHAR(20),
  year_start INTEGER,
  year_end INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar UNIQUE constraint se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vehicle_models_brand_name_key'
  ) THEN
    ALTER TABLE vehicle_models ADD CONSTRAINT vehicle_models_brand_name_key UNIQUE (brand_id, name);
  END IF;
END $$;

DROP INDEX IF EXISTS idx_vehicle_models_brand;
CREATE INDEX idx_vehicle_models_brand ON vehicle_models(brand_id);

DROP INDEX IF EXISTS idx_vehicle_models_name;
CREATE INDEX idx_vehicle_models_name ON vehicle_models(LOWER(name));

-- =========================================================================
-- TABELA: MOTORES
-- =========================================================================

CREATE TABLE IF NOT EXISTS vehicle_engines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  displacement VARCHAR(10) NOT NULL,
  valves INTEGER,
  fuel_type VARCHAR(50),
  horsepower INTEGER,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_vehicle_engines_displacement;
CREATE INDEX idx_vehicle_engines_displacement ON vehicle_engines(displacement);

-- =========================================================================
-- TABELA: LOJAS
-- =========================================================================

CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  cnpj VARCHAR(18),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zipcode VARCHAR(10),
  logo_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar colunas se não existirem
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stores' AND column_name='city') THEN
    ALTER TABLE stores ADD COLUMN city VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stores' AND column_name='state') THEN
    ALTER TABLE stores ADD COLUMN state VARCHAR(2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stores' AND column_name='description') THEN
    ALTER TABLE stores ADD COLUMN description TEXT;
  END IF;
END $$;

-- Adicionar UNIQUE constraint para CNPJ se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'stores_cnpj_key'
  ) THEN
    ALTER TABLE stores ADD CONSTRAINT stores_cnpj_key UNIQUE (cnpj);
  END IF;
END $$;

DROP INDEX IF EXISTS idx_stores_owner;
CREATE INDEX idx_stores_owner ON stores(owner_id);

DROP INDEX IF EXISTS idx_stores_city_state;
CREATE INDEX idx_stores_city_state ON stores(city, state);

DROP INDEX IF EXISTS idx_stores_active;
CREATE INDEX idx_stores_active ON stores(is_active) WHERE is_active = true;

-- =========================================================================
-- TABELA: PRODUTOS
-- =========================================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100),
  oem_codes JSONB,
  mpn VARCHAR(100),
  brand TEXT,
  model TEXT,
  part_code VARCHAR(50),
  category VARCHAR(100) NOT NULL,
  part_position VARCHAR(50),
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  specifications JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  slug VARCHAR(300),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar colunas se não existirem
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='part_code') THEN
    ALTER TABLE products ADD COLUMN part_code VARCHAR(50);
  END IF;
  
  -- Verificar se existe coluna 'position' (palavra reservada)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='position') THEN
    -- Renomear para part_position
    ALTER TABLE products RENAME COLUMN position TO part_position;
  END IF;
  
  -- Se part_position ainda não existe, criar
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='part_position') THEN
    ALTER TABLE products ADD COLUMN part_position VARCHAR(50);
  END IF;
END $$;

-- Constraints de categoria
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products ADD CONSTRAINT products_category_check 
CHECK (category IN (
  'Acessórios',
  'Alinhamento',
  'Bateria',
  'Escapamento',
  'Estofamento',
  'Lubrificantes',
  'Elétrica',
  'Funilaria',
  'Mecânica',
  'Pneus',
  'Outros'
));

-- Constraints de posição
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_part_position_check;
ALTER TABLE products ADD CONSTRAINT products_part_position_check 
CHECK (part_position IS NULL OR part_position IN (
  'Dianteiro Direito',
  'Dianteiro Esquerdo',
  'Traseiro Direito',
  'Traseiro Esquerdo',
  'Central',
  'Universal'
));

-- Índices
DROP INDEX IF EXISTS idx_products_store;
CREATE INDEX idx_products_store ON products(store_id);

DROP INDEX IF EXISTS idx_products_category;
CREATE INDEX idx_products_category ON products(category);

DROP INDEX IF EXISTS idx_products_sku;
CREATE INDEX idx_products_sku ON products(sku);

DROP INDEX IF EXISTS idx_products_sku_unique;
CREATE UNIQUE INDEX idx_products_sku_unique ON products(sku) WHERE sku IS NOT NULL;

DROP INDEX IF EXISTS idx_products_mpn;
CREATE INDEX idx_products_mpn ON products(mpn);

DROP INDEX IF EXISTS idx_products_oem_codes;
CREATE INDEX idx_products_oem_codes ON products USING gin(oem_codes);

DROP INDEX IF EXISTS idx_products_brand;
CREATE INDEX idx_products_brand ON products(brand);

DROP INDEX IF EXISTS idx_products_model;
CREATE INDEX idx_products_model ON products(model);

DROP INDEX IF EXISTS idx_products_part_code;
CREATE INDEX idx_products_part_code ON products(part_code);

DROP INDEX IF EXISTS idx_products_part_position;
CREATE INDEX idx_products_part_position ON products(part_position);

DROP INDEX IF EXISTS idx_products_price;
CREATE INDEX idx_products_price ON products(price);

DROP INDEX IF EXISTS idx_products_name_trgm;
CREATE INDEX idx_products_name_trgm ON products USING gin(name gin_trgm_ops);

DROP INDEX IF EXISTS idx_products_active;
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;

-- =========================================================================
-- TABELA: COMPATIBILIDADE PRODUTO-VEÍCULO
-- =========================================================================

CREATE TABLE IF NOT EXISTS product_compatibility (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES vehicle_brands(id) ON DELETE CASCADE,
  model_id UUID REFERENCES vehicle_models(id) ON DELETE CASCADE,
  engine_id UUID REFERENCES vehicle_engines(id) ON DELETE SET NULL,
  year_start INTEGER NOT NULL,
  year_end INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
DROP INDEX IF EXISTS idx_compatibility_product;
CREATE INDEX idx_compatibility_product ON product_compatibility(product_id);

DROP INDEX IF EXISTS idx_compatibility_brand;
CREATE INDEX idx_compatibility_brand ON product_compatibility(brand_id);

DROP INDEX IF EXISTS idx_compatibility_model;
CREATE INDEX idx_compatibility_model ON product_compatibility(model_id);

DROP INDEX IF EXISTS idx_compatibility_engine;
CREATE INDEX idx_compatibility_engine ON product_compatibility(engine_id);

DROP INDEX IF EXISTS idx_compatibility_search;
CREATE INDEX idx_compatibility_search ON product_compatibility(brand_id, model_id, year_start, year_end);

-- =========================================================================
-- TABELA: VEÍCULOS DOS USUÁRIOS
-- =========================================================================

CREATE TABLE IF NOT EXISTS user_vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES vehicle_brands(id) ON DELETE SET NULL,
  model_id UUID REFERENCES vehicle_models(id) ON DELETE SET NULL,
  engine_id UUID REFERENCES vehicle_engines(id) ON DELETE SET NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(150) NOT NULL,
  year INTEGER NOT NULL,
  engine VARCHAR(50),
  valves INTEGER,
  fuel_type VARCHAR(50),
  license_plate VARCHAR(10),
  nickname VARCHAR(100),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna is_primary se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_vehicles' AND column_name='is_primary') THEN
    ALTER TABLE user_vehicles ADD COLUMN is_primary BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Índices
DROP INDEX IF EXISTS idx_user_vehicles_user;
CREATE INDEX idx_user_vehicles_user ON user_vehicles(user_id);

DROP INDEX IF EXISTS idx_user_vehicles_primary;
CREATE INDEX idx_user_vehicles_primary ON user_vehicles(user_id, is_primary) WHERE is_primary = true;

DROP INDEX IF EXISTS idx_user_vehicles_brand;
CREATE INDEX idx_user_vehicles_brand ON user_vehicles(brand_id);

DROP INDEX IF EXISTS idx_user_vehicles_model;
CREATE INDEX idx_user_vehicles_model ON user_vehicles(model_id);

-- =========================================================================
-- RLS (ROW LEVEL SECURITY)
-- =========================================================================

-- STORES
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS stores_select_policy ON stores;
CREATE POLICY stores_select_policy ON stores FOR SELECT 
USING (is_active = true OR owner_id = auth.uid());

DROP POLICY IF EXISTS stores_insert_policy ON stores;
CREATE POLICY stores_insert_policy ON stores FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS stores_update_policy ON stores;
CREATE POLICY stores_update_policy ON stores FOR UPDATE 
USING (auth.uid() = owner_id);

-- PRODUCTS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS products_select_policy ON products;
CREATE POLICY products_select_policy ON products FOR SELECT 
USING (is_active = true OR store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS products_insert_policy ON products;
CREATE POLICY products_insert_policy ON products FOR INSERT 
WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS products_update_policy ON products;
CREATE POLICY products_update_policy ON products FOR UPDATE 
USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS products_delete_policy ON products;
CREATE POLICY products_delete_policy ON products FOR DELETE 
USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- COMPATIBILITY
ALTER TABLE product_compatibility ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS compatibility_select_policy ON product_compatibility;
CREATE POLICY compatibility_select_policy ON product_compatibility FOR SELECT 
USING (true);

DROP POLICY IF EXISTS compatibility_insert_policy ON product_compatibility;
CREATE POLICY compatibility_insert_policy ON product_compatibility FOR INSERT 
WITH CHECK (product_id IN (SELECT id FROM products WHERE store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())));

DROP POLICY IF EXISTS compatibility_delete_policy ON product_compatibility;
CREATE POLICY compatibility_delete_policy ON product_compatibility FOR DELETE 
USING (product_id IN (SELECT id FROM products WHERE store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())));

-- USER_VEHICLES
ALTER TABLE user_vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_vehicles_select_policy ON user_vehicles;
CREATE POLICY user_vehicles_select_policy ON user_vehicles FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_vehicles_insert_policy ON user_vehicles;
CREATE POLICY user_vehicles_insert_policy ON user_vehicles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_vehicles_update_policy ON user_vehicles;
CREATE POLICY user_vehicles_update_policy ON user_vehicles FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_vehicles_delete_policy ON user_vehicles;
CREATE POLICY user_vehicles_delete_policy ON user_vehicles FOR DELETE 
USING (auth.uid() = user_id);

-- =========================================================================
-- FUNÇÕES
-- =========================================================================

CREATE OR REPLACE FUNCTION get_products_for_user_vehicle(
  p_user_id UUID,
  p_category VARCHAR DEFAULT NULL,
  p_max_price DECIMAL DEFAULT NULL
)
RETURNS TABLE (
  product_id UUID,
  product_name VARCHAR,
  part_code VARCHAR,
  category VARCHAR,
  price DECIMAL,
  store_name VARCHAR,
  is_compatible BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    p.id,
    p.name,
    p.part_code,
    p.category,
    p.price,
    s.name,
    CASE WHEN pc.id IS NOT NULL THEN true ELSE false END
  FROM products p
  INNER JOIN stores s ON p.store_id = s.id
  LEFT JOIN product_compatibility pc ON p.id = pc.product_id
  LEFT JOIN user_vehicles uv ON (
    uv.user_id = p_user_id 
    AND uv.is_primary = true
    AND pc.brand_id = uv.brand_id 
    AND pc.model_id = uv.model_id
    AND uv.year >= pc.year_start 
    AND (pc.year_end IS NULL OR uv.year <= pc.year_end)
  )
  WHERE p.is_active = true 
    AND s.is_active = true
    AND (p_category IS NULL OR p.category = p_category)
    AND (p_max_price IS NULL OR p.price <= p_max_price)
  ORDER BY (CASE WHEN pc.id IS NOT NULL THEN 0 ELSE 1 END), p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION search_products_by_partial_name(search_term TEXT)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  part_code VARCHAR,
  category VARCHAR,
  price DECIMAL,
  score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.part_code,
    p.category,
    p.price,
    CASE
      WHEN LOWER(p.name) LIKE LOWER(search_term) || '%' THEN 7
      WHEN LOWER(p.name) LIKE LOWER(SUBSTRING(search_term FROM 1 FOR 6)) || '%' THEN 6
      WHEN LOWER(p.name) LIKE LOWER(SUBSTRING(search_term FROM 1 FOR 5)) || '%' THEN 5
      WHEN LOWER(p.name) LIKE LOWER(SUBSTRING(search_term FROM 1 FOR 4)) || '%' THEN 4
      WHEN LOWER(p.name) LIKE LOWER(SUBSTRING(search_term FROM 1 FOR 3)) || '%' THEN 3
      WHEN LOWER(p.name) LIKE LOWER(SUBSTRING(search_term FROM 1 FOR 2)) || '%' THEN 2
      ELSE 0
    END AS score
  FROM products p
  WHERE p.is_active = true 
    AND LOWER(p.name) LIKE LOWER(SUBSTRING(search_term FROM 1 FOR 2)) || '%'
  ORDER BY score DESC, p.name 
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
BEFORE UPDATE ON products 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stores_updated_at ON stores;
CREATE TRIGGER update_stores_updated_at 
BEFORE UPDATE ON stores 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_vehicles_updated_at ON user_vehicles;
CREATE TRIGGER update_user_vehicles_updated_at 
BEFORE UPDATE ON user_vehicles 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- VIEW
-- =========================================================================

DROP VIEW IF EXISTS products_full_info;
CREATE OR REPLACE VIEW products_full_info AS
SELECT 
  p.id,
  p.name,
  p.part_code,
  p.category,
  p.part_position,
  p.price,
  p.description,
  p.image_url,
  p.stock_quantity,
  p.is_active,
  p.created_at,
  s.id as store_id,
  s.name as store_name,
  COALESCE(s.city, '') as store_city,
  COALESCE(s.state, '') as store_state,
  (
    SELECT json_agg(json_build_object(
      'brand', vb.name,
      'model', vm.name,
      'year_start', pc.year_start,
      'year_end', pc.year_end,
      'engine', ve.displacement,
      'valves', ve.valves
    ))
    FROM product_compatibility pc
    LEFT JOIN vehicle_brands vb ON pc.brand_id = vb.id
    LEFT JOIN vehicle_models vm ON pc.model_id = vm.id
    LEFT JOIN vehicle_engines ve ON pc.engine_id = ve.id
    WHERE pc.product_id = p.id
  ) as compatible_vehicles
FROM products p
INNER JOIN stores s ON p.store_id = s.id
WHERE p.is_active = true AND s.is_active = true;

-- =========================================================================
-- DADOS INICIAIS
-- =========================================================================

INSERT INTO vehicle_brands (name, fipe_code) VALUES
('Chevrolet', '001'), ('Volkswagen', '002'), ('Fiat', '003'), ('Ford', '004'),
('Honda', '005'), ('Toyota', '006'), ('Hyundai', '007'), ('Renault', '008'),
('Nissan', '009'), ('Peugeot', '010'), ('Citroën', '011'), ('Jeep', '012'),
('Mitsubishi', '013'), ('BMW', '014'), ('Mercedes-Benz', '015'), ('Audi', '016'),
('Volvo', '017'), ('Chery', '018'), ('JAC', '019'), ('Caoa Chery', '020')
ON CONFLICT (name) DO NOTHING;

INSERT INTO vehicle_engines (displacement, valves, fuel_type, description) VALUES
('1.0', 8, 'Flex', 'Motor 1.0 8V Flex'),
('1.0', 12, 'Flex', 'Motor 1.0 12V Flex'),
('1.0', 12, 'Turbo Flex', 'Motor 1.0 Turbo 12V Flex'),
('1.3', 8, 'Flex', 'Motor 1.3 8V Flex'),
('1.4', 8, 'Flex', 'Motor 1.4 8V Flex'),
('1.5', 16, 'Flex', 'Motor 1.5 16V Flex'),
('1.6', 8, 'Flex', 'Motor 1.6 8V Flex'),
('1.6', 16, 'Flex', 'Motor 1.6 16V Flex'),
('1.8', 16, 'Flex', 'Motor 1.8 16V Flex'),
('2.0', 16, 'Flex', 'Motor 2.0 16V Flex'),
('2.0', 16, 'Turbo Flex', 'Motor 2.0 Turbo 16V Flex'),
('1.5', 16, 'Diesel', 'Motor 1.5 Diesel'),
('2.0', 16, 'Diesel', 'Motor 2.0 Diesel'),
('2.2', 16, 'Diesel', 'Motor 2.2 Diesel'),
('Elétrico', NULL, 'Elétrico', 'Motor Elétrico'),
('Híbrido', NULL, 'Híbrido', 'Motor Híbrido')
ON CONFLICT DO NOTHING;

-- Inserir modelos
DO $$
DECLARE
  brand_chevrolet UUID;
  brand_vw UUID;
  brand_fiat UUID;
BEGIN
  SELECT id INTO brand_chevrolet FROM vehicle_brands WHERE name = 'Chevrolet' LIMIT 1;
  SELECT id INTO brand_vw FROM vehicle_brands WHERE name = 'Volkswagen' LIMIT 1;
  SELECT id INTO brand_fiat FROM vehicle_brands WHERE name = 'Fiat' LIMIT 1;
  
  IF brand_chevrolet IS NOT NULL THEN
    INSERT INTO vehicle_models (brand_id, name, year_start, year_end) VALUES
    (brand_chevrolet, 'Onix', 2013, NULL),
    (brand_chevrolet, 'Onix Plus', 2020, NULL),
    (brand_chevrolet, 'Prisma', 2013, 2020),
    (brand_chevrolet, 'Cruze', 2017, NULL),
    (brand_chevrolet, 'S10', 2012, NULL),
    (brand_chevrolet, 'Tracker', 2020, NULL)
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF brand_vw IS NOT NULL THEN
    INSERT INTO vehicle_models (brand_id, name, year_start, year_end) VALUES
    (brand_vw, 'Gol', 2008, NULL),
    (brand_vw, 'Polo', 2018, NULL),
    (brand_vw, 'Virtus', 2018, NULL),
    (brand_vw, 'T-Cross', 2019, NULL)
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF brand_fiat IS NOT NULL THEN
    INSERT INTO vehicle_models (brand_id, name, year_start, year_end) VALUES
    (brand_fiat, 'Argo', 2018, NULL),
    (brand_fiat, 'Mobi', 2017, NULL),
    (brand_fiat, 'Toro', 2016, NULL),
    (brand_fiat, 'Strada', 2021, NULL)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- =========================================================================
-- TABELA: BRANDS (Marcas de Produtos/Peças)
-- =========================================================================
-- This is different from vehicle_brands - this is for product manufacturers

CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- VARCHAR(200) allows for long international manufacturer names
  -- e.g., "ZF Friedrichshafen / ZF Aftermarket" = 37 chars
  -- Provides sufficient space while maintaining reasonable indexing performance
  name VARCHAR(200) NOT NULL UNIQUE,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_brands_name;
CREATE INDEX idx_brands_name ON brands(LOWER(name));

DROP INDEX IF EXISTS idx_brands_active;
CREATE INDEX idx_brands_active ON brands(is_active) WHERE is_active = true;

-- RLS for brands
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS brands_select_policy ON brands;
CREATE POLICY brands_select_policy ON brands FOR SELECT 
USING (true);

DROP POLICY IF EXISTS brands_insert_policy ON brands;
CREATE POLICY brands_insert_policy ON brands FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS brands_update_policy ON brands;
CREATE POLICY brands_update_policy ON brands FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- =========================================================================
-- TABELA: ORDERS (Pedidos)
-- =========================================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50),
  delivery_address JSONB,
  status_history JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Constraints
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'confirmed', 'delivering', 'delivered', 'cancelled'));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check 
CHECK (payment_method IN ('credit_card', 'pix', 'cash', 'debit_card', 'bank_transfer'));

-- Índices
DROP INDEX IF EXISTS idx_orders_store;
CREATE INDEX idx_orders_store ON orders(store_id);

DROP INDEX IF EXISTS idx_orders_customer;
CREATE INDEX idx_orders_customer ON orders(customer_id);

DROP INDEX IF EXISTS idx_orders_status;
CREATE INDEX idx_orders_status ON orders(status);

DROP INDEX IF EXISTS idx_orders_number;
CREATE INDEX idx_orders_number ON orders(order_number);

DROP INDEX IF EXISTS idx_orders_created;
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- RLS for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS orders_select_policy ON orders;
CREATE POLICY orders_select_policy ON orders FOR SELECT 
USING (
  customer_id = auth.uid() 
  OR store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
);

DROP POLICY IF EXISTS orders_insert_policy ON orders;
CREATE POLICY orders_insert_policy ON orders FOR INSERT 
WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS orders_update_policy ON orders;
CREATE POLICY orders_update_policy ON orders FOR UPDATE 
USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- =========================================================================
-- TABELA: STORE_REVIEWS (Avaliações de Lojas)
-- =========================================================================

CREATE TABLE IF NOT EXISTS store_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  store_response TEXT,
  store_response_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Constraints
ALTER TABLE store_reviews DROP CONSTRAINT IF EXISTS store_reviews_rating_check;
ALTER TABLE store_reviews ADD CONSTRAINT store_reviews_rating_check 
CHECK (rating >= 1 AND rating <= 5);

-- Índices
DROP INDEX IF EXISTS idx_store_reviews_store;
CREATE INDEX idx_store_reviews_store ON store_reviews(store_id);

DROP INDEX IF EXISTS idx_store_reviews_rating;
CREATE INDEX idx_store_reviews_rating ON store_reviews(rating);

DROP INDEX IF EXISTS idx_store_reviews_created;
CREATE INDEX idx_store_reviews_created ON store_reviews(created_at DESC);

-- RLS for store_reviews
ALTER TABLE store_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS store_reviews_select_policy ON store_reviews;
CREATE POLICY store_reviews_select_policy ON store_reviews FOR SELECT 
USING (true);

DROP POLICY IF EXISTS store_reviews_insert_policy ON store_reviews;
CREATE POLICY store_reviews_insert_policy ON store_reviews FOR INSERT 
WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS store_reviews_update_policy ON store_reviews;
CREATE POLICY store_reviews_update_policy ON store_reviews FOR UPDATE 
USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- =========================================================================
-- TRIGGERS
-- =========================================================================

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
BEFORE UPDATE ON orders 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_brands_updated_at ON brands;
CREATE TRIGGER update_brands_updated_at 
BEFORE UPDATE ON brands 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- SEED BRANDS DATA
-- =========================================================================

INSERT INTO brands (name) VALUES
('Bosch'), ('Denso'), ('ACDelco'), ('Motorcraft (Ford)'),
('Magna International'), ('ZF Friedrichshafen / ZF Aftermarket'),
('Continental AG'), ('Valeo'), ('Hyundai Mobis'), ('Aisin Seiki'),
('Lear Corporation'), ('Faurecia'), ('Yazaki'), ('Sumitomo Electric'),
('JTEKT'), ('Mahle GmbH'), ('Panasonic Automotive'), ('Toyoda Gosei'),
('Autoliv'), ('Hitachi Automotive'), ('BorgWarner'), ('Calsonic Kansei'),
('Yanfeng Automotive'), ('Gestamp'), ('Hyundai-WIA'),
('NGK'), ('NTK'), ('Delphi'), ('Hitachi (Aftermarket)'), ('Omron'),
('Exedy'), ('Crower'), ('Cloyes'),
('Mahle Aftermarket'), ('Kolbenschmidt (KS)'), ('Wiseco'), ('ACL'),
('Total Seal'), ('Hastings'),
('LuK'), ('Sachs'), ('Valeo (embreagens)'), ('Aisin'), ('Borg & Beck'),
('NSK'),
('Monroe'), ('KYB'), ('Bilstein'), ('Koni'), ('Moog'), ('Meyle'), ('TRW'),
('Lemförder'), ('SWAG'), ('Axios'), ('Cofap'), ('Nakata'), ('Perfect'),
('Ridex'), ('Starline'), ('Febi'),
('Brembo'), ('ATE'), ('Ferodo'), ('Bendix'), ('Cobreq'), ('Fras-le'),
('EBC Brakes'), ('SBS'), ('Pagid'), ('Textar'), ('Jurid'), ('Willtec'),
('Bosch (linha aftermarket)'), ('Hella'), ('TSA'), ('Gauss'), ('Marflex'),
('DS'), ('MTE-Thomson'), ('Indisa'), ('Putco'),
('Optima (baterias)'), ('Varta (baterias)'), ('Exide (baterias)'),
('Mann-Filter'), ('Tecfil'), ('Fram'), ('Purflux'), ('Wix'), ('Baldwin'),
('Hengst'), ('K&N (performance)'), ('Mahle'),
('K&N'), ('Akrapovič'), ('Borla'), ('Airtec'), ('Apexi'), ('Alpha Competition'),
('Eibach'), ('H&R'), ('Tein'), ('Whiteline'), ('Roush (performance)'),
('Dorman Products'), ('A.B.S. All Brake Systems'), ('OESpectrum'), ('Replace'),
('Carquest'), ('Duralast'), ('MasterPro'), ('Parts Plus'), ('Premium Guard'),
('Beck/Arnley'), ('Mopar (Chrysler / Dodge / Jeep)'), ('QueenParts')
ON CONFLICT (name) DO NOTHING;

-- =========================================================================
-- FINALIZAÇÃO
-- =========================================================================

SELECT 'Banco de dados configurado com sucesso!' as status;
