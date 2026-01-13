# Configuração do Banco de Dados Supabase

Este documento contém os scripts SQL necessários para configurar o banco de dados do projeto.

## ⚠️ IMPORTANTE

Execute estes comandos no **Supabase Dashboard** → **SQL Editor** antes de usar a aplicação.

## 📋 Scripts SQL

### 1. Criar Tabelas

```sql
-- Tabela USERS
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('consumer', 'store_owner', 'admin')),
  name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela STORES
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
```

### 2. Criar Índices

```sql
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON public.stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_cnpj ON public.stores(cnpj);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores(slug);
```

### 3. Habilitar RLS e Configurar Políticas

```sql
-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Políticas para USERS
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Políticas para STORES
DROP POLICY IF EXISTS "stores_select_active" ON public.stores;
CREATE POLICY "stores_select_active" ON public.stores
  FOR SELECT USING (is_active = true OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "stores_insert_own" ON public.stores;
CREATE POLICY "stores_insert_own" ON public.stores
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "stores_update_own" ON public.stores;
CREATE POLICY "stores_update_own" ON public.stores
  FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "stores_delete_own" ON public.stores;
CREATE POLICY "stores_delete_own" ON public.stores
  FOR DELETE USING (auth.uid() = owner_id);
```

### 4. Função para atualizar updated_at automaticamente

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para users
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para stores
DROP TRIGGER IF EXISTS update_stores_updated_at ON public.stores;
CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

## 🧪 Verificação

Após executar os scripts, verifique se as tabelas foram criadas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'stores');
```

## 🔧 Comandos Úteis para Debug

### Limpar dados de teste

```sql
-- Ver todas as lojas
SELECT * FROM public.stores;

-- Deletar lojas de teste
TRUNCATE TABLE public.stores CASCADE;

-- Deletar usuários órfãos (que não existem no Auth)
DELETE FROM public.users 
WHERE id NOT IN (SELECT id FROM auth.users);
```
