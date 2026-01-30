import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { parse } from "date-fns";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { useSalesData } from "@/contexts/SalesDataContext";
import { filterProductsByMarketplace } from "@/lib/marketplaceFilter";

export function PerformanceDonut() {
  const { selectedMarketplace } = useMarketplace();
  const { salesData, isLoadingUpload } = useSalesData();
  const products = salesData;

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

  // Calcular dados de desempenho
  const performanceData = useMemo(() => {
    if (filteredProducts.length === 0) {
      return {
        totalVendas: 0,
        receitaTotal: 0,
        lucroTotal: 0,
        comLucro: 0,
        comPrejuizo: 0,
        semLucro: 0,
        chartData: []
      };
    }

    const totalVendas = filteredProducts.length;
    const receitaTotal = filteredProducts.reduce((sum, p) => sum + (p.precoVenda || 0), 0);
    const lucroTotal = filteredProducts.reduce((sum, p) => sum + (p.lucroReal || 0), 0);
    
    const comLucro = filteredProducts.filter(p => (p.lucroReal || 0) > 0).length;
    const comPrejuizo = filteredProducts.filter(p => (p.lucroReal || 0) < 0).length;
    const semLucro = filteredProducts.filter(p => (p.lucroReal || 0) === 0).length;

    // Dados para o gráfico donut: distribuição por lucro/prejuízo
    const chartData = [
      { 
        name: "Com Lucro", 
        value: comLucro, 
        color: "hsl(var(--chart-green-light))",
        percent: totalVendas > 0 ? Math.round((comLucro / totalVendas) * 100) : 0
      },
      { 
        name: "Com Prejuízo", 
        value: comPrejuizo, 
        color: "hsl(var(--chart-orange))",
        percent: totalVendas > 0 ? Math.round((comPrejuizo / totalVendas) * 100) : 0
      },
      { 
        name: "Sem Lucro", 
        value: semLucro, 
        color: "hsl(var(--chart-green-dark))",
        percent: totalVendas > 0 ? Math.round((semLucro / totalVendas) * 100) : 0
      },
    ].filter(item => item.value > 0); // Remove itens com valor zero

    return {
      totalVendas,
      receitaTotal,
      lucroTotal,
      comLucro,
      comPrejuizo,
      semLucro,
      chartData
    };
  }, [filteredProducts]);

  // Formatar valor para exibição
  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + "K";
    }
    return value.toString();
  };

  return (
    <div className="bg-card rounded-2xl p-5 border border-border animate-fade-in">
      <h3 className="font-semibold text-foreground mb-4">Desempenho de Vendas Diárias</h3>

      {isLoadingUpload ? (
        <div className="flex items-center justify-center h-44 text-muted-foreground">
          Carregando...
        </div>
      ) : performanceData.chartData.length === 0 ? (
        <div className="flex items-center justify-center h-44 text-muted-foreground">
          Nenhum dado disponível
        </div>
      ) : (
        <>
          <div className="relative h-44 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceData.chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {performanceData.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xs text-muted-foreground">Total de Vendas</p>
              <p className="text-2xl font-bold text-foreground">
                {formatValue(performanceData.totalVendas)}
              </p>
            </div>

            {/* Percentage Labels - posicionamento dinâmico baseado nos dados */}
            {performanceData.chartData.map((entry, index) => {
              const positions = [
                { top: "top-2", left: "left-1/4" },
                { top: "top-6", left: "right-1/4" },
                { top: "bottom-6", left: "left-1/4" },
              ];
              const pos = positions[index] || { top: "top-2", left: "left-1/2" };
              return (
                <div 
                  key={index}
                  className={`absolute ${pos.top} ${pos.left} text-xs font-medium text-muted-foreground`}
                >
                  {entry.percent}%
                </div>
              );
            })}
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Receita Total:</span>
              <span className="font-semibold text-foreground">
                R$ {performanceData.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Lucro Total:</span>
              <span className={`font-semibold ${performanceData.lucroTotal >= 0 ? 'text-success' : 'text-destructive'}`}>
                R$ {performanceData.lucroTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2 mt-4 text-xs">
            {performanceData.chartData.map((entry, index) => (
              <span key={index} className="flex items-center justify-between gap-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
                  {entry.name}
                </span>
                <span className="text-muted-foreground">
                  {entry.value} ({entry.percent}%)
                </span>
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
