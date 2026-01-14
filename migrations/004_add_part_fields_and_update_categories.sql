-- Migration 004: Add part_code and part_position columns, update categories
-- Execute this in Supabase Dashboard → SQL Editor

-- 1. Add new columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS part_code VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS part_position VARCHAR(50);

-- 2. Rename old position column if it exists (reserved word fix)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='products' AND column_name='position') THEN
    ALTER TABLE public.products RENAME COLUMN position TO part_position;
  END IF;
END $$;

-- 3. Create indexes for the new columns to optimize searches
CREATE INDEX IF NOT EXISTS idx_products_part_code ON products(part_code);
CREATE INDEX IF NOT EXISTS idx_products_part_position ON products(part_position);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('portuguese', name));

-- 4. Update category column type to allow longer category names
ALTER TABLE products ALTER COLUMN category TYPE VARCHAR(100);

-- 5. Drop old category constraint if it exists
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;

-- 6. Add new category constraint with updated categories
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

-- 7. Drop old position constraint if it exists
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_position_check;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_part_position_check;

-- 8. Add new part_position constraint with 6 positions
ALTER TABLE products ADD CONSTRAINT products_part_position_check 
CHECK (part_position IS NULL OR part_position IN (
  'Dianteiro Direito',
  'Dianteiro Esquerdo',
  'Traseiro Direito',
  'Traseiro Esquerdo',
  'Central',
  'Universal'
));

-- 9. Migration script to map old categories to new ones
-- Update existing data to match new categories (adjust as needed based on your data)

-- Map old 'Freios' category to 'Mecânica'
UPDATE products SET category = 'Mecânica' WHERE category = 'Freios';

-- Map old 'Motor' category to 'Mecânica'
UPDATE products SET category = 'Mecânica' WHERE category = 'Motor';

-- Map old 'Suspensão' category to 'Mecânica'
UPDATE products SET category = 'Mecânica' WHERE category = 'Suspensão';

-- Map old 'Transmissão' category to 'Mecânica'
UPDATE products SET category = 'Mecânica' WHERE category = 'Transmissão';

-- Map old 'Elétrica' category to 'Elétrica'
UPDATE products SET category = 'Elétrica' WHERE category = 'Elétrica/Injeção';

-- Map old 'Filtros' or oil-related categories to 'Lubrificantes'
UPDATE products SET category = 'Lubrificantes' WHERE category IN ('Filtros', 'Óleo', 'Óleo e Filtros');

-- Map bateria-related products to 'Bateria'
UPDATE products SET category = 'Bateria' WHERE category LIKE '%Bateria%' OR LOWER(name) LIKE '%bateria%';

-- Map any remaining unmapped categories to 'Outros'
UPDATE products SET category = 'Outros' 
WHERE category NOT IN (
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
);

-- 10. Add comments to track migration
COMMENT ON COLUMN products.part_code IS 'Part code for exact search (e.g., KL1045008)';
COMMENT ON COLUMN products.part_position IS 'Part position: Dianteiro Direito, Dianteiro Esquerdo, Traseiro Direito, Traseiro Esquerdo, Central, Universal';

