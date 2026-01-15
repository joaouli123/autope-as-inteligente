# Database Migrations

This directory contains SQL migration scripts for the AutoPeças Inteligente database.

## Migration Order

Execute these migrations in order:

1. `001_add_brand_model_columns.sql` - (Already in root migrations/)
2. `002_fix_store_ratings.sql` - (Already in root migrations/)
3. `003_create_store_reviews.sql` - (Already in root migrations/)
4. `004_add_part_fields_and_update_categories.sql` - (Already in root migrations/)
5. `005_add_transmission_support.sql` - **NEW** - Adds transmission support to user_vehicles and product_compatibility

## How to Apply Migrations

1. Log in to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the migration script content
4. Run the script
5. Verify the changes using the verification queries at the bottom of each script

## Migration 005: Transmission Support

This migration adds:
- `transmission` column to `user_vehicles` table
- `transmission` column to `product_compatibility` table
- Updates `get_products_for_user_vehicle()` function to match by transmission
- Grants execute permissions to authenticated and anon roles

The transmission field is optional (NULL) and when NULL in the compatibility table, it acts as a wildcard (compatible with all transmissions).

## Rollback

To rollback migration 005:

```sql
-- Remove transmission columns
ALTER TABLE user_vehicles DROP COLUMN IF EXISTS transmission;
ALTER TABLE product_compatibility DROP COLUMN IF EXISTS transmission;

-- Restore old function (without transmission support)
-- See database/schema.sql for the original function definition
```
