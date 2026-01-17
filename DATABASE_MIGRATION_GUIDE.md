# Database Migration Guide

## Issue: Product Registration Error (PGRST204)

### Problem
The application was failing to save products with the error:
```
Error code: PGRST204
Error message: Could not find the 'brand' column of 'products' in the schema cache
```

### Root Cause
The `products` table was missing the following columns:
- `sku` - Stock Keeping Unit (unique product identifier)
- `mpn` - Manufacturer Part Number
- `oem_codes` - Original Equipment Manufacturer reference codes (as JSONB array)
- `brand` - Product brand/manufacturer
- `model` - Product model

### Solution

#### Migration File
Run the migration file: `database/migrations/006_add_product_identification_fields.sql`

This migration adds:
1. **SKU column** with unique constraint
2. **MPN column** for manufacturer part numbers
3. **OEM codes column** as JSONB array for multiple OEM references
4. **Indexes** for efficient searching
5. **Helper function** `search_products_by_code()` for unified code search

#### How to Apply Migration

**Option 1: Supabase Dashboard (Recommended)**
1. Log in to your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the content of `database/migrations/006_add_product_identification_fields.sql`
4. Click "Run"
5. Verify success message

**Option 2: Using Supabase CLI**
```bash
supabase db push
```

**Option 3: Manual SQL**
If the migration doesn't work automatically, run these commands in order:
```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS mpn VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS oem_codes JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS model TEXT;

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_mpn ON products(mpn);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_model ON products(model);
CREATE INDEX IF NOT EXISTS idx_products_oem_codes ON products USING gin(oem_codes);
```

### Verification

After running the migration, verify the columns exist:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN ('sku', 'mpn', 'oem_codes', 'brand', 'model')
ORDER BY column_name;
```

Expected output:
```
column_name | data_type          | is_nullable
------------+--------------------+-------------
brand       | text               | YES
model       | text               | YES
mpn         | character varying  | YES
oem_codes   | jsonb              | YES
sku         | character varying  | YES
```

### Updated Schema

The complete schema is available in `database/schema.sql` and includes all necessary columns, indexes, and constraints.

## Additional Notes

- The `brand` and `model` columns were also added via migration `001_add_brand_model_columns.sql`
- SKU is now unique to prevent duplicate products
- OEM codes are stored as JSONB array for flexibility
- All new columns are nullable to support existing products

## Testing

After migration, test product creation:
1. Go to Lojista → Produtos → Novo Produto
2. Fill in all fields including SKU, Brand, Model, MPN, and OEM codes
3. Save the product
4. Verify no PGRST204 errors appear in console

## Rollback (if needed)

To rollback this migration:
```sql
ALTER TABLE products DROP COLUMN IF EXISTS sku;
ALTER TABLE products DROP COLUMN IF EXISTS mpn;
ALTER TABLE products DROP COLUMN IF EXISTS oem_codes;
-- Note: brand and model columns may be needed by other parts of the app
```

⚠️ **Warning**: Only rollback if absolutely necessary, as this will lose data in these columns.
