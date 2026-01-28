import { useEffect, useState, useMemo } from "react";
import { MoreHorizontal } from "lucide-react";
import { loadProductsStats } from "@/lib/dataLoader";

export function SalesReport() {
  const [stats, setStats] = useState<{ productsLaunched: number; salesOfLaunchedProducts: number }>({
    productsLaunched: 0,
    salesOfLaunchedProducts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await loadProductsStats();
      setStats(data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Métricas da API (produtos lançados e vendas desses produtos)
  const reportData = useMemo(() => {
    const produtosLancados = stats.productsLaunched;
    const vendasProdutosLancados = stats.salesOfLaunchedProducts;
    const maxValue = Math.max(produtosLancados, vendasProdutosLancados, 1);

    const data = [
      {
        label: "Produtos Lançados",
        value: produtosLancados,
        color: "bg-chart-green-light",
        maxWidth: `${Math.min((produtosLancados / maxValue) * 100, 100)}%`,
      },
      {
        label: "Vendas de Produtos Lançados",
        value: vendasProdutosLancados,
        color: "bg-accent",
        maxWidth: `${Math.min((vendasProdutosLancados / maxValue) * 100, 100)}%`,
      },
    ];

    return { data, maxValue };
  }, [stats]);

  // Calcular escala do eixo X
  const scaleMax = useMemo(() => {
    const max = reportData.maxValue;
    if (max <= 100) return 100;
    if (max <= 200) return 200;
    if (max <= 500) return 500;
    if (max <= 1000) return 1000;
    return Math.ceil(max / 500) * 500;
  }, [reportData.maxValue]);

  const scaleSteps = useMemo(() => {
    const steps = [];
    const step = scaleMax / 4;
    for (let i = 0; i <= 4; i++) {
      steps.push(Math.round(i * step));
    }
    return steps;
  }, [scaleMax]);

  return (
    <div className="bg-card rounded-2xl p-5 border border-border animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-foreground">Relatório de Vendas</h3>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          Carregando...
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reportData.data.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-semibold text-success">({item.value})</span>
                </div>
                <div className="h-6 bg-secondary rounded-md overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-md transition-all duration-500`}
                    style={{ width: item.maxWidth }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between mt-3 text-xs text-muted-foreground">
            {scaleSteps.map((step, idx) => (
              <span key={idx}>{step}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
