-- Migration 009: Add valves column and update compatibility matching

ALTER TABLE product_compatibility
  ADD COLUMN IF NOT EXISTS valves INTEGER;

CREATE INDEX IF NOT EXISTS idx_product_compatibility_valves ON product_compatibility(valves);

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
  v_engine TEXT;
  v_fuel_type TEXT;
  v_valves INTEGER;
BEGIN
  -- Get user's primary vehicle info
  SELECT
    uv.brand,
    uv.model,
    uv.year,
    uv.transmission,
    uv.engine,
    uv.fuel_type,
    uv.valves
  INTO
    v_brand,
    v_model,
    v_year,
    v_transmission,
    v_engine,
    v_fuel_type,
    v_valves
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
            pc.engines IS NULL
            OR v_engine IS NULL
            OR v_engine = ANY(pc.engines)
          )
          AND (
            pc.fuel_types IS NULL
            OR v_fuel_type IS NULL
            OR v_fuel_type = ANY(pc.fuel_types)
          )
          AND (
            pc.transmissions IS NULL
            OR v_transmission IS NULL
            OR v_transmission = ANY(pc.transmissions)
          )
          AND (
            pc.valves IS NULL
            OR v_valves IS NULL
            OR pc.valves = v_valves
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
