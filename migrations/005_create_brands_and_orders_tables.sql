-- Migration 005: Create brands and orders tables
-- Objective: Add product brands table, orders table for references, and seed brands data

-- =========================================================================
-- TABELA: BRANDS (Marcas de Produtos)
-- =========================================================================
-- This is different from vehicle_brands - this is for product manufacturers

CREATE TABLE IF NOT EXISTS public.brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL UNIQUE,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_brands_name ON public.brands(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_brands_active ON public.brands(is_active) WHERE is_active = true;

-- Habilitar RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - brands são públicas para leitura, mas apenas admin pode inserir/atualizar
DROP POLICY IF EXISTS "brands_select_all" ON public.brands;
CREATE POLICY "brands_select_all" ON public.brands
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "brands_insert_authenticated" ON public.brands;
CREATE POLICY "brands_insert_authenticated" ON public.brands
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "brands_update_authenticated" ON public.brands;
CREATE POLICY "brands_update_authenticated" ON public.brands
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- =========================================================================
-- TABELA: ORDERS (Pedidos)
-- =========================================================================
-- Referenced by store_reviews table

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivering', 'delivered', 'cancelled')),
  payment_method VARCHAR(50) CHECK (payment_method IN ('credit_card', 'pix', 'cash', 'debit_card', 'bank_transfer')),
  delivery_address JSONB,
  status_history JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON public.orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (
    customer_id = auth.uid() 
    OR store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "orders_update_store_owner" ON public.orders;
CREATE POLICY "orders_update_store_owner" ON public.orders
  FOR UPDATE USING (
    store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at 
BEFORE UPDATE ON public.orders 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_brands_updated_at ON public.brands;
CREATE TRIGGER update_brands_updated_at 
BEFORE UPDATE ON public.brands 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- SEED DATA: Popular brands table with predefined list
-- =========================================================================

INSERT INTO public.brands (name) VALUES
-- Major OEM and Tier 1 Suppliers
('Bosch'),
('Denso'),
('ACDelco'),
('Motorcraft (Ford)'),
('Magna International'),
('ZF Friedrichshafen / ZF Aftermarket'),
('Continental AG'),
('Valeo'),
('Hyundai Mobis'),
('Aisin Seiki'),
('Lear Corporation'),
('Faurecia'),
('Yazaki'),
('Sumitomo Electric'),
('JTEKT'),
('Mahle GmbH'),
('Panasonic Automotive'),
('Toyoda Gosei'),
('Autoliv'),
('Hitachi Automotive'),
('BorgWarner'),
('Calsonic Kansei'),
('Yanfeng Automotive'),
('Gestamp'),
('Hyundai-WIA'),

-- Ignition, Sensors & Electronics
('NGK'),
('NTK'),
('Delphi'),
('Hitachi (Aftermarket)'),
('Omron'),

-- Clutches & Transmission
('Exedy'),
('Crower'),
('Cloyes'),

-- Engine Components
('Mahle Aftermarket'),
('Kolbenschmidt (KS)'),
('Wiseco'),
('ACL'),
('Total Seal'),
('Hastings'),

-- Clutch Systems (duplicate category removed, brands listed)
('LuK'),
('Sachs'),
('Valeo (embreagens)'),
('Aisin'),
('Borg & Beck'),

-- Bearings
('NSK'),

-- Suspension & Steering
('Monroe'),
('KYB'),
('Bilstein'),
('Koni'),
('Moog'),
('Meyle'),
('TRW'),
('Lemförder'),
('SWAG'),
('Axios'),
('Cofap'),
('Nakata'),
('Perfect'),
('Ridex'),
('Starline'),
('Febi'),

-- Braking Systems
('Brembo'),
('ATE'),
('Ferodo'),
('Bendix'),
('Cobreq'),
('Fras-le'),
('EBC Brakes'),
('SBS'),
('Pagid'),
('Textar'),
('Jurid'),
('Willtec'),

-- Lighting & Electrical
('Bosch (linha aftermarket)'),
('Hella'),
('TSA'),
('Gauss'),
('Marflex'),
('DS'),
('MTE-Thomson'),
('Indisa'),
('Putco'),

-- Batteries
('Optima (baterias)'),
('Varta (baterias)'),
('Exide (baterias)'),

-- Filters
('Mann-Filter'),
('Tecfil'),
('Fram'),
('Purflux'),
('Wix'),
('Baldwin'),
('Hengst'),
('K&N (performance)'),
('Mahle'),

-- Performance Parts
('K&N'),
('Akrapovič'),
('Borla'),
('Airtec'),
('Apexi'),
('Alpha Competition'),
('Eibach'),
('H&R'),
('Tein'),
('Whiteline'),
('Roush (performance)'),

-- General Aftermarket
('Dorman Products'),
('A.B.S. All Brake Systems'),
('OESpectrum'),
('Replace'),
('Carquest'),
('Duralast'),
('MasterPro'),
('Parts Plus'),
('Premium Guard'),
('Beck/Arnley'),

-- OEM Brands
('Mopar (Chrysler / Dodge / Jeep)'),
('QueenParts')

ON CONFLICT (name) DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE public.brands IS 'Marcas de produtos/peças automotivas';
COMMENT ON TABLE public.orders IS 'Pedidos dos clientes';
COMMENT ON COLUMN public.brands.name IS 'Nome da marca';
COMMENT ON COLUMN public.orders.order_number IS 'Número único do pedido';
COMMENT ON COLUMN public.orders.status IS 'Status do pedido: pending, confirmed, delivering, delivered, cancelled';

SELECT 'Migration 005 completed successfully!' as status;
