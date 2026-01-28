import { useEffect, useState, useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { format, parse, startOfMonth, endOfMonth, subMonths, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { useDateRange } from "@/contexts/DateRangeContext";
import { loadSalesData, type ProductData } from "@/lib/dataLoader";
import { filterProductsByMarketplace } from "@/lib/marketplaceFilter";
import { cn } from "@/lib/utils";

const monthNames = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

export function RevenueChart() {
  const { selectedMarketplace } = useMarketplace();
  const { dateRange } = useDateRange();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [dateRange.from, dateRange.to]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await loadSalesData({ from: dateRange.from, to: dateRange.to });
      setProducts(data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const parseDataProduto = (dataStr: string): Date | null => {
    if (!dataStr) return null;
    
    try {
      const match = dataStr.toString().match(/(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/i);
      if (match) {
        const meses: { [key: string]: string } = {
          'janeiro': '01', 'fevereiro': '02', 'março': '03', 'marco': '03', 'abril': '04',
          'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
          'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
        };
        const mesNome = match[2].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const mes = meses[mesNome];
        if (mes) {
          const dia = match[1].padStart(2, '0');
          return parse(`${dia}/${mes}/${match[3]}`, 'dd/MM/yyyy', new Date());
        }
      }
      
      const data = new Date(dataStr);
      return isNaN(data.getTime()) ? null : data;
    } catch {
      return null;
    }
  };

  // Filtrar produtos por marketplace
  const filteredProducts = useMemo(() => {
    return filterProductsByMarketplace(products, selectedMarketplace);
  }, [products, selectedMarketplace]);

  // Agrupar dados por mês
  const monthlyData = useMemo(() => {
    if (filteredProducts.length === 0) return [];

    const monthMap = new Map<string, { income: number; expenses: number }>();

    filteredProducts.forEach((product) => {
      const dataProduto = parseDataProduto(product.data || '');
      if (!dataProduto) return;

      const monthKey = format(dataProduto, 'yyyy-MM');
      const existing = monthMap.get(monthKey) || { income: 0, expenses: 0 };

      // Receita (Income) = preço de venda
      existing.income += product.precoVenda || 0;

      // Despesas (Expenses) = total de custos
      existing.expenses += product.totalCusto || 0;

      monthMap.set(monthKey, existing);
    });

    // Converter para array e ordenar por mês
    const sortedMonths = Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6); // Últimos 6 meses

    return sortedMonths.map(([monthKey, data]) => {
      const date = parse(monthKey + '-01', 'yyyy-MM-dd', new Date());
      const monthIndex = date.getMonth();
      return {
        month: monthNames[monthIndex],
        income: Math.round(data.income),
        expenses: Math.round(data.expenses),
      };
    });
  }, [filteredProducts]);

  // Calcular total e mudança percentual
  const totalStats = useMemo(() => {
    if (filteredProducts.length === 0) {
      return { totalIncome: 0, totalExpenses: 0, change: 0 };
    }

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const previousMonthStart = startOfMonth(subMonths(now, 1));
    const previousMonthEnd = endOfMonth(subMonths(now, 1));

    const currentMonthProducts = filteredProducts.filter((product) => {
      const dataProduto = parseDataProduto(product.data || '');
      if (!dataProduto) return false;
      return dataProduto >= currentMonthStart && dataProduto <= currentMonthEnd;
    });

    const previousMonthProducts = filteredProducts.filter((product) => {
      const dataProduto = parseDataProduto(product.data || '');
      if (!dataProduto) return false;
      return dataProduto >= previousMonthStart && dataProduto <= previousMonthEnd;
    });

    const currentIncome = currentMonthProducts.reduce((sum, p) => sum + (p.precoVenda || 0), 0);
    const previousIncome = previousMonthProducts.reduce((sum, p) => sum + (p.precoVenda || 0), 0);

    const change = previousIncome > 0 
      ? ((currentIncome - previousIncome) / previousIncome) * 100 
      : 0;

    // Se não houver dados do mês atual, usa todos os dados
    const totalIncome = currentMonthProducts.length > 0 
      ? currentIncome 
      : filteredProducts.reduce((sum, p) => sum + (p.precoVenda || 0), 0);

    const totalExpenses = currentMonthProducts.length > 0
      ? currentMonthProducts.reduce((sum, p) => sum + (p.totalCusto || 0), 0)
      : filteredProducts.reduce((sum, p) => sum + (p.totalCusto || 0), 0);

    return {
      totalIncome,
      totalExpenses,
      change: Math.round(change),
    };
  }, [filteredProducts]);

  const isPositive = totalStats.change >= 0;

  return (
    <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-border animate-fade-in min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-1">
            <h3 className="font-semibold text-sm sm:text-base text-foreground">Receita</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-chart-green-dark" />
                Renda
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-chart-green-light" />
                Despesas
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-3 sm:mb-4 min-w-0">
        <p className="text-2xl sm:text-3xl font-bold text-foreground break-words">
          <span className="text-base sm:text-lg align-top">R$</span>
          {isLoading ? "Carregando..." : totalStats.totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </p>
        <div className="flex items-center gap-1.5 text-sm">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-success" />
          ) : (
            <TrendingDown className="w-4 h-4 text-destructive" />
          )}
          <span className={cn(
            "font-medium",
            isPositive ? "text-success" : "text-destructive"
          )}>
            {isPositive ? "+" : ""}{totalStats.change}%
          </span>
          <span className="text-muted-foreground">do mês anterior</span>
        </div>
      </div>

      <div className="h-40">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Carregando gráfico...
          </div>
        ) : monthlyData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Nenhum dado disponível
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} barGap={2}>
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis hide />
              <Bar dataKey="income" radius={[4, 4, 0, 0]} maxBarSize={20}>
                {monthlyData.map((_, index) => (
                  <Cell key={`income-${index}`} fill="hsl(var(--chart-green-dark))" />
                ))}
              </Bar>
              <Bar dataKey="expenses" radius={[4, 4, 0, 0]} maxBarSize={20}>
                {monthlyData.map((_, index) => (
                  <Cell key={`expenses-${index}`} fill="hsl(var(--chart-green-light))" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
