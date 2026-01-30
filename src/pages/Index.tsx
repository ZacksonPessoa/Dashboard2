import { useRef, useMemo } from "react";
import { parse } from "date-fns";
import { Upload } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { UpdateCard } from "@/components/dashboard/UpdateCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { SalesReport } from "@/components/dashboard/SalesReport";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { useDateRange } from "@/contexts/DateRangeContext";
import { useSalesData } from "@/contexts/SalesDataContext";
import { filterProductsByMarketplace } from "@/lib/marketplaceFilter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { selectedMarketplace } = useMarketplace();
  const { dateRange } = useDateRange();
  const { salesData, isLoadingUpload, uploadError, uploadSalesFile } = useSalesData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadSalesFile(file);
      e.target.value = "";
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

  // Filtrar produtos por marketplace (dados vêm do contexto / planilha)
  const filteredProducts = useMemo(() => {
    return filterProductsByMarketplace(salesData, selectedMarketplace);
  }, [salesData, selectedMarketplace]);

  // Calcular estatísticas do período selecionado
  const currentPeriodStats = useMemo(() => {
    if (filteredProducts.length === 0) {
      return { netIncome: 0, totalVendas: 0 };
    }

    // Usar o período selecionado do contexto
    const startDate = new Date(dateRange.from);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(dateRange.to);
    endDate.setHours(23, 59, 59, 999);

    const periodProducts = filteredProducts.filter((product) => {
      const dataProduto = parseDataProduto(product.data || '');
      if (!dataProduto) return false;
      return dataProduto >= startDate && dataProduto <= endDate;
    });

    // Se não houver dados no período, usa todos os dados disponíveis
    let productsToUse = periodProducts.length > 0 ? periodProducts : filteredProducts;

    const netIncome = productsToUse.reduce((sum, p) => {
      const lucro = p.lucroReal || 0;
      return sum + lucro;
    }, 0);
    
    const totalVendas = productsToUse.reduce((sum, p) => {
      const venda = p.precoVenda || 0;
      return sum + venda;
    }, 0);

    return { netIncome, totalVendas };
  }, [filteredProducts, dateRange, selectedMarketplace]);

  // Calcular estatísticas do período anterior (mesmo tamanho do período selecionado, mas anterior)
  const previousPeriodStats = useMemo(() => {
    const periodLength = dateRange.to.getTime() - dateRange.from.getTime();
    const previousEnd = new Date(dateRange.from);
    previousEnd.setTime(previousEnd.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - periodLength);

    previousStart.setHours(0, 0, 0, 0);
    previousEnd.setHours(23, 59, 59, 999);

    const previousPeriodProducts = filteredProducts.filter((product) => {
      const dataProduto = parseDataProduto(product.data || '');
      if (!dataProduto) return false;
      return dataProduto >= previousStart && dataProduto <= previousEnd;
    });

    const netIncome = previousPeriodProducts.reduce((sum, p) => sum + (p.lucroReal || 0), 0);
    const totalVendas = previousPeriodProducts.reduce((sum, p) => sum + (p.precoVenda || 0), 0);

    return { netIncome, totalVendas };
  }, [filteredProducts, dateRange]);

  // Calcular mudança percentual
  const netIncomeChange = useMemo(() => {
    if (previousPeriodStats.netIncome === 0) {
      return 0;
    }
    return ((currentPeriodStats.netIncome - previousPeriodStats.netIncome) / Math.abs(previousPeriodStats.netIncome)) * 100;
  }, [currentPeriodStats.netIncome, previousPeriodStats.netIncome]);

  const totalVendasChange = useMemo(() => {
    if (previousPeriodStats.totalVendas === 0) {
      return 0;
    }
    return ((currentPeriodStats.totalVendas - previousPeriodStats.totalVendas) / Math.abs(previousPeriodStats.totalVendas)) * 100;
  }, [currentPeriodStats.totalVendas, previousPeriodStats.totalVendas]);
  return (
    <div className="flex min-h-screen bg-background min-w-0">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 md:ml-56 pl-14 md:pl-0">
        <Header />
        
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto min-w-0">
          {/* Date Range Picker */}
          <div className="flex justify-end mb-4 sm:mb-6">
            <DateRangePicker />
          </div>

          {/* Aviso: fazer upload da planilha quando não há dados */}
          {!isLoadingUpload && salesData.length === 0 && (
            <Alert className="mb-4 sm:mb-6 border-primary/50 bg-primary/5">
              <Upload className="h-4 w-4" />
              <AlertTitle>Faça upload da planilha</AlertTitle>
              <AlertDescription className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span>
                  Carregue a planilha de vendas (Excel ou CSV) para estatísticas e transações. Para o Simulador de Lucro preencher o Custo do Produto, envie também a planilha de custos (botão &quot;Custos&quot; no topo).
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleFileChange}
                  aria-label="Upload planilha"
                />
                <Button
                  onClick={handleUploadClick}
                  disabled={isLoadingUpload}
                  className="w-full sm:w-auto shrink-0"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isLoadingUpload ? "Carregando..." : "Enviar planilha"}
                </Button>
              </AlertDescription>
              {uploadError && (
                <p className="mt-2 text-sm text-destructive">{uploadError}</p>
              )}
            </Alert>
          )}

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-3 sm:gap-4 md:gap-5">
            {/* Stats & Charts */}
            <div className="col-span-12 space-y-3 sm:space-y-4 md:space-y-5">
              {/* Top Row - Update & Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                <UpdateCard />
                <StatCard 
                  title="Lucro Líquido" 
                  value={currentPeriodStats.netIncome} 
                  change={Math.round(netIncomeChange)} 
                  isLoading={isLoadingUpload}
                />
                <StatCard 
                  title="Total de Vendas" 
                  value={currentPeriodStats.totalVendas} 
                  change={Math.round(totalVendasChange)} 
                  isLoading={isLoadingUpload}
                />
              </div>

              {/* Middle Row - Transaction & Revenue */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                <TransactionList />
                <div className="space-y-3 sm:space-y-4 md:space-y-5">
                  <RevenueChart />
                  <SalesReport />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
