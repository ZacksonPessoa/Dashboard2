import { useState, useEffect, useMemo } from "react";
import { format, parse, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { UpdateCard } from "@/components/dashboard/UpdateCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { PerformanceDonut } from "@/components/dashboard/PerformanceDonut";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { SalesReport } from "@/components/dashboard/SalesReport";
import { PromoCard } from "@/components/dashboard/PromoCard";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { loadSalesData, type ProductData } from "@/lib/dataLoader";
import { filterProductsByMarketplace } from "@/lib/marketplaceFilter";

const Index = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const userName = "Zackson Pessoa"; // TODO: Buscar do BD quando implementado
  const { selectedMarketplace } = useMarketplace();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // Atualiza a cada segundo

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await loadSalesData();
      console.log('=== DADOS CARREGADOS NO INDEX ===');
      console.log('Total de produtos:', data.length);
      if (data.length > 0) {
        console.log('Primeiro produto completo:', data[0]);
        const produtosComLucro = data.filter(p => (p.lucroReal || 0) > 0);
        const produtosComPrejuizo = data.filter(p => (p.lucroReal || 0) < 0);
        const produtosSemLucro = data.filter(p => (p.lucroReal || 0) === 0);
        console.log('Produtos com lucro:', produtosComLucro.length);
        console.log('Produtos com prejuízo:', produtosComPrejuizo.length);
        console.log('Produtos sem lucro (zero):', produtosSemLucro.length);
        
        const totalLucro = data.reduce((sum, p) => sum + (p.lucroReal || 0), 0);
        const totalVenda = data.reduce((sum, p) => sum + (p.precoVenda || 0), 0);
        const totalCusto = data.reduce((sum, p) => sum + (p.totalCusto || 0), 0);
        console.log('Total Lucro Real:', totalLucro);
        console.log('Total Venda:', totalVenda);
        console.log('Total Custo:', totalCusto);
        
        if (produtosComLucro.length > 0) {
          console.log('Exemplo produto com lucro:', produtosComLucro[0]);
        }
        if (produtosSemLucro.length > 0) {
          console.log('Exemplo produto sem lucro:', produtosSemLucro[0]);
        }
      }
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

  // Calcular estatísticas do mês atual (ou todos os dados se não houver dados do mês atual)
  const currentMonthStats = useMemo(() => {
    if (filteredProducts.length === 0) {
      return { netIncome: 0, totalReturn: 0 };
    }

    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    const currentMonthProducts = filteredProducts.filter((product) => {
      const dataProduto = parseDataProduto(product.data || '');
      if (!dataProduto) return false;
      return dataProduto >= startOfCurrentMonth && dataProduto <= endOfCurrentMonth;
    });

    // Se não houver dados do mês atual, usa todos os dados disponíveis
    let productsToUse = currentMonthProducts.length > 0 ? currentMonthProducts : filteredProducts;

    const netIncome = productsToUse.reduce((sum, p) => {
      const lucro = p.lucroReal || 0;
      return sum + lucro;
    }, 0);
    
    const totalReturn = productsToUse.reduce((sum, p) => {
      const venda = p.precoVenda || 0;
      return sum + venda;
    }, 0);

    console.log('Estatísticas do mês atual:', {
      produtosFiltrados: filteredProducts.length,
      produtosMesAtual: currentMonthProducts.length,
      produtosUsados: productsToUse.length,
      netIncome,
      totalReturn,
      primeiroProduto: productsToUse[0] ? {
        produto: productsToUse[0].produto,
        precoVenda: productsToUse[0].precoVenda,
        lucroReal: productsToUse[0].lucroReal,
        totalVenda: productsToUse[0].totalVenda,
        totalCusto: productsToUse[0].totalCusto
      } : null
    });

    return { netIncome, totalReturn };
  }, [filteredProducts]);

  // Calcular estatísticas do mês anterior
  const previousMonthStats = useMemo(() => {
    const now = new Date();
    const startOfPreviousMonth = startOfMonth(subMonths(now, 1));
    const endOfPreviousMonth = endOfMonth(subMonths(now, 1));

    const previousMonthProducts = filteredProducts.filter((product) => {
      const dataProduto = parseDataProduto(product.data || '');
      if (!dataProduto) return false;
      return dataProduto >= startOfPreviousMonth && dataProduto <= endOfPreviousMonth;
    });

    const netIncome = previousMonthProducts.reduce((sum, p) => sum + (p.lucroReal || 0), 0);
    const totalReturn = previousMonthProducts.reduce((sum, p) => sum + (p.precoVenda || 0), 0);

    return { netIncome, totalReturn };
  }, [filteredProducts]);

  // Calcular mudança percentual
  const netIncomeChange = useMemo(() => {
    if (previousMonthStats.netIncome === 0) {
      // Se não houver dados do mês anterior, retorna 0 (sem mudança)
      return 0;
    }
    const change = ((currentMonthStats.netIncome - previousMonthStats.netIncome) / Math.abs(previousMonthStats.netIncome)) * 100;
    console.log('Mudança Net Income:', {
      atual: currentMonthStats.netIncome,
      anterior: previousMonthStats.netIncome,
      mudanca: change
    });
    return change;
  }, [currentMonthStats.netIncome, previousMonthStats.netIncome]);

  const totalReturnChange = useMemo(() => {
    if (previousMonthStats.totalReturn === 0) {
      // Se não houver dados do mês anterior, retorna 0 (sem mudança)
      return 0;
    }
    const change = ((currentMonthStats.totalReturn - previousMonthStats.totalReturn) / Math.abs(previousMonthStats.totalReturn)) * 100;
    console.log('Mudança Total Return:', {
      atual: currentMonthStats.totalReturn,
      anterior: previousMonthStats.totalReturn,
      mudanca: change
    });
    return change;
  }, [currentMonthStats.totalReturn, previousMonthStats.totalReturn]);
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
            <DateRangePicker />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-5">
            {/* Left Column - Stats & Charts */}
            <div className="col-span-8 space-y-5">
              {/* Top Row - Update & Stats */}
              <div className="grid grid-cols-3 gap-5">
                <UpdateCard />
                <StatCard 
                  title="Lucro Líquido" 
                  value={currentMonthStats.netIncome} 
                  change={Math.round(netIncomeChange)} 
                  isLoading={isLoading}
                />
                <StatCard 
                  title="Retorno Total" 
                  value={currentMonthStats.totalReturn} 
                  change={Math.round(totalReturnChange)} 
                  isLoading={isLoading}
                />
              </div>

              {/* Middle Row - Transaction & Revenue */}
              <div className="grid grid-cols-2 gap-5">
                <TransactionList />
                <div className="space-y-5">
                  <RevenueChart />
                  <SalesReport />
                </div>
              </div>
            </div>

            {/* Right Column - Performance & Promo */}
            <div className="col-span-4 space-y-5">
              <PerformanceDonut />
              <PromoCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
