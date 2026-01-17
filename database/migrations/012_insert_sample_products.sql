-- Migration 012: Insert sample stores and products for Audi A1 and VW Gol

-- ========================================
-- STEP 1: Create sample stores (need owner_id from auth.users)
-- ========================================

-- First, let's create a test user if it doesn't exist and get stores
-- For this to work, you need to have at least one user in auth.users
-- You can create one through the Supabase Auth UI or through the app

-- Store 1: Auto Peças Central
INSERT INTO stores (
  owner_id,
  name,
  slug,
  email,
  phone,
  address,
  city,
  state,
  zipcode,
  description,
  is_active
)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'Auto Peças Central',
  'auto-pecas-central',
  'contato@autopecascentral.com.br',
  '(81) 3333-4444',
  'Av. Principal, 1234',
  'Recife',
  'PE',
  '50000-000',
  'Especializada em peças automotivas de alta qualidade para todas as marcas.',
  true
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

-- Store 2: Mecânica do Zé
INSERT INTO stores (
  owner_id,
  name,
  slug,
  email,
  phone,
  address,
  city,
  state,
  zipcode,
  description,
  is_active
)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'Mecânica do Zé',
  'mecanica-do-ze',
  'mecanicadoze@gmail.com',
  '(81) 3555-6666',
  'Rua das Oficinas, 567',
  'Olinda',
  'PE',
  '53000-000',
  'Mecânica de confiança há mais de 20 anos. Peças originais e nacionais.',
  true
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

-- Store 3: Express Parts
INSERT INTO stores (
  owner_id,
  name,
  slug,
  email,
  phone,
  address,
  city,
  state,
  zipcode,
  description,
  is_active
)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'Express Parts',
  'express-parts',
  'vendas@expressparts.com.br',
  '(81) 3777-8888',
  'Av. Norte, 890',
  'Jaboatão dos Guararapes',
  'PE',
  '54000-000',
  'Entrega rápida e peças de qualidade. Atendemos toda região metropolitana.',
  true
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

-- ========================================
-- STEP 2: Products for Audi A1
-- ========================================

-- Product 1: Filtro de Ar (Store 1)
INSERT INTO products (
  name, 
  description, 
  price, 
  category, 
  part_code, 
  brand, 
  model, 
  mpn,
  stock_quantity,
  store_id,
  is_active
)
SELECT 
  'Filtro de Ar Esportivo K&N',
  'Filtro de ar de alto fluxo para melhor performance e economia. Lavável e reutilizável.',
  289.90,
  'Acessórios',
  'KN-33-2888',
  'K&N',
  'Filtro de Ar Esportivo',
  '33-2888',
  15,
  s.id,
  true
FROM stores s
WHERE s.name = 'Auto Peças Central'
LIMIT 1;

-- Get the product_id we just inserted
WITH last_product AS (
  SELECT id FROM products WHERE part_code = 'KN-33-2888' LIMIT 1
)
INSERT INTO product_compatibility (
  product_id,
  brand,
  model,
  brand_code,
  model_code,
  year_start,
  year_end,
  engines,
  transmissions,
  fuel_types,
  valves
)
SELECT 
  id,
  'Audi',
  'A1 1.4 TFSI 122cv S-tronic 3p',
  '6',
  '5496',
  2012,
  2012,
  ARRAY['1.4'],
  NULL,
  ARRAY['Gasolina'],
  16
FROM last_product;

-- Product 2: Pastilha de Freio (Store 2)
INSERT INTO products (
  name, 
  description, 
  price, 
  category, 
  part_code, 
  brand, 
  model, 
  part_position,
  mpn,
  oem_codes,
  stock_quantity,
  store_id,
  is_active
)
SELECT 
  'Pastilha de Freio Dianteira Bosch',
  'Pastilha de freio cerâmica premium com baixo nível de ruído e excelente durabilidade.',
  185.00,
  'Mecânica',
  'BB1234-AUD',
  'Bosch',
  'Pastilha Cerâmica',
  'Universal',
  'BP1463',
  '["1K0698151", "5K0698151"]'::jsonb,
  25,
  s.id,
  true
FROM stores s
WHERE s.name = 'Mecânica do Zé'
LIMIT 1;

WITH last_product AS (
  SELECT id FROM products WHERE part_code = 'BB1234-AUD' LIMIT 1
)
INSERT INTO product_compatibility (
  product_id,
  brand,
  model,
  brand_code,
  model_code,
  year_start,
  year_end,
  engines,
  transmissions,
  fuel_types,
  valves
)
SELECT 
  id,
  'Audi',
  'A1 1.4 TFSI 122cv S-tronic 3p',
  '6',
  '5496',
  2012,
  2012,
  ARRAY['1.4'],
  NULL,
  ARRAY['Gasolina'],
  NULL
FROM last_product;

-- Product 3: Vela de Ignição (Store 3)
INSERT INTO products (
  name, 
  description, 
  price, 
  category, 
  part_code, 
  brand, 
  model,
  mpn,
  oem_codes,
  stock_quantity,
  store_id,
  is_active
)
SELECT 
  'Vela de Ignição NGK Iridium',
  'Vela de ignição com ponta de irídio para maior durabilidade e melhor combustão. Jogo com 4 unidades.',
  156.00,
  'Mecânica',
  'NGK-IFR6Q-4SET',
  'NGK',
  'Iridium IFR6Q',
  'IFR6Q',
  '["101905601B", "06H905601A"]'::jsonb,
  20,
  s.id,
  true
FROM stores s
WHERE s.name = 'Express Parts'
LIMIT 1;

WITH last_product AS (
  SELECT id FROM products WHERE part_code = 'NGK-IFR6Q-4SET' LIMIT 1
)
INSERT INTO product_compatibility (
  product_id,
  brand,
  model,
  brand_code,
  model_code,
  year_start,
  year_end,
  engines,
  transmissions,
  fuel_types,
  valves
)
SELECT 
  id,
  'Audi',
  'A1 1.4 TFSI 122cv S-tronic 3p',
  '6',
  '5496',
  2012,
  2012,
  ARRAY['1.4'],
  NULL,
  ARRAY['Gasolina'],
  16
FROM last_product;

-- ========================================
-- STEP 3: Products for VW Gol
-- ========================================

-- Product 1: Kit Correia Dentada (Store 1)
INSERT INTO products (
  name, 
  description, 
  price, 
  category, 
  part_code, 
  brand, 
  model,
  mpn,
  oem_codes,
  stock_quantity,
  store_id,
  is_active
)
SELECT 
  'Kit Correia Dentada + Tensor',
  'Kit completo com correia dentada, tensor e rolamento. Ideal para revisão preventiva.',
  199.50,
  'Mecânica',
  'GATES-KIT-GOL',
  'Gates',
  'Kit Correia Dentada',
  'K015578XS',
  '["030109119M", "030109243J"]'::jsonb,
  18,
  s.id,
  true
FROM stores s
WHERE s.name = 'Auto Peças Central'
LIMIT 1;

WITH last_product AS (
  SELECT id FROM products WHERE part_code = 'GATES-KIT-GOL' LIMIT 1
)
INSERT INTO product_compatibility (
  product_id,
  brand,
  model,
  brand_code,
  model_code,
  year_start,
  year_end,
  engines,
  transmissions,
  fuel_types,
  valves
)
SELECT 
  id,
  'VW - VolksWagen',
  'Gol (novo) 1.0 Mi Total Flex 8V 4p',
  '59',
  '4689',
  2015,
  2015,
  ARRAY['1.0'],
  NULL,
  ARRAY['Flex'],
  8
FROM last_product;

-- Product 2: Bateria (Store 2)
INSERT INTO products (
  name, 
  description, 
  price, 
  category, 
  part_code, 
  brand, 
  model,
  mpn,
  stock_quantity,
  store_id,
  is_active
)
SELECT 
  'Bateria 60Ah Livre de Manutenção',
  'Bateria selada de alta durabilidade com 60Ah de capacidade. 18 meses de garantia.',
  450.00,
  'Bateria',
  'MOURA-60AH-GOL',
  'Moura',
  'M60GD',
  'M60GD-DIR',
  12,
  s.id,
  true
FROM stores s
WHERE s.name = 'Mecânica do Zé'
LIMIT 1;

WITH last_product AS (
  SELECT id FROM products WHERE part_code = 'MOURA-60AH-GOL' LIMIT 1
)
INSERT INTO product_compatibility (
  product_id,
  brand,
  model,
  brand_code,
  model_code,
  year_start,
  year_end,
  engines,
  transmissions,
  fuel_types,
  valves
)
SELECT 
  id,
  'VW - VolksWagen',
  'Gol (novo) 1.0 Mi Total Flex 8V 4p',
  '59',
  '4689',
  2015,
  2015,
  ARRAY['1.0'],
  NULL,
  ARRAY['Flex'],
  8
FROM last_product;

-- Product 3: Disco de Freio (Store 3)
INSERT INTO products (
  name, 
  description, 
  price, 
  category, 
  part_code, 
  brand, 
  model,
  part_position,
  mpn,
  stock_quantity,
  store_id,
  is_active
)
SELECT 
  'Disco de Freio Ventilado Dianteiro',
  'Disco de freio ventilado em ferro fundido de alta qualidade. Tratamento anticorrosivo.',
  145.90,
  'Mecânica',
  'TRW-DF4321-GOL',
  'TRW',
  'Disco Ventilado',
  'Universal',
  'DF4321',
  22,
  s.id,
  true
FROM stores s
WHERE s.name = 'Express Parts'
LIMIT 1;

WITH last_product AS (
  SELECT id FROM products WHERE part_code = 'TRW-DF4321-GOL' LIMIT 1
)
INSERT INTO product_compatibility (
  product_id,
  brand,
  model,
  brand_code,
  model_code,
  year_start,
  year_end,
  engines,
  transmissions,
  fuel_types,
  valves
)
SELECT 
  id,
  'VW - VolksWagen',
  'Gol (novo) 1.0 Mi Total Flex 8V 4p',
  '59',
  '4689',
  2015,
  2015,
  ARRAY['1.0'],
  NULL,
  ARRAY['Flex'],
  8
FROM last_product;
