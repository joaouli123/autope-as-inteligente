-- Migration 006: Add product identification fields (SKU, MPN, OEM codes)
-- Execute this in Supabase Dashboard → SQL Editor
-- Purpose: Fix PGRST204 error - add missing columns for product identification

-- =========================================================================
-- 1. Add SKU (Stock Keeping Unit) column
-- =========================================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100);

-- Make SKU unique to prevent duplicate products (only when SKU is provided)
-- Using a partial unique index allows NULL values while enforcing uniqueness for non-NULL values
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku_partial_unique ON products(sku) WHERE sku IS NOT NULL;

-- Create index for fast SKU lookups
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Add comment to track field purpose
COMMENT ON COLUMN products.sku IS 'Stock Keeping Unit - Unique product identifier for inventory management';

-- =========================================================================
-- 2. Add MPN (Manufacturer Part Number) column
-- =========================================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS mpn VARCHAR(100);

-- Create index for MPN searches
CREATE INDEX IF NOT EXISTS idx_products_mpn ON products(mpn);

-- Add comment to track field purpose
COMMENT ON COLUMN products.mpn IS 'Manufacturer Part Number - Original part number from manufacturer';

-- =========================================================================
-- 3. Add OEM codes (Original Equipment Manufacturer codes) as JSONB array
-- =========================================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS oem_codes JSONB;

-- Create GIN index for efficient array searches in JSONB
CREATE INDEX IF NOT EXISTS idx_products_oem_codes ON products USING gin(oem_codes);

-- Add comment to track field purpose
COMMENT ON COLUMN products.oem_codes IS 'OEM reference codes as JSON array - Original Equipment Manufacturer codes for cross-referencing';

-- =========================================================================
-- 4. Update existing NULL values to maintain data integrity
-- =========================================================================

-- Set default empty array for oem_codes where NULL
UPDATE products SET oem_codes = '[]'::jsonb WHERE oem_codes IS NULL;

-- =========================================================================
-- 5. Add constraints to ensure data quality
-- =========================================================================

-- Ensure SKU is not empty string if provided
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sku_not_empty;
ALTER TABLE products ADD CONSTRAINT products_sku_not_empty 
CHECK (sku IS NULL OR length(trim(sku)) > 0);

-- Ensure MPN is not empty string if provided
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_mpn_not_empty;
ALTER TABLE products ADD CONSTRAINT products_mpn_not_empty 
CHECK (mpn IS NULL OR length(trim(mpn)) > 0);

-- Ensure oem_codes is a valid JSON array
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_oem_codes_is_array;
ALTER TABLE products ADD CONSTRAINT products_oem_codes_is_array 
CHECK (oem_codes IS NULL OR jsonb_typeof(oem_codes) = 'array');

-- =========================================================================
-- 6. Create helper function to search products by any code
-- =========================================================================

CREATE OR REPLACE FUNCTION search_products_by_code(search_code TEXT)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  sku VARCHAR,
  mpn VARCHAR,
  oem_codes JSONB,
  price DECIMAL,
  match_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.sku,
    p.mpn,
    p.oem_codes,
    p.price,
    CASE
      WHEN p.sku = search_code THEN 'SKU'
      WHEN p.mpn = search_code THEN 'MPN'
      WHEN p.part_code = search_code THEN 'Part Code'
      WHEN p.oem_codes ? search_code THEN 'OEM'
      ELSE 'Unknown'
    END AS match_type
  FROM products p
  WHERE p.is_active = true 
    AND (
      p.sku = search_code 
      OR p.mpn = search_code 
      OR p.part_code = search_code
      OR p.oem_codes ? search_code
    )
  ORDER BY 
    CASE
      WHEN p.sku = search_code THEN 1
      WHEN p.mpn = search_code THEN 2
      WHEN p.part_code = search_code THEN 3
      ELSE 4
    END,
    p.name;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION search_products_by_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION search_products_by_code(TEXT) TO anon;

-- Add helpful comment
COMMENT ON FUNCTION search_products_by_code(TEXT) IS 
'Search products by any identification code: SKU, MPN, Part Code, or OEM codes';

-- =========================================================================
-- VERIFICATION QUERIES (Optional - uncomment to verify)
-- =========================================================================

-- Check if columns were added
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'products' 
--   AND column_name IN ('sku', 'mpn', 'oem_codes')
-- ORDER BY column_name;

-- Check indexes
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'products' 
--   AND indexname LIKE '%sku%' OR indexname LIKE '%mpn%' OR indexname LIKE '%oem%';

-- Test the search function
-- SELECT * FROM search_products_by_code('TEST-SKU-001');

-- =========================================================================
-- END OF MIGRATION
-- =========================================================================

SELECT 'Migration 006 completed successfully - Product identification fields added' as status;
