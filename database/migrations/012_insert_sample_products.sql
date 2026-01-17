-- Migration 012: Insert sample products for Audi A1 and VW Gol

-- Products for Audi A1 1.4 TFSI 2012 (Gasolina, Automático, 16v)

-- 1. Filtro de Ar para Audi A1
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
  'FILTROS',
  'KN-33-2888',
  'K&N',
  'Filtro de Ar Esportivo',
  '33-2888',
  15,
  s.id,
  true
FROM stores s
WHERE s.is_active = true
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
  '59',
  '5537',
  2010,
  2015,
  ARRAY['1.4'],
  ARRAY['Automático', 'Manual'],
  ARRAY['Gasolina'],
  16
FROM last_product;

-- 2. Pastilha de Freio para Audi A1
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
  'FREIOS',
  'BB1234-AUD',
  'Bosch',
  'Pastilha Cerâmica',
  'Dianteira',
  'BP1463',
  ARRAY['1K0698151', '5K0698151'],
  25,
  s.id,
  true
FROM stores s
WHERE s.is_active = true
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
  '59',
  '5537',
  2010,
  2018,
  ARRAY['1.4', '1.6'],
  NULL,
  ARRAY['Gasolina'],
  NULL
FROM last_product;

-- 3. Óleo de Motor para Audi A1
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
  'Óleo Sintético Mobil 1 5W-40',
  'Óleo lubrificante sintético de alta performance. Embalagem com 1 litro.',
  89.90,
  'ÓLEOS',
  'MOB-5W40-1L',
  'Mobil 1',
  '5W-40 Sintético',
  'MB1-5W40',
  50,
  s.id,
  true
FROM stores s
WHERE s.is_active = true
LIMIT 1;

WITH last_product AS (
  SELECT id FROM products WHERE part_code = 'MOB-5W40-1L' LIMIT 1
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
  '59',
  '5537',
  2010,
  2018,
  ARRAY['1.4'],
  NULL,
  ARRAY['Gasolina'],
  16
FROM last_product;

-- 4. Vela de Ignição para Audi A1
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
  'MOTOR',
  'NGK-IFR6Q-4SET',
  'NGK',
  'Iridium IFR6Q',
  'IFR6Q',
  ARRAY['101905601B', '06H905601A'],
  20,
  s.id,
  true
FROM stores s
WHERE s.is_active = true
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
  '59',
  '5537',
  2010,
  2018,
  ARRAY['1.4'],
  NULL,
  ARRAY['Gasolina'],
  16
FROM last_product;

-- 5. Amortecedor Traseiro para Audi A1
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
  'Amortecedor Traseiro Pressurizado (Par)',
  'Par de amortecedores traseiros pressurizados a gás com válvula de controle progressivo.',
  580.00,
  'SUSPENSÃO',
  'CONF-AUD-TRAS',
  'Cofap',
  'Turbogas',
  'Traseiro',
  'TG4567-PAR',
  10,
  s.id,
  true
FROM stores s
WHERE s.is_active = true
LIMIT 1;

WITH last_product AS (
  SELECT id FROM products WHERE part_code = 'CONF-AUD-TRAS' LIMIT 1
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
  '59',
  '5537',
  2010,
  2018,
  NULL,
  NULL,
  NULL,
  NULL
FROM last_product;

-- Products for VW Gol (1.0, 1.6)

-- 1. Kit Correia Dentada para VW Gol
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
  'MOTOR',
  'GATES-KIT-GOL',
  'Gates',
  'Kit Correia Dentada',
  'K015578XS',
  ARRAY['030109119M', '030109243J'],
  18,
  s.id,
  true
FROM stores s
WHERE s.is_active = true
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
  'Gol',
  '59',
  '517',
  2013,
  2023,
  ARRAY['1.0', '1.6'],
  NULL,
  ARRAY['Flex', 'Gasolina'],
  NULL
FROM last_product;

-- 2. Bateria para VW Gol
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
  'ELÉTRICA',
  'MOURA-60AH-GOL',
  'Moura',
  'M60GD',
  'M60GD-DIR',
  12,
  s.id,
  true
FROM stores s
WHERE s.is_active = true
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
  'Gol',
  '59',
  '517',
  2008,
  2023,
  NULL,
  NULL,
  NULL,
  NULL
FROM last_product;

-- 3. Disco de Freio para VW Gol
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
  'FREIOS',
  'TRW-DF4321-GOL',
  'TRW',
  'Disco Ventilado',
  'Dianteiro',
  'DF4321',
  22,
  s.id,
  true
FROM stores s
WHERE s.is_active = true
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
  'Gol',
  '59',
  '517',
  2008,
  2023,
  ARRAY['1.0', '1.6'],
  NULL,
  NULL,
  NULL
FROM last_product;

-- 4. Filtro de Combustível para VW Gol
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
  'Filtro de Combustível Tecfil',
  'Filtro de combustível com alta eficiência de filtragem. Compatível com etanol e gasolina.',
  45.90,
  'FILTROS',
  'TECFIL-PSC939',
  'Tecfil',
  'Linha Leve',
  'PSC939',
  ARRAY['6Q0201051J', '6Q0201051C'],
  35,
  s.id,
  true
FROM stores s
WHERE s.is_active = true
LIMIT 1;

WITH last_product AS (
  SELECT id FROM products WHERE part_code = 'TECFIL-PSC939' LIMIT 1
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
  'Gol',
  '59',
  '517',
  2008,
  2023,
  ARRAY['1.0', '1.6'],
  NULL,
  ARRAY['Flex', 'Gasolina'],
  NULL
FROM last_product;

-- 5. Terminal de Direção para VW Gol
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
  'Terminal de Direção Axial Esquerdo',
  'Terminal de direção lado esquerdo com ponteira de alta resistência e pino cônico temperado.',
  78.50,
  'SUSPENSÃO',
  'NAKATA-N99145-ESQ',
  'Nakata',
  'Terminal Axial',
  'Esquerdo',
  'N99145',
  16,
  s.id,
  true
FROM stores s
WHERE s.is_active = true
LIMIT 1;

WITH last_product AS (
  SELECT id FROM products WHERE part_code = 'NAKATA-N99145-ESQ' LIMIT 1
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
  'Gol',
  '59',
  '517',
  2008,
  2016,
  NULL,
  NULL,
  NULL,
  NULL
FROM last_product;
