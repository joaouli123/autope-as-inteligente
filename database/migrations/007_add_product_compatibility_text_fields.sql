-- Migration 007: Add text-based compatibility fields for FIPE integration

ALTER TABLE product_compatibility
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS model TEXT,
  ADD COLUMN IF NOT EXISTS engines TEXT[],
  ADD COLUMN IF NOT EXISTS transmissions TEXT[],
  ADD COLUMN IF NOT EXISTS fuel_types TEXT[];

CREATE INDEX IF NOT EXISTS idx_product_compatibility_brand_text ON product_compatibility(brand);
CREATE INDEX IF NOT EXISTS idx_product_compatibility_model_text ON product_compatibility(model);
