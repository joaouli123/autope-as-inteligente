-- Migration 001: Adicionar colunas brand e model na tabela products
-- Objetivo: Corrigir erro PGRST204 ao tentar inserir produtos

-- Adicionar colunas brand e model (caso não existam)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS model TEXT;

-- Criar índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_model ON public.products(model);

-- Comentários para documentação
COMMENT ON COLUMN public.products.brand IS 'Marca do produto (ex: Bosch, NGK, Denso)';
COMMENT ON COLUMN public.products.model IS 'Modelo específico do produto';
