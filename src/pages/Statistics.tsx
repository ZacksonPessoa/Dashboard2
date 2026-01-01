import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Calculator, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { ProfitSimulator } from "@/components/dashboard/ProfitSimulator";
import { ProductAnalysis } from "@/components/dashboard/ProductAnalysis";
import { OrderAnalysis } from "@/components/dashboard/OrderAnalysis";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { loadSalesData, type ProductData } from "@/lib/dataLoader";
import { filterProductsByMarketplace } from "@/lib/marketplaceFilter";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { cn } from "@/lib/utils";

const Statistics = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedMarketplace } = useMarketplace();
  const userName = "Zackson Pessoa"; // TODO: Buscar do BD quando implementado

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log("Iniciando carregamento de dados...");
      const data = await loadSalesData();
      console.log(`Dados carregados: ${data.length} produtos`);
      if (data.length > 0) {
        console.log("Primeiro produto:", data[0]);
        console.log("Exemplo de dados:", {
          produto: data[0].produto,
          precoVenda: data[0].precoVenda,
          custo: data[0].custo,
          lucroReal: data[0].lucroReal,
          margem: data[0].margem,
        });
      }
      setProducts(data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      alert("Erro ao carregar dados. Verifique o console para mais detalhes.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar produtos por marketplace
  const filteredProducts = useMemo(() => {
    return filterProductsByMarketplace(products, selectedMarketplace);
  }, [products, selectedMarketplace]);

  // Calcular estatísticas dos dados reais
  const stats = useMemo(() => {
    if (filteredProducts.length === 0) return null;

    const receitaTotal = filteredProducts.reduce((sum, p) => sum + (p.precoVenda || 0), 0);
    const lucroTotal = filteredProducts.reduce((sum, p) => sum + (p.lucroReal || 0), 0);
    const totalPedidos = new Set(filteredProducts.map(p => p.pedido).filter(Boolean)).size;
    const produtosComLucro = filteredProducts.filter(p => (p.lucroReal || 0) > 0).length;
    const produtosComPrejuizo = filteredProducts.filter(p => (p.lucroReal || 0) < 0).length;
    const totalProdutos = filteredProducts.length;
    const margemMedia = receitaTotal > 0 ? (lucroTotal / receitaTotal) * 100 : 0;

    return {
      receitaTotal,
      lucroTotal,
      totalPedidos,
      produtosComLucro,
      produtosComPrejuizo,
      totalProdutos,
      margemMedia,
    };
  }, [filteredProducts]);

  // Dados para gráficos baseados nos dados reais
  const chartData = useMemo(() => {
    if (filteredProducts.length === 0) return null;

    // Agrupar por produto para análise
    const productMap = new Map<string, { vendas: number; lucro: number; quantidade: number }>();
    
    filteredProducts.forEach(p => {
      const key = p.produto || p.sku || "Desconhecido";
      const existing = productMap.get(key) || { vendas: 0, lucro: 0, quantidade: 0 };
      existing.vendas += p.precoVenda || 0;
      existing.lucro += p.lucroReal || 0;
      existing.quantidade += p.quantidade || 1;
      productMap.set(key, existing);
    });

    // Top 10 produtos por vendas
    const topProducts = Array.from(productMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.vendas - a.vendas)
      .slice(0, 10);

    // Distribuição lucro/prejuízo
    const lucroPrejuizo = {
      comLucro: filteredProducts.filter(p => (p.lucroReal || 0) > 0).length,
      comPrejuizo: filteredProducts.filter(p => (p.lucroReal || 0) < 0).length,
    };

    return {
      topProducts,
      lucroPrejuizo,
    };
  }, [filteredProducts]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-56">
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          {/* User Info */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{userName}</h2>
              <p className="text-muted-foreground text-sm">
                {format(currentDateTime, "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss", { locale: ptBR })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ProfitSimulator 
                trigger={
                  <Button>
                    <Calculator className="w-4 h-4 mr-2" />
                    Simulador de Lucro
                  </Button>
                }
              />
              <DateRangePicker />
            </div>
          </div>

          {/* Statistics Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Estatísticas</h1>
            <p className="text-muted-foreground">Análise detalhada de vendas e performance baseada nos dados de Novembro 2024</p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Carregando dados...</span>
            </div>
          )}

          {/* Stats Cards */}
          {!isLoading && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              <StatCard 
                title="Receita Total" 
                value={(stats.receitaTotal / 1000).toFixed(0) + "k"} 
                change={Math.round(stats.margemMedia)}
              />
              <StatCard 
                title="Lucro Total" 
                value={(stats.lucroTotal / 1000).toFixed(0) + "k"} 
                change={stats.lucroTotal >= 0 ? Math.round(stats.margemMedia) : -Math.round(Math.abs(stats.margemMedia))}
              />
              <StatCard 
                title="Total Pedidos" 
                value={stats.totalPedidos.toString()} 
                change={Math.round((stats.produtosComLucro / stats.totalProdutos) * 100)}
              />
              <StatCard 
                title="Produtos" 
                value={stats.totalProdutos.toString()} 
                change={Math.round((stats.produtosComLucro / stats.totalProdutos) * 100) - 50}
              />
            </div>
          )}

          {/* Gráficos */}
          {!isLoading && chartData && (
            <>
              {/* Análise de Produtos e Pedidos */}
              {filteredProducts.length > 0 && (
                <div className="mb-6">
                  <Tabs defaultValue="product" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 h-12 bg-muted/50 border border-border rounded-lg p-1">
                      <TabsTrigger 
                        value="product"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold transition-all"
                      >
                        Visão por Produto
                      </TabsTrigger>
                      <TabsTrigger 
                        value="order"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold transition-all"
                      >
                        Visão por Pedido
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="product">
                      <ProductAnalysis products={filteredProducts} />
                    </TabsContent>
                    <TabsContent value="order">
                      <OrderAnalysis products={filteredProducts} />
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Gráficos de Top Produtos */}
              {chartData.topProducts.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle>Top 10 Produtos por Vendas</CardTitle>
                    </CardHeader>
                    <CardContent className="h-full">
                      <ResponsiveContainer width="100%" height={500}>
                        <BarChart data={chartData.topProducts}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="name" 
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={100}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Bar dataKey="vendas" fill="hsl(var(--chart-green-dark))" name="Vendas (R$)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle>Lucro por Produto (Top 10)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-full">
                      <ResponsiveContainer width="100%" height={500}>
                        <BarChart data={chartData.topProducts}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="name" 
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={100}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Bar 
                            dataKey="lucro" 
                            name="Lucro (R$)" 
                            radius={[4, 4, 0, 0]}
                          >
                            {chartData.topProducts.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.lucro >= 0 ? "#10b981" : "#ef4444"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}

          {/* Mensagem quando não há dados */}
          {!isLoading && filteredProducts.length === 0 && (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <Loader2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhum dado encontrado. Verifique se o arquivo NOVEMBRO_ML.xlsx está na pasta public.
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default Statistics;
