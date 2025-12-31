# Dashboard de Vendas - Versão 1

Dashboard moderna para visualização de vendas com dados fictícios. Preparada para integração futura com APIs de marketplaces (Amazon, Shopee, Mercado Livre e Shein).

## 🚀 Funcionalidades

- ✅ Visualização de vendas por produto
- ✅ Métricas resumidas (Total de Vendas, Quantidade, Ticket Médio)
- ✅ Tabela detalhada com todos os produtos
- ✅ Cálculos automáticos de totais
- ✅ Interface responsiva e moderna
- ✅ Dados fictícios para testes

## 📊 Estrutura

### Componentes

- **DashboardCard**: Card de métrica reutilizável
- **useSalesData**: Hook customizado para gerenciar dados de vendas

### Dados Exibidos

Por produto:
- Nome do produto
- Quantidade vendida
- Valor unitário
- Valor total (quantidade × valor)

Resumo geral:
- Total de vendas do dia
- Quantidade total de produtos
- Ticket médio

## 🛠️ Tecnologias

- **React** + **TypeScript**
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes
- **Lucide React** para ícones
- **Vite** como bundler

## 🎨 Design

- Layout clean e profissional
- Fonte Inter
- Cores suaves no estilo dashboard corporativa
- Totalmente responsivo (mobile, tablet, desktop)

## 📦 Como Rodar

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🔮 Próximos Passos

A estrutura está preparada para receber integrações reais:

1. Substituir `useSalesData` por chamadas a APIs
2. Adicionar autenticação para marketplaces
3. Implementar filtros de data
4. Adicionar gráficos e visualizações
5. Exportação de relatórios

## 📁 Estrutura de Arquivos

```
src/
├── components/
│   ├── DashboardCard.tsx    # Card de métrica
│   └── ui/                  # Componentes shadcn
├── hooks/
│   └── useSalesData.ts      # Hook de dados (substituir no futuro)
└── pages/
    └── Index.tsx            # Página principal da dashboard
```

## 🔄 Integração Futura

O hook `useSalesData` foi criado para facilitar a migração futura. Para integrar com APIs reais:

```typescript
// Exemplo de migração futura
export const useSalesData = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      // Chamar APIs: Amazon, Shopee, ML, Shein
      const response = await fetch('/api/sales');
      return response.json();
    }
  });
  
  // ... cálculos permanecem os mesmos
};
```

---

## Project info

**URL**: https://lovable.dev/projects/eda23c7f-b4c6-48cb-aaaf-49ce211e07d3

Projeto criado com [Lovable](https://lovable.dev)
