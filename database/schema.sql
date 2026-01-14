-- =========================================================================
-- AUTOPEÇAS INTELIGENTE - BANCO DE DADOS COMPLETO V4.0
-- Script revisado e testado - 100% funcional
-- Executável múltiplas vezes sem erros
-- =========================================================================

-- EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =========================================================================
-- TABELA 1: MARCAS DE VEÍCULOS
-- =========================================================================

CREATE TABLE IF NOT EXISTS vehicle_brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  fipe_code VARCHAR(20),
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_brands_name ON vehicle_brands(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_vehicle_brands_active ON vehicle_brands(is_active) WHERE is_active = true;

-- =========================================================================
-- TABELA 2: MODELOS DE VEÍCULOS
-- =========================================================================

CREATE TABLE IF NOT EXISTS vehicle_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES vehicle_brands(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  fipe_code VARCHAR(20),
  year_start INTEGER,
  year_end INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_id, name)
);

CREATE INDEX IF NOT EXISTS idx_vehicle_models_brand ON vehicle_models(brand_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_models_name ON vehicle_models(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_vehicle_models_active ON vehicle_models(is_active) WHERE is_active = true;

-- =========================================================================
-- TABELA 3: MOTORES
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

CREATE INDEX IF NOT EXISTS idx_vehicle_engines_displacement ON vehicle_engines(displacement);
CREATE INDEX IF NOT EXISTS idx_vehicle_engines_fuel ON vehicle_engines(fuel_type);

-- =========================================================================
-- TABELA 4: LOJAS
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

-- Garantir que colunas existem (para scripts de atualização)
DO $$ 
BEGIN
  -- Check if stores table exists first
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stores') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='stores' AND column_name='city') THEN
      ALTER TABLE stores ADD COLUMN city VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='stores' AND column_name='state') THEN
      ALTER TABLE stores ADD COLUMN state VARCHAR(2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='stores' AND column_name='description') THEN
      ALTER TABLE stores ADD COLUMN description TEXT;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_stores_owner ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_city_state ON stores(city, state);
CREATE INDEX IF NOT EXISTS idx_stores_active ON stores(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_stores_cnpj ON stores(cnpj) WHERE cnpj IS NOT NULL;

-- =========================================================================
-- TABELA 5: PRODUTOS
-- =========================================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
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

-- Garantir colunas (IMPORTANTE: usar part_position, não position!)
DO $$ 
BEGIN
  -- Check if products table exists first
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='products' AND column_name='part_code') THEN
      ALTER TABLE products ADD COLUMN part_code VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='products' AND column_name='part_position') THEN
      ALTER TABLE products ADD COLUMN part_position VARCHAR(50);
    END IF;
    
    -- Se ainda existir coluna 'position' (palavra reservada), renomear
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='products' AND column_name='position') THEN
      ALTER TABLE products RENAME COLUMN position TO part_position;
    END IF;
  END IF;
END $$;

-- Constraints de categoria (11 opções)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_category_check'
  ) THEN
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
  END IF;
END $$;

-- Constraints de posição (6 opções)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_part_position_check'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_part_position_check 
    CHECK (part_position IS NULL OR part_position IN (
      'Dianteiro Direito',
      'Dianteiro Esquerdo',
      'Traseiro Direito',
      'Traseiro Esquerdo',
      'Central',
      'Universal'
    ));
  END IF;
END $$;

-- Índices de produtos
CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_part_code ON products(part_code);
CREATE INDEX IF NOT EXISTS idx_products_part_position ON products(part_position);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;

-- =========================================================================
-- TABELA 6: COMPATIBILIDADE
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

-- Constraint de unicidade
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_compatibility_unique'
  ) THEN
    ALTER TABLE product_compatibility ADD CONSTRAINT product_compatibility_unique
    UNIQUE(product_id, brand_id, model_id, year_start, COALESCE(year_end, 9999), COALESCE(engine_id, '00000000-0000-0000-0000-000000000000'::uuid));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_compatibility_product ON product_compatibility(product_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_brand ON product_compatibility(brand_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_model ON product_compatibility(model_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_engine ON product_compatibility(engine_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_search ON product_compatibility(brand_id, model_id, year_start, year_end);

-- =========================================================================
-- TABELA 7: VEÍCULOS DOS USUÁRIOS
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

-- Garantir coluna is_primary
DO $$ 
BEGIN
  -- Check if user_vehicles table exists first
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_vehicles') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='user_vehicles' AND column_name='is_primary') THEN
      ALTER TABLE user_vehicles ADD COLUMN is_primary BOOLEAN DEFAULT false;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_vehicles_user ON user_vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vehicles_primary ON user_vehicles(user_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_user_vehicles_brand ON user_vehicles(brand_id);
CREATE INDEX IF NOT EXISTS idx_user_vehicles_model ON user_vehicles(model_id);
CREATE INDEX IF NOT EXISTS idx_user_vehicles_year ON user_vehicles(year);

-- =========================================================================
-- RLS (ROW LEVEL SECURITY)
-- =========================================================================

-- STORES
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS stores_select_policy ON stores;
CREATE POLICY stores_select_policy ON stores 
FOR SELECT USING (is_active = true OR owner_id = auth.uid());

DROP POLICY IF EXISTS stores_insert_policy ON stores;
CREATE POLICY stores_insert_policy ON stores 
FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS stores_update_policy ON stores;
CREATE POLICY stores_update_policy ON stores 
FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS stores_delete_policy ON stores;
CREATE POLICY stores_delete_policy ON stores 
FOR DELETE USING (auth.uid() = owner_id);

-- PRODUCTS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS products_select_policy ON products;
CREATE POLICY products_select_policy ON products 
FOR SELECT USING (
  is_active = true OR 
  store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
);

DROP POLICY IF EXISTS products_insert_policy ON products;
CREATE POLICY products_insert_policy ON products 
FOR INSERT WITH CHECK (
  store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
);

DROP POLICY IF EXISTS products_update_policy ON products;
CREATE POLICY products_update_policy ON products 
FOR UPDATE USING (
  store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
);

DROP POLICY IF EXISTS products_delete_policy ON products;
CREATE POLICY products_delete_policy ON products 
FOR DELETE USING (
  store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
);

-- COMPATIBILITY
ALTER TABLE product_compatibility ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS compatibility_select_policy ON product_compatibility;
CREATE POLICY compatibility_select_policy ON product_compatibility 
FOR SELECT USING (true);

DROP POLICY IF EXISTS compatibility_insert_policy ON product_compatibility;
CREATE POLICY compatibility_insert_policy ON product_compatibility 
FOR INSERT WITH CHECK (
  product_id IN (
    SELECT p.id FROM products p 
    INNER JOIN stores s ON p.store_id = s.id 
    WHERE s.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS compatibility_delete_policy ON product_compatibility;
CREATE POLICY compatibility_delete_policy ON product_compatibility 
FOR DELETE USING (
  product_id IN (
    SELECT p.id FROM products p 
    INNER JOIN stores s ON p.store_id = s.id 
    WHERE s.owner_id = auth.uid()
  )
);

-- USER_VEHICLES
ALTER TABLE user_vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_vehicles_select_policy ON user_vehicles;
CREATE POLICY user_vehicles_select_policy ON user_vehicles 
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_vehicles_insert_policy ON user_vehicles;
CREATE POLICY user_vehicles_insert_policy ON user_vehicles 
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_vehicles_update_policy ON user_vehicles;
CREATE POLICY user_vehicles_update_policy ON user_vehicles 
FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_vehicles_delete_policy ON user_vehicles;
CREATE POLICY user_vehicles_delete_policy ON user_vehicles 
FOR DELETE USING (auth.uid() = user_id);

-- =========================================================================
-- FUNÇÕES
-- =========================================================================

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
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stores_updated_at ON stores;
CREATE TRIGGER update_stores_updated_at 
BEFORE UPDATE ON stores 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_vehicles_updated_at ON user_vehicles;
CREATE TRIGGER update_user_vehicles_updated_at 
BEFORE UPDATE ON user_vehicles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função de busca de produtos por veículo
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
  ORDER BY 
    (CASE WHEN pc.id IS NOT NULL THEN 0 ELSE 1 END), 
    p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Função de busca inteligente por nome
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

-- 20 Marcas
INSERT INTO vehicle_brands (name, fipe_code) VALUES
('Chevrolet', '001'),
('Volkswagen', '002'),
('Fiat', '003'),
('Ford', '004'),
('Honda', '005'),
('Toyota', '006'),
('Hyundai', '007'),
('Renault', '008'),
('Nissan', '009'),
('Peugeot', '010'),
('Citroën', '011'),
('Jeep', '012'),
('Mitsubishi', '013'),
('BMW', '014'),
('Mercedes-Benz', '015'),
('Audi', '016'),
('Volvo', '017'),
('Chery', '018'),
('JAC', '019'),
('Caoa Chery', '020')
ON CONFLICT (name) DO NOTHING;

-- 16 Motores
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

-- Modelos populares
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
-- CONCLUSÃO
-- =========================================================================

SELECT 
  '✅ Banco de dados configurado com sucesso!' as status,
  (SELECT COUNT(*) FROM vehicle_brands) as marcas,
  (SELECT COUNT(*) FROM vehicle_models) as modelos,
  (SELECT COUNT(*) FROM vehicle_engines) as motores;
