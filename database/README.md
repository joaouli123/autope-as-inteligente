# Database Schema

This directory contains the comprehensive database schema for AutoPeças Inteligente.

## Files

- **schema.sql** - Complete database schema including:
  - Vehicle brands table (20 pre-registered brands)
  - Vehicle models table (popular models)
  - Vehicle engines table (16 engine types)
  - Product compatibility table
  - User vehicles table
  - Enhanced products table with part_code and position fields
  - Enhanced stores table with city, state, description
  - Intelligent search functions
  - Row Level Security (RLS) policies
  - Full-text search indexes

## Setup Instructions

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `schema.sql`
4. Paste and execute in the SQL Editor

The script is idempotent and can be run multiple times safely (uses `IF NOT EXISTS` and `ON CONFLICT DO NOTHING`).

## Features

### Tables
- `vehicle_brands` - 20 popular Brazilian car brands
- `vehicle_models` - Popular models for each brand
- `vehicle_engines` - 16 common engine configurations (1.0 8V to 3.6 V6)
- `product_compatibility` - Maps products to compatible vehicles
- `user_vehicles` - User-registered vehicles with primary flag
- Enhanced `products` table with `part_code` and `position` columns
- Enhanced `stores` table with location fields

### Functions
- `search_products_by_partial_name()` - Intelligent search by first 2-7 letters
- `get_products_for_user_vehicle()` - Returns products compatible with user's primary vehicle

### Views
- `products_full_info` - Complete product information with store and compatibility data

### Security
- Row Level Security (RLS) enabled on all new tables
- Public read access for vehicle catalogs
- User-specific access for user_vehicles
- Store owner access for product_compatibility

## Categories

The system supports 11 product categories:
1. Acessórios
2. Alinhamento e Balanceamento
3. Bateria
4. Escapamento
5. Estofamento/Interior
6. Lubrificantes
7. Elétrica/Injeção
8. Funilaria
9. Mecânica
10. Pneus
11. Outros

## Positions

Products can have 6 position types:
1. Dianteiro Direito
2. Dianteiro Esquerdo
3. Traseiro Direito
4. Traseiro Esquerdo
5. Central
6. Universal

## Migrations

For incremental updates, see the `/migrations/` directory for individual migration files.
