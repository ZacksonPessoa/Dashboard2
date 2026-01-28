import type { ProductData } from './excelReader';
import { fetchTransactions, fetchProducts } from './api';

export interface ProductCost {
  titulo: string;
  custo: number;
  comissao?: number;
  frete?: number;
}

/** Converte transação da API para ProductData (formato usado pelos componentes) */
function mapTransactionToProductData(t: {
  id: string;
  productName: string;
  date: string;
  status: string;
  quantity: number;
  price: number;
  buyer: string;
  cpf: string;
  address: string;
}): ProductData {
  const precoVenda = Number(t.price) || 0;
  const totalVenda = precoVenda;
  const totalCusto = 0; // API não retorna custo por item
  const lucroReal = totalVenda - totalCusto;
  const margem = totalVenda > 0 ? (lucroReal / totalVenda) * 100 : 0;
  return {
    pedido: t.id,
    data: t.date,
    quantidade: t.quantity || 1,
    precoVenda,
    produto: t.productName,
    totalVenda,
    totalCusto,
    lucroReal,
    margem,
    comprador: t.buyer,
    cpf: t.cpf,
    endereco: t.address,
  };
}

/**
 * Carrega dados de vendas/transações da API (lm-backend-vercel).
 * @param options.from - início do período (opcional)
 * @param options.to - fim do período (opcional)
 */
export async function loadSalesData(options?: { from?: Date; to?: Date }): Promise<ProductData[]> {
  try {
    const res = await fetchTransactions(options?.from, options?.to);
    if (!res.ok || !res.transactions) return [];
    const products = res.transactions.map(mapTransactionToProductData);
    console.log(`Carregados ${products.length} transações da API`);
    return products;
  } catch (error) {
    console.error('Erro ao carregar dados da API:', error);
    return [];
  }
}

/**
 * Custos de produtos: a API não expõe endpoint de custos.
 * Retorna array vazio; o Simulador de Lucro permite digitar valores manualmente.
 */
export async function loadProductCosts(): Promise<ProductCost[]> {
  return [];
}

export interface ProductsStats {
  productsLaunched: number;
  salesOfLaunchedProducts: number;
}

/** Estatísticas de produtos lançados e vendas (API /api/ml/products) */
export async function loadProductsStats(): Promise<ProductsStats> {
  try {
    const res = await fetchProducts();
    if (!res.ok || !res.data) return { productsLaunched: 0, salesOfLaunchedProducts: 0 };
    return {
      productsLaunched: res.data.productsLaunched ?? 0,
      salesOfLaunchedProducts: res.data.salesOfLaunchedProducts ?? 0,
    };
  } catch (error) {
    console.error('Erro ao carregar estatísticas de produtos da API:', error);
    return { productsLaunched: 0, salesOfLaunchedProducts: 0 };
  }
}
