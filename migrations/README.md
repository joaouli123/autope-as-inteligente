# Database Migrations

This folder contains SQL migration scripts for the Supabase database.

## How to Apply Migrations

Execute these SQL scripts in order via **Supabase Dashboard** → **SQL Editor**:

### 1. 001_add_brand_model_columns.sql
**Purpose:** Adds `brand` and `model` columns to the `products` table.

**Problem Solved:** Fixes error `PGRST204 - Could not find the 'brand' column of 'products'` when trying to insert new products.

**What it does:**
- Adds `brand` TEXT column to `products` table
- Adds `model` TEXT column to `products` table
- Creates indexes for optimized searches on both columns

---

### 2. 002_fix_store_ratings.sql
**Purpose:** Ensures `average_rating` and `total_reviews` columns have default values.

**Problem Solved:** Fixes error `TypeError: Cannot read properties of undefined (reading 'toFixed')` that crashes the "Minha Loja" page.

**What it does:**
- Updates all NULL values to 0
- Sets DEFAULT 0 for new records
- Adds NOT NULL constraints

---

### 3. 003_create_store_reviews.sql
**Purpose:** Creates the `store_reviews` table with proper RLS policies.

**Problem Solved:** Fixes 404 error when fetching store reviews.

**What it does:**
- Creates `store_reviews` table
- Adds indexes for performance
- Configures Row Level Security (RLS) policies
- Allows customers to insert reviews
- Allows store owners to respond to reviews

---

### 4. 004_add_part_fields_and_update_categories.sql
**Purpose:** Adds new search fields and updates category system.

**Problem Solved:** Enables advanced filtering by part code, part name, and position. Updates category system to match new business requirements.

**What it does:**
- Adds `part_code` column for exact part code searches
- Adds `position` column for filtering by part position (front/rear, left/right)
- Creates optimized indexes for new search fields
- Updates category constraint to new category list
- Migrates existing category data to new categories

---

### 5. 005_create_brands_and_orders_tables.sql
**Purpose:** Creates `brands` table for product manufacturers and `orders` table for order management.

**Problem Solved:** 
- Fixes 400 error when loading resources from stores endpoint
- Fixes 422 error during signup
- Fixes missing table errors for `orders` (referenced by store_reviews)
- Enables dynamic brand selection with autocomplete in product registration

**What it does:**
- Creates `brands` table with 100+ predefined automotive part brands
- Creates `orders` table for managing customer orders
- Creates `store_reviews` table (if not exists) with proper foreign key to orders
- Adds RLS (Row Level Security) policies for all tables
- Seeds brands table with comprehensive list of automotive part manufacturers
- Adds indexes for performance optimization

---

## Migration Order

**IMPORTANT:** Execute migrations in numerical order (001, 002, 003, 004, 005, etc.) to ensure proper database structure.

## Verification

After running migrations, verify with:

```sql
-- Check if columns exist in products table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN ('brand', 'model', 'part_code', 'position');

-- Check store rating columns
SELECT column_name, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'stores' 
  AND column_name IN ('average_rating', 'total_reviews');

-- Check if store_reviews table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'store_reviews';

-- Check if brands and orders tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('brands', 'orders');

-- Count brands in the database
SELECT COUNT(*) as brand_count FROM brands;

-- Check orders table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders';
```

## Rollback (if needed)

If you need to revert a migration, create a new migration file with the inverse operations. **Do not modify existing migration files.**
