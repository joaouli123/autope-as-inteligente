# 🧪 Guia de Testes - Sistema de Filtros e Categorias

## 📋 Checklist de Testes

Use este documento para validar todas as funcionalidades implementadas.

---

## ⚙️ Preparação

### 1. Instalar Dependências

```bash
# Mobile
cd mobile
npm install

# Web (se necessário)
cd ..
npm install
```

### 2. Executar Migração do Banco de Dados

No **Supabase Dashboard** → **SQL Editor**, execute:

```sql
-- Copie e cole o conteúdo de:
-- migrations/004_add_part_fields_and_update_categories.sql
```

**Verificar sucesso:**
```sql
-- Verificar colunas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN ('part_code', 'position');

-- Deve retornar 2 linhas
```

---

## 📱 Testes Mobile App

### Teste 1: HomeScreen - Novas Categorias

**Como testar:**
1. Abrir app mobile
2. Ver tela inicial (HomeScreen)
3. Rolar horizontalmente na seção "Categorias"

**Validar:**
- [ ] Ícone Wrench - "Acessórios"
- [ ] Ícone Gauge - "Alinhamento"
- [ ] Ícone BatteryCharging - "Bateria"
- [ ] Ícone Wind - "Escapamento"
- [ ] Ícone Armchair - "Estofamento"
- [ ] Ícone Droplet - "Lubrificantes"
- [ ] Ícone Zap - "Elétrica"
- [ ] Ícone Hammer - "Funilaria"
- [ ] Ícone Settings - "Mecânica"
- [ ] Ícone CircleDot - "Pneus"
- [ ] Ícone MoreHorizontal - "Outros"

**Resultado Esperado:** ✅ 11 categorias visíveis com ícones corretos

---

### Teste 2: SearchScreen - Abrir Modal de Filtros

**Como testar:**
1. Navegar para tela de busca
2. Clicar no botão de filtros (ícone Filter no canto superior direito)

**Validar:**
- [ ] Modal abre com animação slide up
- [ ] Backdrop escuro aparece atrás do modal
- [ ] Header mostra "Filtros Avançados"
- [ ] Botão "X" para fechar visível

**Resultado Esperado:** ✅ Modal abre corretamente

---

### Teste 3: Modal de Filtros - Campo Código da Peça

**Como testar:**
1. Abrir modal de filtros
2. Rolar até campo "Busca por Código da Peça"
3. Digitar "KL1045008"
4. Clicar "Aplicar Filtros"

**Validar:**
- [ ] Campo de texto aparece
- [ ] Placeholder "Ex: KL1045008" visível
- [ ] Texto pode ser digitado
- [ ] Modal fecha ao aplicar
- [ ] Produtos são filtrados (se houver produtos com esse código)

**Resultado Esperado:** ✅ Campo funciona e filtra corretamente

---

### Teste 4: Modal de Filtros - Campo Nome da Peça

**Como testar:**
1. Abrir modal de filtros
2. Rolar até campo "Busca por Nome da Peça"
3. Digitar "Amort" (primeiras letras)
4. Clicar "Aplicar Filtros"

**Validar:**
- [ ] Campo de texto aparece
- [ ] Placeholder "Ex: Amortecedor" visível
- [ ] Texto helper "Busca inteligente por primeiras letras" aparece
- [ ] Produtos com nomes começando com "Amort" aparecem
- [ ] Busca funciona mesmo com entrada parcial

**Resultado Esperado:** ✅ Busca inteligente funciona

---

### Teste 5: Modal de Filtros - Posição da Peça

**Como testar:**
1. Abrir modal de filtros
2. Rolar até seção "Posição da Peça"
3. Clicar em "Dianteiro Direito"
4. Verificar que botão fica azul escuro (#1e3a8a)
5. Clicar novamente para desselecionar
6. Testar outros botões

**Validar:**
- [ ] 4 botões aparecem:
  - Dianteiro Direito
  - Dianteiro Esquerdo
  - Traseiro Direito
  - Traseiro Esquerdo
- [ ] Botão selecionado fica azul escuro com texto branco
- [ ] Apenas 1 botão pode ser selecionado por vez
- [ ] Clicar novamente desmarca

**Resultado Esperado:** ✅ Seleção única funciona

---

### Teste 6: Modal de Filtros - Categorias Atualizadas

**Como testar:**
1. Abrir modal de filtros
2. Rolar até seção "Categorias"
3. Ver todas as categorias disponíveis

**Validar:**
- [ ] "Acessórios" aparece
- [ ] "Alinhamento e Balanceamento" aparece
- [ ] "Bateria" aparece
- [ ] "Escapamento" aparece
- [ ] "Estofamento/Interior" aparece
- [ ] "Lubrificantes" aparece
- [ ] "Elétrica/Injeção" aparece
- [ ] "Funilaria" aparece
- [ ] "Mecânica" aparece
- [ ] "Pneus" aparece
- [ ] "Outros" aparece
- [ ] Categorias antigas (Freios, Motor, etc.) NÃO aparecem

**Resultado Esperado:** ✅ 11 novas categorias visíveis

---

### Teste 7: Modal de Filtros - Slider de Preço

**Como testar:**
1. Abrir modal de filtros
2. Rolar até seção "Preço Máximo"
3. Arrastar o slider
4. Verificar valor exibido

**Validar:**
- [ ] Slider aparece (componente da biblioteca)
- [ ] Texto "R$ X" aparece acima do slider
- [ ] Labels "R$ 0" e "R$ 5.000+" aparecem abaixo
- [ ] Slider pode ser arrastado suavemente
- [ ] Valor atualiza em tempo real
- [ ] Slider vai de 0 a 5000
- [ ] Incrementos de R$ 50

**Resultado Esperado:** ✅ Slider funciona corretamente

---

### Teste 8: Modal de Filtros - Toggle de Compatibilidade

**Como testar:**
1. Abrir modal de filtros
2. Ver seção "Compatibilidade Garantida"
3. Ativar/desativar o switch

**Validar:**
- [ ] Box verde (#f0fdf4) aparece
- [ ] Switch aparece à direita
- [ ] Se veículo cadastrado: mostra marca/modelo/ano
- [ ] Se sem veículo: mostra mensagem "Cadastre seu veículo"
- [ ] Switch fica verde quando ativo (#10b981)
- [ ] Badge verde aparece quando ativado com texto "✓ Mostrando apenas peças compatíveis..."

**Resultado Esperado:** ✅ Toggle funciona

---

### Teste 9: Aplicar Múltiplos Filtros

**Como testar:**
1. Abrir modal de filtros
2. Preencher:
   - Nome da peça: "Amor"
   - Posição: "Dianteiro Direito"
   - Categoria: "Mecânica"
   - Preço máximo: R$ 500
3. Clicar "Aplicar Filtros"

**Validar:**
- [ ] Modal fecha
- [ ] Badge de filtros ativos mostra "4"
- [ ] Apenas produtos que atendem TODOS os critérios aparecem
- [ ] Contador "X produtos encontrados" atualiza

**Resultado Esperado:** ✅ Filtros combinados funcionam

---

### Teste 10: Limpar Filtros

**Como testar:**
1. Aplicar vários filtros
2. Reabrir modal
3. Clicar botão "Limpar"

**Validar:**
- [ ] Todos os campos voltam ao estado inicial
- [ ] Código da peça: vazio
- [ ] Nome da peça: vazio
- [ ] Posição: nenhuma selecionada
- [ ] Categoria: nenhuma selecionada
- [ ] Preço: volta para 5000
- [ ] Toggle compatibilidade: desligado

**Resultado Esperado:** ✅ Limpar reseta tudo

---

## 🌐 Testes Web App (Lojista)

### Teste 11: Página Novo Produto - Categorias

**Como testar:**
1. Login como lojista
2. Ir para "Produtos" → "Novo Produto"
3. Abrir dropdown "Categoria"

**Validar:**
- [ ] Dropdown mostra 11 categorias:
  - Acessórios
  - Alinhamento e Balanceamento
  - Bateria
  - Escapamento
  - Estofamento/Interior
  - Lubrificantes
  - Elétrica/Injeção
  - Funilaria
  - Mecânica
  - Pneus
  - Outros
- [ ] Categorias antigas não aparecem

**Resultado Esperado:** ✅ Dropdown atualizado

---

### Teste 12: Página Novo Produto - Campo Código da Peça

**Como testar:**
1. Na página "Novo Produto"
2. Procurar campo "Código da Peça"
3. Digitar "KL1045008"

**Validar:**
- [ ] Campo aparece após "Modelo"
- [ ] Label "Código da Peça" visível
- [ ] Placeholder "Ex: KL1045008"
- [ ] Texto helper "Código único da peça para busca exata" aparece
- [ ] Campo aceita texto

**Resultado Esperado:** ✅ Campo funciona

---

### Teste 13: Página Novo Produto - Dropdown Posição

**Como testar:**
1. Na página "Novo Produto"
2. Procurar dropdown "Posição da Peça"
3. Abrir dropdown

**Validar:**
- [ ] Dropdown aparece após "Código da Peça"
- [ ] Label "Posição da Peça" visível
- [ ] Primeira opção: "Selecione a posição (opcional)"
- [ ] Opções:
  - Dianteiro Direito
  - Dianteiro Esquerdo
  - Traseiro Direito
  - Traseiro Esquerdo

**Resultado Esperado:** ✅ Dropdown funciona

---

### Teste 14: Cadastrar Produto com Novos Campos

**Como testar:**
1. Preencher formulário completo:
   - Nome: "Amortecedor Dianteiro"
   - Categoria: "Mecânica"
   - Código da Peça: "TEST123"
   - Posição: "Dianteiro Direito"
   - Outros campos obrigatórios
2. Salvar produto

**Validar:**
- [ ] Produto salva sem erro
- [ ] Produto aparece na lista
- [ ] Valores salvos corretamente no banco

**Verificar no banco:**
```sql
SELECT name, category, part_code, position 
FROM products 
WHERE name = 'Amortecedor Dianteiro';
```

**Resultado Esperado:** ✅ Produto salvo com sucesso

---

### Teste 15: Editar Produto Existente

**Como testar:**
1. Abrir produto para edição
2. Verificar se campos aparecem
3. Alterar "Código da Peça" e "Posição"
4. Salvar

**Validar:**
- [ ] Campos novos aparecem no formulário de edição
- [ ] Valores atuais são carregados
- [ ] Alterações salvam corretamente

**Resultado Esperado:** ✅ Edição funciona

---

## 🗄️ Testes de Banco de Dados

### Teste 16: Verificar Colunas Criadas

```sql
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN ('part_code', 'position');
```

**Validar:**
- [ ] part_code: character varying(50)
- [ ] position: character varying(50)

---

### Teste 17: Verificar Índices Criados

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'products' 
  AND indexname IN (
    'idx_products_part_code',
    'idx_products_position',
    'idx_products_name_search'
  );
```

**Validar:**
- [ ] 3 índices criados

---

### Teste 18: Verificar Constraint de Categoria

```sql
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'products_category_check';
```

**Validar:**
- [ ] Constraint contém 11 categorias novas
- [ ] Não contém categorias antigas

---

### Teste 19: Testar Busca por Código

```sql
-- Primeiro inserir produto de teste
INSERT INTO products (store_id, name, category, sku, part_code, position, price)
VALUES (
  'STORE_ID_AQUI',
  'Teste Busca',
  'Mecânica',
  'TEST001',
  'KL1045008',
  'dianteiro_direito',
  100.00
);

-- Buscar por código
SELECT * FROM products WHERE part_code = 'KL1045008';
```

**Validar:**
- [ ] Produto é encontrado
- [ ] Busca é rápida (< 100ms com índice)

---

### Teste 20: Testar Migração de Categorias

```sql
-- Ver distribuição de categorias
SELECT category, COUNT(*) 
FROM products 
GROUP BY category 
ORDER BY COUNT(*) DESC;
```

**Validar:**
- [ ] Apenas categorias novas aparecem
- [ ] Nenhum produto com categoria antiga

---

## ✅ Resumo de Testes

### Checklist Final

**Mobile:**
- [ ] HomeScreen mostra 11 categorias com ícones corretos
- [ ] Modal de filtros abre corretamente
- [ ] Campo código da peça funciona
- [ ] Campo nome da peça funciona
- [ ] Filtro de posição funciona
- [ ] Categorias atualizadas aparecem
- [ ] Slider de preço funciona
- [ ] Toggle de compatibilidade funciona
- [ ] Múltiplos filtros funcionam juntos
- [ ] Limpar filtros reseta tudo

**Web:**
- [ ] Dropdown de categorias atualizado
- [ ] Campo código da peça aparece
- [ ] Dropdown posição aparece
- [ ] Cadastro de produto funciona
- [ ] Edição de produto funciona

**Banco:**
- [ ] Colunas criadas
- [ ] Índices criados
- [ ] Constraint atualizada
- [ ] Busca por código funciona
- [ ] Migração de categorias completa

---

## 🐛 Problemas Conhecidos

Nenhum problema conhecido no momento. Se encontrar bugs:

1. Verificar console do navegador/terminal
2. Verificar logs do Supabase
3. Verificar se migração foi executada
4. Verificar se dependências foram instaladas

---

## 📞 Suporte

**Documentação Completa:** `FILTER_MODAL_IMPLEMENTATION.md`

**Migração SQL:** `migrations/004_add_part_fields_and_update_categories.sql`

**Arquivos Principais:**
- `mobile/src/screens/SearchScreen.tsx`
- `mobile/src/components/AdvancedFilterModal.tsx`
- `mobile/src/screens/HomeScreen.tsx`
- `src/pages/lojista/NovoProdutoPage.tsx`
