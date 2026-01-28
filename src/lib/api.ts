/**
 * Cliente da API lm-backend-vercel (Mercado Livre).
 * Em desenvolvimento: usa '' (proxy do Vite encaminha /api ao backend).
 * Em produção: VITE_API_BASE_URL ou DEFAULT_API_BASE_URL.
 */
const DEFAULT_API_BASE_URL = "https://api-mercado-livre-two.vercel.app";

/** URL base do backend (para chamadas fetch e link direto de auth). */
export const getBaseUrl = (): string => {
  // Em dev, usar mesma origem para o proxy do Vite encaminhar /api ao backend (evita CORS)
  if (import.meta.env.DEV) {
    const url = import.meta.env.VITE_API_BASE_URL;
    if (url) return String(url).replace(/\/$/, "");
    return "";
  }
  const url = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;
  if (url) return String(url).replace(/\/$/, "");
  return "";
};

/** Link direto para autorizar no ML (redireciona pelo backend). Use se "Conectar" falhar. */
export const getAuthRedirectUrl = (): string => {
  return `${getBaseUrl()}/api/ml/auth?redirect=1`;
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

export interface ApiAuthResponse {
  ok: boolean;
  authUrl?: string;
  state?: string;
  error?: string;
}

/** URL para autorizar a conta Mercado Livre (OAuth). Use para redirecionar o usuário. */
export async function fetchAuthUrl(): Promise<string> {
  const base = getBaseUrl();
  const url = `${base}/api/ml/auth`;
  const res = await fetch(url);
  const text = await res.text();

  // Se a resposta for HTML (ex.: SPA do frontend), a API não foi alcançada
  if (text.trim().toLowerCase().startsWith("<!")) {
    throw new Error(
      "A API do backend não foi alcançada (resposta em HTML). Defina VITE_API_BASE_URL no .env com a URL do backend no Vercel (ex.: https://api-mercado-livre-two.vercel.app)."
    );
  }

  let data: ApiAuthResponse;
  try {
    data = JSON.parse(text) as ApiAuthResponse;
  } catch {
    throw new Error("Resposta inválida da API. Tente novamente ou verifique a URL do backend.");
  }

  if (!res.ok || !data.authUrl) {
    throw new Error(data?.error || "Não foi possível obter a URL de conexão.");
  }
  return data.authUrl;
}
