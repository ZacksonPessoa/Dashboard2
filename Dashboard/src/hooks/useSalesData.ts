import { useMemo } from 'react';

export type Marketplace = 'Amazon' | 'Shopee' | 'Mercado Livre' | 'Shein';

export interface SaleItem {
  produto: string;
  quantidade: number;
  valorUnitario: number;
  marketplace: Marketplace;
}

export interface MarketplaceSummary {
  marketplace: Marketplace;
  totalVendas: number;
  quantidade: number;
}

export interface SalesData {
  items: SaleItem[];
  totalVendas: number;
  totalQuantidade: number;
  ticketMedio: number;
  marketplaceSummaries: MarketplaceSummary[];
}

/**
 * Hook que fornece dados fictícios de vendas com suporte a filtro por marketplace
 * No futuro, será substituído por chamadas a APIs reais (Amazon, Shopee, ML, Shein)
 */
export const useSalesData = (marketplaceFilter: Marketplace | 'Todos' = 'Todos'): SalesData => {
  // Dados fictícios com marketplace
  const allItems: SaleItem[] = useMemo(() => [
    { produto: "Creatina 300g", quantidade: 12, valorUnitario: 79.90, marketplace: "Amazon" },
    { produto: "Probiótico Candida 60 caps", quantidade: 7, valorUnitario: 59.90, marketplace: "Shopee" },
    { produto: "Vitamina C 1000mg", quantidade: 4, valorUnitario: 34.90, marketplace: "Mercado Livre" },
    { produto: "Whey Protein 900g", quantidade: 15, valorUnitario: 129.90, marketplace: "Amazon" },
    { produto: "Ômega 3 120 caps", quantidade: 9, valorUnitario: 45.90, marketplace: "Shein" },
    { produto: "Multivitamínico 60 tabs", quantidade: 6, valorUnitario: 39.90, marketplace: "Shopee" },
    { produto: "Colágeno Hidrolisado 250g", quantidade: 8, valorUnitario: 54.90, marketplace: "Mercado Livre" },
    { produto: "BCAA 120 caps", quantidade: 10, valorUnitario: 69.90, marketplace: "Amazon" },
    { produto: "Glutamina 300g", quantidade: 5, valorUnitario: 89.90, marketplace: "Shein" },
    { produto: "Colágeno Verisol 60 caps", quantidade: 10, valorUnitario: 89.90, marketplace: "Shein" },
    { produto: "Magnésio Dimalato 120 caps", quantidade: 8, valorUnitario: 49.90, marketplace: "Amazon" },
  ], []);

  // Filtra items baseado no marketplace selecionado
  const items = useMemo(() => {
    if (marketplaceFilter === 'Todos') return allItems;
    return allItems.filter(item => item.marketplace === marketplaceFilter);
  }, [allItems, marketplaceFilter]);

  const totalVendas = useMemo(() => 
    items.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0)
  , [items]);

  const totalQuantidade = useMemo(() => 
    items.reduce((acc, item) => acc + item.quantidade, 0)
  , [items]);

  const ticketMedio = useMemo(() => 
    totalQuantidade > 0 ? totalVendas / totalQuantidade : 0
  , [totalVendas, totalQuantidade]);

  // Calcula resumo por marketplace (sempre baseado em todos os dados)
  const marketplaceSummaries = useMemo(() => {
    const marketplaces: Marketplace[] = ['Amazon', 'Shopee', 'Mercado Livre', 'Shein'];
    
    return marketplaces.map(marketplace => {
      const marketplaceItems = allItems.filter(item => item.marketplace === marketplace);
      const totalVendas = marketplaceItems.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0);
      const quantidade = marketplaceItems.reduce((acc, item) => acc + item.quantidade, 0);
      
      return {
        marketplace,
        totalVendas,
        quantidade,
      };
    });
  }, [allItems]);

  return {
    items,
    totalVendas,
    totalQuantidade,
    ticketMedio,
    marketplaceSummaries,
  };
};
