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

## Migration Order

**IMPORTANT:** Execute migrations in numerical order (001, 002, 003, etc.) to ensure proper database structure.

## Verification

After running migrations, verify with:

```sql
-- Check if columns exist in products table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN ('brand', 'model');

-- Check store rating columns
SELECT column_name, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'stores' 
  AND column_name IN ('average_rating', 'total_reviews');

-- Check if store_reviews table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'store_reviews';
```

## Rollback (if needed)

If you need to revert a migration, create a new migration file with the inverse operations. **Do not modify existing migration files.**
