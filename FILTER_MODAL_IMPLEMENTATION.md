# Implementação do Modal de Filtros e Sistema de Categorias

## 📋 Resumo das Mudanças

Este documento descreve todas as alterações realizadas para implementar o novo sistema de filtros avançados e atualizar o sistema de categorias do AutoPeças AI.

---

## 🎯 Objetivos Alcançados

✅ Criar novos filtros avançados no modal de filtros  
✅ Adicionar slider de preço  
✅ Atualizar sistema de categorias  
✅ Adicionar campos de busca por código e nome da peça  
✅ Adicionar filtro por posição da peça  
✅ Atualizar telas de cadastro de produtos  
✅ Criar migração de banco de dados  

---

## 📦 Dependências Instaladas

```bash
npm install @react-native-community/slider
```

**Versão instalada:** ^5.1.2

---

## 📱 Mobile App - Arquivos Modificados

### 1. **SearchScreen.tsx**

**Localização:** `mobile/src/screens/SearchScreen.tsx`

**Mudanças:**
- Atualizada interface `FilterState` com novos campos:
  - `partCode: string` - Busca por código da peça
  - `partName: string` - Busca por nome da peça
  - `part_position: string` - Filtro por posição
  - `make: string` - Marca do veículo
  - `model: string` - Modelo do veículo

- Atualizada função `applyFilters()` com novas lógicas:
  ```typescript
  // Busca por código da peça (exata)
  if (filters.partCode.trim()) {
    filtered = filtered.filter(p => 
      p.part_code?.toLowerCase() === filters.partCode.toLowerCase()
    );
  }

  // Busca por nome com primeiras letras (7, 6, 5, 4, 3, 2 letras)
  if (filters.partName.trim()) {
    const searchTerm = filters.partName.toLowerCase();
    filtered = filtered.filter(p => {
      const productName = p.name.toLowerCase();
      for (let i = Math.min(7, searchTerm.length); i >= 2; i--) {
        if (productName.startsWith(searchTerm.substring(0, i))) {
          return true;
        }
      }
      return false;
    });
  }

  // Filtro por posição
  if (filters.part_position) {
    filtered = filtered.filter(p => p.part_position === filters.part_position);
  }
  ```

---

### 2. **AdvancedFilterModal.tsx**

**Localização:** `mobile/src/components/AdvancedFilterModal.tsx`

**Mudanças:**

#### Novas Categorias
```typescript
const CATEGORIES = [
  { id: 'Acessórios', name: 'Acessórios', specs: [...] },
  { id: 'Alinhamento e Balanceamento', name: 'Alinhamento e Balanceamento', specs: [...] },
  { id: 'Bateria', name: 'Bateria', specs: [...] },
  { id: 'Escapamento', name: 'Escapamento', specs: [...] },
  { id: 'Estofamento/Interior', name: 'Estofamento/Interior', specs: [...] },
  { id: 'Lubrificantes', name: 'Lubrificantes', specs: [...] },
  { id: 'Elétrica/Injeção', name: 'Elétrica/Injeção', specs: [...] },
  { id: 'Funilaria', name: 'Funilaria', specs: [...] },
  { id: 'Mecânica', name: 'Mecânica', specs: [...] },
  { id: 'Pneus', name: 'Pneus', specs: [...] },
  { id: 'Outros', name: 'Outros', specs: [] },
];
```

#### Novas Opções de Posição
```typescript
const POSITIONS = [
  { value: 'dianteiro_direito', label: 'Dianteiro Direito' },
  { value: 'dianteiro_esquerdo', label: 'Dianteiro Esquerdo' },
  { value: 'traseiro_direito', label: 'Traseiro Direito' },
  { value: 'traseiro_esquerdo', label: 'Traseiro Esquerdo' },
];
```

#### Novos Campos do Modal
1. **Busca por Código da Peça** - TextInput para código exato
2. **Busca por Nome da Peça** - TextInput com busca inteligente
3. **Posição da Peça** - Botões de seleção única
4. **Slider de Preço** - Substituiu os campos de texto min/max

#### Novos Estilos
```typescript
textInput: { ... },
helperText: { ... },
positionContainer: { ... },
positionButton: { ... },
positionButtonActive: { ... },
positionButtonText: { ... },
positionButtonTextActive: { ... },
slider: { ... },
priceLabels: { ... },
priceLabelText: { ... },
```

---

### 3. **HomeScreen.tsx**

**Localização:** `mobile/src/screens/HomeScreen.tsx`

**Mudanças:**
- Atualizados imports de ícones do lucide-react-native
- Substituídas categorias antigas por novas:

```typescript
// ANTES:
<CategoryButton icon={Disc} label="Freios" />
<CategoryButton icon={Droplet} label="Óleo" />
<CategoryButton icon={Activity} label="Suspensão" />
<CategoryButton icon={Zap} label="Elétrica" />
<CategoryButton icon={Settings} label="Motor" />
<CategoryButton icon={BatteryCharging} label="Bateria" />

// DEPOIS:
<CategoryButton icon={Wrench} label="Acessórios" />
<CategoryButton icon={Gauge} label="Alinhamento" />
<CategoryButton icon={BatteryCharging} label="Bateria" />
<CategoryButton icon={Wind} label="Escapamento" />
<CategoryButton icon={Armchair} label="Estofamento" />
<CategoryButton icon={Droplet} label="Lubrificantes" />
<CategoryButton icon={Zap} label="Elétrica" />
<CategoryButton icon={Hammer} label="Funilaria" />
<CategoryButton icon={Settings} label="Mecânica" />
<CategoryButton icon={CircleDot} label="Pneus" />
<CategoryButton icon={MoreHorizontal} label="Outros" />
```

---

## 🌐 Web App - Arquivos Modificados

### 4. **NovoProdutoPage.tsx**

**Localização:** `src/pages/lojista/NovoProdutoPage.tsx`

**Mudanças:**

#### Interface FormData
```typescript
interface FormData {
  // ... campos existentes ...
  part_code: string;      // ✅ NOVO
  part_position: string;  // ✅ NOVO (anteriormente position - palavra reservada)
}
```

#### Categorias Atualizadas
```typescript
const categories = [
  'Acessórios',
  'Alinhamento e Balanceamento',
  'Bateria',
  'Escapamento',
  'Estofamento/Interior',
  'Lubrificantes',
  'Elétrica/Injeção',
  'Funilaria',
  'Mecânica',
  'Pneus',
  'Outros',
];
```

#### Especificações por Categoria Atualizadas
```typescript
const categorySpecifications: Record<string, string[]> = {
  'Acessórios': ['tipo', 'material', 'compatibilidade', 'cor', 'aplicação'],
  'Alinhamento e Balanceamento': ['tipo_serviço', 'aplicação', 'especificações'],
  'Bateria': ['voltagem', 'amperagem', 'cca', 'dimensões', 'tipo'],
  // ... outras categorias
};
```

#### Novos Campos no Formulário
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Código da Peça
  </label>
  <input
    type="text"
    value={formData.part_code}
    onChange={(e) => handleChange('part_code', e.target.value)}
    placeholder="Ex: KL1045008"
  />
  <p className="text-xs text-gray-500 mt-1">
    Código único da peça para busca exata
  </p>
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Posição da Peça
  </label>
  <select
    value={formData.part_position}
    onChange={(e) => handleChange('part_position', e.target.value)}
  >
    <option value="">Selecione a posição (opcional)</option>
    <option value="Dianteiro Direito">Dianteiro Direito</option>
    <option value="Dianteiro Esquerdo">Dianteiro Esquerdo</option>
    <option value="Traseiro Direito">Traseiro Direito</option>
    <option value="Traseiro Esquerdo">Traseiro Esquerdo</option>
    <option value="Central">Central</option>
    <option value="Universal">Universal</option>
  </select>
</div>
```

---

## 🗄️ Database - Migração SQL

### 5. **004_add_part_fields_and_update_categories.sql**

**Localização:** `migrations/004_add_part_fields_and_update_categories.sql`

**O que faz:**

1. **Adiciona novas colunas:**
   ```sql
   ALTER TABLE products ADD COLUMN IF NOT EXISTS part_code VARCHAR(50);
   ALTER TABLE products ADD COLUMN IF NOT EXISTS part_position VARCHAR(50);
   
   -- Renomeia coluna 'position' (palavra reservada) para 'part_position'
   DO $$ 
   BEGIN
     IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='position') THEN
       ALTER TABLE products RENAME COLUMN position TO part_position;
     END IF;
   END $$;
   ```

2. **Cria índices para otimização:**
   ```sql
   CREATE INDEX IF NOT EXISTS idx_products_part_code ON products(part_code);
   CREATE INDEX IF NOT EXISTS idx_products_position ON products(position);
   CREATE INDEX IF NOT EXISTS idx_products_name_search ON products 
     USING gin(to_tsvector('portuguese', name));
   ```

3. **Atualiza tipo da coluna category:**
   ```sql
   ALTER TABLE products ALTER COLUMN category TYPE VARCHAR(100);
   ```

4. **Adiciona constraint de categorias:**
   ```sql
   ALTER TABLE products ADD CONSTRAINT products_category_check 
   CHECK (category IN (
     'Acessórios',
     'Alinhamento e Balanceamento',
     'Bateria',
     'Escapamento',
     'Estofamento/Interior',
     'Lubrificantes',
     'Elétrica/Injeção',
     'Funilaria',
     'Mecânica',
     'Pneus',
     'Outros'
   ));
   ```

5. **Migra dados existentes:**
   ```sql
   -- Mapeia categorias antigas para novas
   UPDATE products SET category = 'Mecânica' WHERE category IN ('Freios', 'Motor', 'Suspensão', 'Transmissão');
   UPDATE products SET category = 'Lubrificantes' WHERE category IN ('Filtros', 'Óleo', 'Óleo e Filtros');
   UPDATE products SET category = 'Elétrica/Injeção' WHERE category = 'Elétrica';
   UPDATE products SET category = 'Bateria' WHERE category LIKE '%Bateria%';
   -- Categorias não mapeadas vão para 'Outros'
   ```

---

## 🎨 Design e UX

### Elementos Visuais Mantidos

- **Backdrop:** rgba(0,0,0,0.6)
- **Modal:** Fundo branco, bordas superiores arredondadas (24px)
- **Box Verde de Compatibilidade:** Background #f0fdf4, borda #bbf7d0
- **Toggle Switch:** Verde quando ativo (#16a34a / #10b981)
- **Botões de Categoria:** Azul quando selecionado (#3b82f6)
- **Botões de Posição:** Azul escuro quando selecionado (#1e3a8a)
- **Slider:** Track azul (#3b82f6)

### Animações

- Modal entra com `animationType="slide"`
- Switch com transição suave via `trackColor`

---

## 🧪 Como Testar

### 1. Backend (Banco de Dados)

Execute a migração no Supabase Dashboard → SQL Editor:

```sql
-- Execute o arquivo migrations/004_add_part_fields_and_update_categories.sql
```

Verifique:
```sql
-- Verificar novas colunas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN ('part_code', 'position');

-- Verificar constraint de categorias
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'products_category_check';
```

### 2. Mobile App

```bash
cd mobile
npm install
npm start
```

**Testar:**
1. ✅ Abrir tela de busca (SearchScreen)
2. ✅ Clicar no botão de filtros
3. ✅ Verificar novos campos:
   - Campo de código da peça
   - Campo de nome da peça
   - Botões de posição
   - Slider de preço
   - Novas categorias
4. ✅ Aplicar filtros e verificar resultados
5. ✅ Testar HomeScreen com novas categorias

### 3. Web App (Lojista)

```bash
npm start
```

**Testar:**
1. ✅ Login como lojista
2. ✅ Ir para "Produtos" → "Novo Produto"
3. ✅ Verificar novas categorias no dropdown
4. ✅ Verificar campo "Código da Peça"
5. ✅ Verificar dropdown "Posição da Peça"
6. ✅ Cadastrar produto de teste
7. ✅ Verificar se dados salvam corretamente

---

## 📊 Mapeamento de Categorias

| Categoria Antiga | Categoria Nova |
|-----------------|----------------|
| Freios | Mecânica |
| Motor | Mecânica |
| Suspensão | Mecânica |
| Transmissão | Mecânica |
| Elétrica | Elétrica/Injeção |
| Filtros | Lubrificantes |
| Óleo | Lubrificantes |
| Óleo e Fluidos | Lubrificantes |
| Pneus | Pneus |
| Bateria | Bateria |
| Acessórios | Acessórios |
| *(outras)* | Outros |

---

## 🔍 Lógica de Busca

### Busca por Código da Peça
- **Tipo:** Exata
- **Case-insensitive:** Sim
- **Exemplo:** "KL1045008" encontra apenas produtos com esse código exato

### Busca por Nome da Peça
- **Tipo:** Inteligente (primeiras letras)
- **Algoritmo:** Tenta buscar por 7, 6, 5, 4, 3, 2 primeiras letras
- **Exemplo:** 
  - Busca: "Amortecedor"
  - Encontra: "Amortecedor Dianteiro", "Amortec Plus", "Amorte X"

### Filtro por Posição
- **Tipo:** Seleção única
- **Opções:**
  - Dianteiro Direito
  - Dianteiro Esquerdo
  - Traseiro Direito
  - Traseiro Esquerdo

---

## 📝 Notas Importantes

1. **Compatibilidade:** Todas as alterações são compatíveis com iOS e Android
2. **Migração de Dados:** A migração SQL mapeia automaticamente categorias antigas para novas
3. **Campos Opcionais:** `part_code` e `position` são opcionais no cadastro
4. **Índices:** Criados para otimizar buscas por código, posição e nome
5. **RLS:** As políticas Row Level Security existentes continuam funcionando

---

## 🚀 Próximos Passos (Opcional)

- [ ] Adicionar debounce nos campos de texto do modal (otimização)
- [ ] Implementar analytics para tracking de filtros mais usados
- [ ] Adicionar testes unitários para lógica de filtros
- [ ] Implementar cache de resultados de busca
- [ ] Adicionar opção de salvar filtros favoritos

---

## 📞 Suporte

Se houver problemas:
1. Verificar se a migração SQL foi executada corretamente
2. Verificar se as dependências foram instaladas (`@react-native-community/slider`)
3. Limpar cache: `cd mobile && npm start -- --reset-cache`
4. Verificar logs do Supabase para erros de constraint

---

**Data de Implementação:** 2026-01-14  
**Versão:** 1.0.0  
**Status:** ✅ Completo
