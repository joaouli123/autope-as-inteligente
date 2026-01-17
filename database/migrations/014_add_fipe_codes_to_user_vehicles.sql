-- Migration 014: Add FIPE codes to user_vehicles table
-- This allows proper matching with product_compatibility which uses brand_code and model_code

-- Add brand_code and model_code columns to user_vehicles
ALTER TABLE user_vehicles 
ADD COLUMN IF NOT EXISTS brand_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS model_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS transmission VARCHAR(50);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_vehicles_brand_code ON user_vehicles(brand_code);
CREATE INDEX IF NOT EXISTS idx_user_vehicles_model_code ON user_vehicles(model_code);
CREATE INDEX IF NOT EXISTS idx_user_vehicles_transmission ON user_vehicles(transmission);

-- Add comment
COMMENT ON COLUMN user_vehicles.brand_code IS 'FIPE brand code (marca) for exact matching with product compatibility';
COMMENT ON COLUMN user_vehicles.model_code IS 'FIPE model code (modelo) for exact matching with product compatibility';
COMMENT ON COLUMN user_vehicles.transmission IS 'Transmission type: Manual, Automático, Automatizado, CVT';
