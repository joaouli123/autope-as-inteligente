-- Migration 004: Add part_code and position columns, update categories
-- Execute this in Supabase Dashboard → SQL Editor

-- 1. Add new columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS part_code VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS position VARCHAR(50);

-- 2. Create indexes for the new columns to optimize searches
CREATE INDEX IF NOT EXISTS idx_products_part_code ON products(part_code);
CREATE INDEX IF NOT EXISTS idx_products_position ON products(position);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('portuguese', name));

-- 3. Update category column type to allow longer category names
ALTER TABLE products ALTER COLUMN category TYPE VARCHAR(100);

-- 4. Drop old category constraint if it exists
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;

-- 5. Add new category constraint with updated categories
ALTER TABLE products ADD CONSTRAINT products_category_check 
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

-- 6. Migration script to map old categories to new ones
-- Update existing data to match new categories (adjust as needed based on your data)

-- Map old 'Freios' category to 'Mecânica'
UPDATE products SET category = 'Mecânica' WHERE category = 'Freios';

-- Map old 'Motor' category to 'Mecânica'
UPDATE products SET category = 'Mecânica' WHERE category = 'Motor';

-- Map old 'Suspensão' category to 'Mecânica'
UPDATE products SET category = 'Mecânica' WHERE category = 'Suspensão';

-- Map old 'Transmissão' category to 'Mecânica'
UPDATE products SET category = 'Mecânica' WHERE category = 'Transmissão';

-- Map old 'Elétrica' category to 'Elétrica/Injeção'
UPDATE products SET category = 'Elétrica/Injeção' WHERE category = 'Elétrica';

-- Map old 'Filtros' or oil-related categories to 'Lubrificantes'
UPDATE products SET category = 'Lubrificantes' WHERE category IN ('Filtros', 'Óleo', 'Óleo e Filtros');

-- Map bateria-related products to 'Bateria'
UPDATE products SET category = 'Bateria' WHERE category LIKE '%Bateria%' OR name LIKE '%bateria%';

-- Map any remaining unmapped categories to 'Outros'
UPDATE products SET category = 'Outros' 
WHERE category NOT IN (
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
);

-- 7. Add comment to track migration
COMMENT ON COLUMN products.part_code IS 'Part code for exact search (e.g., KL1045008)';
COMMENT ON COLUMN products.position IS 'Part position: dianteiro_direito, dianteiro_esquerdo, traseiro_direito, traseiro_esquerdo';
