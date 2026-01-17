-- Migration 008: Add FIPE codes to compatibility and update matching function

ALTER TABLE product_compatibility
  ADD COLUMN IF NOT EXISTS brand_code TEXT,
  ADD COLUMN IF NOT EXISTS model_code TEXT;

CREATE INDEX IF NOT EXISTS idx_product_compatibility_brand_code ON product_compatibility(brand_code);
CREATE INDEX IF NOT EXISTS idx_product_compatibility_model_code ON product_compatibility(model_code);

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
  v_brand TEXT;
  v_model TEXT;
  v_year INTEGER;
  v_transmission VARCHAR;
BEGIN
  -- Get user's primary vehicle info
  SELECT
    uv.brand,
    uv.model,
    uv.year,
    uv.transmission
  INTO
    v_brand,
    v_model,
    v_year,
    v_transmission
  FROM user_vehicles uv
  WHERE uv.user_id = p_user_id AND uv.is_primary = true
  LIMIT 1;

  -- If no vehicle found, return all products with is_compatible = false
  IF v_brand IS NULL OR v_model IS NULL THEN
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

  -- Return products with compatibility check (text-based)
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
          AND (pc.brand IS NULL OR LOWER(pc.brand) = LOWER(v_brand))
          AND (pc.model IS NULL OR LOWER(pc.model) = LOWER(v_model))
          AND (v_year >= pc.year_start)
          AND (pc.year_end IS NULL OR v_year <= pc.year_end)
          AND (
            pc.transmissions IS NULL
            OR v_transmission IS NULL
            OR v_transmission = ANY(pc.transmissions)
          )
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

GRANT EXECUTE ON FUNCTION get_products_for_user_vehicle(UUID, VARCHAR, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION get_products_for_user_vehicle(UUID, VARCHAR, DECIMAL) TO anon;
