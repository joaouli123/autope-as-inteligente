-- Migration 005: Add transmission support to user_vehicles and product_compatibility
-- Execute this in Supabase Dashboard → SQL Editor

-- =========================================================================
-- 1. Add transmission column to user_vehicles table
-- =========================================================================

ALTER TABLE user_vehicles ADD COLUMN IF NOT EXISTS transmission VARCHAR(50);

-- Create index for transmission searches
CREATE INDEX IF NOT EXISTS idx_user_vehicles_transmission ON user_vehicles(transmission);

-- Add comment to track field purpose
COMMENT ON COLUMN user_vehicles.transmission IS 'Vehicle transmission type: Manual, Automático, CVT, etc.';

-- =========================================================================
-- 2. Add transmission column to product_compatibility table
-- =========================================================================

ALTER TABLE product_compatibility ADD COLUMN IF NOT EXISTS transmission VARCHAR(50);

-- Create index for transmission compatibility searches
CREATE INDEX IF NOT EXISTS idx_product_compatibility_transmission ON product_compatibility(transmission);

-- Add comment to track field purpose
COMMENT ON COLUMN product_compatibility.transmission IS 'Compatible transmission type. NULL means compatible with all transmissions';

-- =========================================================================
-- 3. Drop and recreate the get_products_for_user_vehicle function with transmission support
-- =========================================================================

DROP FUNCTION IF EXISTS get_products_for_user_vehicle(UUID, VARCHAR, DECIMAL);

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
  part_position VARCHAR,
  price DECIMAL,
  image_url TEXT,
  store_id UUID,
  store_name VARCHAR,
  is_compatible BOOLEAN
) AS $$
DECLARE
  v_brand_id UUID;
  v_model_id UUID;
  v_engine_id UUID;
  v_year INTEGER;
  v_transmission VARCHAR;
BEGIN
  -- Get user's primary vehicle info
  SELECT 
    uv.brand_id, 
    uv.model_id, 
    uv.engine_id, 
    uv.year,
    uv.transmission
  INTO 
    v_brand_id, 
    v_model_id, 
    v_engine_id, 
    v_year,
    v_transmission
  FROM user_vehicles uv
  WHERE uv.user_id = p_user_id AND uv.is_primary = true
  LIMIT 1;

  -- If no vehicle found, return all products with is_compatible = false
  IF v_brand_id IS NULL THEN
    RETURN QUERY
    SELECT 
      p.id,
      p.name,
      p.part_code,
      p.category,
      p.part_position,
      p.price,
      p.image_url,
      s.id,
      s.name,
      false AS is_compatible
    FROM products p
    INNER JOIN stores s ON p.store_id = s.id
    WHERE p.is_active = true 
      AND s.is_active = true
      AND (p_category IS NULL OR p.category = p_category)
      AND (p_max_price IS NULL OR p.price <= p_max_price)
    ORDER BY p.created_at DESC;
    RETURN;
  END IF;

  -- Return products with compatibility check
  RETURN QUERY
  SELECT DISTINCT
    p.id,
    p.name,
    p.part_code,
    p.category,
    p.part_position,
    p.price,
    p.image_url,
    s.id,
    s.name,
    CASE 
      WHEN EXISTS (
        SELECT 1 
        FROM product_compatibility pc
        WHERE pc.product_id = p.id
          AND (pc.brand_id = v_brand_id OR pc.brand_id IS NULL)
          AND (pc.model_id = v_model_id OR pc.model_id IS NULL)
          AND (v_year >= pc.year_start)
          AND (pc.year_end IS NULL OR v_year <= pc.year_end)
          AND (pc.engine_id = v_engine_id OR pc.engine_id IS NULL)
          AND (pc.transmission = v_transmission OR pc.transmission IS NULL)
      ) THEN true 
      ELSE false 
    END AS is_compatible
  FROM products p
  INNER JOIN stores s ON p.store_id = s.id
  WHERE p.is_active = true 
    AND s.is_active = true
    AND (p_category IS NULL OR p.category = p_category)
    AND (p_max_price IS NULL OR p.price <= p_max_price)
  ORDER BY 
    is_compatible DESC,
    p.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =========================================================================
-- 4. Grant execute permissions to authenticated and anon roles
-- =========================================================================

GRANT EXECUTE ON FUNCTION get_products_for_user_vehicle(UUID, VARCHAR, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION get_products_for_user_vehicle(UUID, VARCHAR, DECIMAL) TO anon;

-- =========================================================================
-- 5. Add helpful comments
-- =========================================================================

COMMENT ON FUNCTION get_products_for_user_vehicle(UUID, VARCHAR, DECIMAL) IS 
'Returns products with compatibility check based on user primary vehicle. 
Matches brand, model, year range, engine, and transmission.
NULL values in compatibility table act as wildcards (compatible with all).';

-- =========================================================================
-- VERIFICATION QUERIES (Optional - comment out for production)
-- =========================================================================

-- Check if columns were added
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'user_vehicles' AND column_name = 'transmission';

-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'product_compatibility' AND column_name = 'transmission';

-- Check function exists
-- SELECT routine_name, routine_type 
-- FROM information_schema.routines 
-- WHERE routine_name = 'get_products_for_user_vehicle';

-- =========================================================================
-- END OF MIGRATION
-- =========================================================================
