# Configuração do Banco de Dados

Este arquivo contém as instruções SQL necessárias para configurar corretamente a tabela `stores` no Supabase.

## Como Aplicar

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Copie e cole o código SQL abaixo
4. Execute o script

## Script SQL

```sql
-- Verificar se a tabela stores existe e tem todas as colunas necessárias
CREATE TABLE IF NOT EXISTS stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  cnpj TEXT UNIQUE,
  phone TEXT,
  email TEXT NOT NULL,
  address JSONB,
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar colunas se não existirem
ALTER TABLE stores ADD COLUMN IF NOT EXISTS cnpj TEXT UNIQUE;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_cnpj ON stores(cnpj);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);

-- Habilitar RLS (Row Level Security)
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Políticas: Lojistas podem ver apenas suas próprias lojas
DROP POLICY IF EXISTS "Lojistas podem ver suas lojas" ON stores;
CREATE POLICY "Lojistas podem ver suas lojas" ON stores
  FOR SELECT USING (auth.uid() = owner_id);

-- Políticas: Lojistas podem atualizar apenas suas próprias lojas
DROP POLICY IF EXISTS "Lojistas podem atualizar suas lojas" ON stores;
CREATE POLICY "Lojistas podem atualizar suas lojas" ON stores
  FOR UPDATE USING (auth.uid() = owner_id);

-- Políticas: Permitir inserção de novas lojas
DROP POLICY IF EXISTS "Permitir criação de lojas" ON stores;
CREATE POLICY "Permitir criação de lojas" ON stores
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
```

## Verificação

Após executar o script, você pode verificar se tudo foi criado corretamente:

```sql
-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'stores'
ORDER BY ordinal_position;

-- Verificar índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'stores';

-- Verificar políticas
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'stores';
```

## Notas Importantes

- Execute este script **antes** de tentar cadastrar uma nova loja
- Se houver usuários de teste antigos, delete-os no **Supabase Auth** antes de testar
- A coluna `slug` é obrigatória e deve ser única para cada loja
- A coluna `cnpj` também deve ser única
