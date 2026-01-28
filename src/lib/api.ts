/**
 * Cliente da API lm-backend-vercel (Mercado Livre).
 * Base URL: VITE_API_BASE_URL (vazio = mesma origem, ex: /api)
 */

const getBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_BASE_URL;
  if (url) return url.replace(/\/$/, "");
  return "";
};

export interface ApiTransaction {
  id: string;
  productName: string;
  date: string;
  status: string;
  quantity: number;
  price: number;
  buyer: string;
  cpf: string;
  address: string;
}

export interface ApiTransactionsResponse {
  ok: boolean;
  transactions: ApiTransaction[];
}

export interface ApiStatsResponse {
  ok: boolean;
  stats: {
    totalSales: number;
    todaySales: number;
    pendingShipments: number;
    cancelled: number;
    totalOrders: number;
    netRevenue: number;
    realProfit: number;
    margin: number;
  };
}

export interface ApiFinanceResponse {
  ok: boolean;
  data: Array<{ day: string; renda: number; despesas: number; rendaValue: number; despesasValue: number; highlight?: boolean }>;
  maxValue: number;
}

export interface ApiProductsResponse {
  ok: boolean;
  data: {
    productsLaunched: number;
    salesOfLaunchedProducts: number;
  };
}

async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const base = getBaseUrl();
  const url = new URL(path.startsWith("http") ? path : `${base}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString());
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || `API error ${res.status}`);
  }
  return data as T;
}

function dateToYMD(d: Date): string {
  return d.toISOString().split("T")[0];
}

/** Transações (pedidos) no período */
export async function fetchTransactions(from?: Date, to?: Date): Promise<ApiTransactionsResponse> {
  const params: Record<string, string> = {};
  if (from) params.from = dateToYMD(from);
  if (to) params.to = dateToYMD(to);
  return apiGet<ApiTransactionsResponse>("/api/ml/transactions", Object.keys(params).length ? params : undefined);
}

/** Estatísticas agregadas no período */
export async function fetchStats(from?: Date, to?: Date): Promise<ApiStatsResponse> {
  const params: Record<string, string> = {};
  if (from) params.from = dateToYMD(from);
  if (to) params.to = dateToYMD(to);
  return apiGet<ApiStatsResponse>("/api/ml/stats", Object.keys(params).length ? params : undefined);
}

/** Dados financeiros (gráfico semana) */
export async function fetchFinance(from?: Date, to?: Date): Promise<ApiFinanceResponse> {
  const params: Record<string, string> = {};
  if (from) params.from = dateToYMD(from);
  if (to) params.to = dateToYMD(to);
  return apiGet<ApiFinanceResponse>("/api/ml/finance", Object.keys(params).length ? params : undefined);
}

/** Produtos lançados e vendas desses produtos */
export async function fetchProducts(): Promise<ApiProductsResponse> {
  return apiGet<ApiProductsResponse>("/api/ml/products");
}
