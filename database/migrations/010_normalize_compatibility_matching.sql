-- Migration 010: Normalize compatibility matching (accent/case/synonyms)

CREATE OR REPLACE FUNCTION normalize_vehicle_text(input TEXT)
RETURNS TEXT AS $$
  SELECT CASE
    WHEN input IS NULL THEN NULL
    ELSE translate(lower(trim(input)),
      'áàâãäéèêëíìîïóòôõöúùûüç',
      'aaaaaeeeeiiiiooooouuuuc'
    )
  END;
$$ LANGUAGE sql IMMUTABLE;

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
  v_transmission TEXT;
  v_engine TEXT;
  v_fuel_type TEXT;
  v_valves INTEGER;
  v_brand_n TEXT;
  v_model_n TEXT;
  v_transmission_n TEXT;
  v_engine_n TEXT;
  v_fuel_type_n TEXT;
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

  v_brand_n := normalize_vehicle_text(v_brand);
  v_model_n := normalize_vehicle_text(v_model);
  v_transmission_n := normalize_vehicle_text(v_transmission);
  v_engine_n := normalize_vehicle_text(v_engine);
  v_fuel_type_n := normalize_vehicle_text(v_fuel_type);

  -- Normalize common synonyms
  IF v_transmission_n IN ('automatico', 'automatica', 'automatic') THEN
    v_transmission_n := 'automatico';
  ELSIF v_transmission_n IN ('automatizado', 'automatizada') THEN
    v_transmission_n := 'automatizado';
  END IF;

  IF v_fuel_type_n IN ('alcool', 'etanol') THEN
    v_fuel_type_n := 'etanol';
  ELSIF v_fuel_type_n IN ('flex') THEN
    v_fuel_type_n := 'flex';
  END IF;

  -- If no vehicle found, return all products with is_compatible = false
  IF v_brand_n IS NULL OR v_model_n IS NULL THEN
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

  -- Return products with compatibility check (normalized)
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
          AND (pc.brand IS NULL OR normalize_vehicle_text(pc.brand) = v_brand_n)
          AND (pc.model IS NULL OR normalize_vehicle_text(pc.model) = v_model_n)
          AND (v_year >= pc.year_start)
          AND (pc.year_end IS NULL OR v_year <= pc.year_end)
          AND (
            pc.engines IS NULL
            OR v_engine_n IS NULL
            OR v_engine_n = ANY(pc.engines)
          )
          AND (
            pc.fuel_types IS NULL
            OR v_fuel_type_n IS NULL
            OR EXISTS (
              SELECT 1
              FROM unnest(pc.fuel_types) ft
              WHERE normalize_vehicle_text(ft) = v_fuel_type_n
              OR (normalize_vehicle_text(ft) IN ('etanol','alcool') AND v_fuel_type_n = 'etanol')
            )
          )
          AND (
            pc.transmissions IS NULL
            OR v_transmission_n IS NULL
            OR EXISTS (
              SELECT 1
              FROM unnest(pc.transmissions) tr
              WHERE normalize_vehicle_text(tr) = v_transmission_n
              OR (normalize_vehicle_text(tr) IN ('automatico','automatica','automatic') AND v_transmission_n = 'automatico')
              OR (normalize_vehicle_text(tr) IN ('automatizado','automatizada') AND v_transmission_n = 'automatizado')
            )
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
