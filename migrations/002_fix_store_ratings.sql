-- Migration 002: Corrigir campos average_rating e total_reviews na tabela stores
-- Objetivo: Evitar erro "Cannot read properties of undefined (reading 'toFixed')"

-- Atualizar valores NULL para 0
UPDATE public.stores 
SET average_rating = 0 
WHERE average_rating IS NULL;

UPDATE public.stores 
SET total_reviews = 0 
WHERE total_reviews IS NULL;

-- Garantir que novos registros tenham valores padrão
ALTER TABLE public.stores 
  ALTER COLUMN average_rating SET DEFAULT 0;

ALTER TABLE public.stores 
  ALTER COLUMN total_reviews SET DEFAULT 0;

-- Adicionar constraints para não aceitar NULL
ALTER TABLE public.stores 
  ALTER COLUMN average_rating SET NOT NULL;

ALTER TABLE public.stores 
  ALTER COLUMN total_reviews SET NOT NULL;

-- Comentários para documentação
COMMENT ON COLUMN public.stores.average_rating IS 'Nota média da loja (0-5). Padrão: 0';
COMMENT ON COLUMN public.stores.total_reviews IS 'Total de avaliações recebidas. Padrão: 0';
