# Sugestões de mensagem de commit

Alterações: substituir dados da planilha pela API lm-backend-vercel.

---

## Opção 1 — Um único commit (recomendado)

```
feat: usar API lm-backend-vercel em vez de planilha para vendas e transações

- Cliente API em src/lib/api.ts (transactions, stats, finance, products)
- dataLoader passa a buscar transações e stats da API; ProductData mapeado da resposta
- Páginas e componentes usam dateRange para filtrar período na API
- SalesReport usa loadProductsStats() (produtos lançados / vendas)
- loadProductCosts retorna [] (API sem endpoint de custos)
- .env.example com VITE_API_BASE_URL
```

---

## Opção 2 — Commits por pasta/área

### Raiz do projeto
```
chore: adicionar .env.example com VITE_API_BASE_URL para API lm-backend-vercel
```

### src/lib/
```
feat(lib): cliente API e dataLoader usando lm-backend-vercel

- api.ts: fetchTransactions, fetchStats, fetchFinance, fetchProducts
- dataLoader: loadSalesData(options), loadProductCosts(), loadProductsStats()
- Mapeamento transação API -> ProductData
```

### src/pages/
```
feat(pages): carregar vendas da API com período (dateRange)

- Index, Transactions, Statistics usam useDateRange e loadSalesData({ from, to })
- Recarregam dados ao mudar período
- Statistics: mensagem de erro atualizada para API
```

### src/components/dashboard/
```
feat(dashboard): componentes usam API e dateRange

- UpdateCard, TransactionList, RevenueChart, PerformanceDonut: loadSalesData com dateRange
- SalesReport: loadProductsStats() em vez de planilha de custos
```

### lm-backend-vercel/ (se for versionado junto)
```
chore: incluir backend lm-backend-vercel no repositório
```
Ou, se já existia e não mudou:
```
(nenhum commit necessário para lm-backend-vercel se não houve alteração)
```

---

## Comandos para commitar (Opção 1)

```bash
cd c:\Users\User\Dashboard2

# Adicionar tudo
git add src/lib/api.ts src/lib/dataLoader.ts .env.example
git add src/pages/Index.tsx src/pages/Transactions.tsx src/pages/Statistics.tsx
git add src/components/dashboard/PerformanceDonut.tsx src/components/dashboard/RevenueChart.tsx
git add src/components/dashboard/SalesReport.tsx src/components/dashboard/TransactionList.tsx src/components/dashboard/UpdateCard.tsx

# Commit único
git commit -m "feat: usar API lm-backend-vercel em vez de planilha para vendas e transações"
```

Para incluir o backend (untracked):
```bash
git add lm-backend-vercel/
git commit -m "chore: adicionar backend lm-backend-vercel ao repositório"
```
