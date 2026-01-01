import { useEffect, useState, useMemo } from "react";
import { MoreHorizontal } from "lucide-react";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { loadSalesData, loadProductCosts, type ProductData } from "@/lib/dataLoader";
import { filterProductsByMarketplace } from "@/lib/marketplaceFilter";

export function SalesReport() {
  const { selectedMarketplace } = useMarketplace();
  const [salesProducts, setSalesProducts] = useState<ProductData[]>([]);
  const [launchedProducts, setLaunchedProducts] = useState<{ titulo: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [salesData, costsData] = await Promise.all([
        loadSalesData(),
        loadProductCosts()
      ]);
      setSalesProducts(salesData);
      setLaunchedProducts(costsData.map(p => ({ titulo: p.titulo })));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar vendas por marketplace
  const filteredSales = useMemo(() => {
    return filterProductsByMarketplace(salesProducts, selectedMarketplace);
  }, [salesProducts, selectedMarketplace]);

  // Calcular métricas
  const reportData = useMemo(() => {
    // Produtos lançados = quantidade de produtos únicos no CSV de custos
    const produtosLancados = launchedProducts.length;

    // Vendas de produtos lançados = vendas que correspondem aos produtos do CSV
    // Compara títulos dos produtos (normalizado para comparação)
    const normalizeTitle = (title: string): string => {
      return title.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };

    const lancadosTitles = new Set(launchedProducts.map(p => normalizeTitle(p.titulo)));
    
    const vendasProdutosLancados = filteredSales.filter(sale => {
      const saleTitle = normalizeTitle(sale.produto || sale.sku || '');
      // Verifica se o título da venda corresponde a algum produto lançado
      return Array.from(lancadosTitles).some(lancadoTitle => 
        saleTitle.includes(lancadoTitle) || lancadoTitle.includes(saleTitle)
      );
    }).length;

    // Calcular largura máxima para o gráfico
    const maxValue = Math.max(produtosLancados, vendasProdutosLancados, 1);
    
    const data = [
      {
        label: "Produtos Lançados",
        value: produtosLancados,
        color: "bg-chart-green-light",
        maxWidth: `${Math.min((produtosLancados / maxValue) * 100, 100)}%`
      },
      {
        label: "Vendas de Produtos Lançados",
        value: vendasProdutosLancados,
        color: "bg-accent",
        maxWidth: `${Math.min((vendasProdutosLancados / maxValue) * 100, 100)}%`
      }
    ];

    return { data, maxValue };
  }, [launchedProducts, filteredSales]);

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
