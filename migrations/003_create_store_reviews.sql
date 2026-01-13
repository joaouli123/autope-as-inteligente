-- Migration 003: Criar tabela store_reviews
-- Objetivo: Corrigir erro 404 ao buscar avaliações da loja

-- Criar tabela store_reviews (se não existir)
CREATE TABLE IF NOT EXISTS public.store_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  store_response TEXT,
  store_response_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_store_reviews_store_id ON public.store_reviews(store_id);
CREATE INDEX IF NOT EXISTS idx_store_reviews_rating ON public.store_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_store_reviews_created_at ON public.store_reviews(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.store_reviews ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "reviews_select_all" ON public.store_reviews;
CREATE POLICY "reviews_select_all" ON public.store_reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "reviews_insert_customers" ON public.store_reviews;
CREATE POLICY "reviews_insert_customers" ON public.store_reviews
  FOR INSERT WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "reviews_update_store_response" ON public.store_reviews;
CREATE POLICY "reviews_update_store_response" ON public.store_reviews
  FOR UPDATE USING (
    store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
  );

-- Comentários para documentação
COMMENT ON TABLE public.store_reviews IS 'Avaliações dos clientes sobre as lojas';
COMMENT ON COLUMN public.store_reviews.rating IS 'Nota de 1 a 5 estrelas';
COMMENT ON COLUMN public.store_reviews.store_response IS 'Resposta da loja à avaliação';
