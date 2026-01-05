import { useState, useEffect, useMemo } from "react";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { ArrowLeft, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { useDateRange } from "@/contexts/DateRangeContext";
import { loadSalesData } from "@/lib/dataLoader";
import type { ProductData } from "@/lib/excelReader";
import { filterProductsByMarketplace } from "@/lib/marketplaceFilter";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const Transactions = () => {
  const { selectedMarketplace } = useMarketplace();
  const { dateRange } = useDateRange();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await loadSalesData();
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

  // Filtrar transações por período, marketplace e busca
  const filteredTransactions = useMemo(() => {
    let filtered = filterProductsByMarketplace(products, selectedMarketplace);

    // Filtrar por período
    const startDate = new Date(dateRange.from);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(dateRange.to);
    endDate.setHours(23, 59, 59, 999);

    filtered = filtered.filter((product) => {
      const dataProduto = parseDataProduto(product.data || '');
      if (!dataProduto) return false;
      return dataProduto >= startDate && dataProduto <= endDate;
    });

    // Filtrar por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((product) => {
        return (
          product.produto?.toLowerCase().includes(term) ||
          product.pedido?.toLowerCase().includes(term) ||
          product.comprador?.toLowerCase().includes(term) ||
          product.cpf?.includes(term) ||
          product.endereco?.toLowerCase().includes(term)
        );
      });
    }

    // Ordenar por data (mais recente primeiro)
    return filtered.sort((a, b) => {
      const dateA = parseDataProduto(a.data || '');
      const dateB = parseDataProduto(b.data || '');
      if (!dateA || !dateB) return 0;
      return dateB.getTime() - dateA.getTime();
    });
  }, [products, selectedMarketplace, dateRange, searchTerm]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return '-';
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-56">
        <Header />
        
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
          {/* Header com botão voltar e título */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Voltar</span>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Transações</h1>
            </div>
            <DateRangePicker />
          </div>

          {/* Barra de busca */}
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por produto, pedido, comprador, CPF ou endereço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Lista de transações */}
          <div className="bg-card rounded-xl sm:rounded-2xl border border-border">
            {isLoading ? (
              <div className="p-6 sm:p-8 text-center text-muted-foreground">
                Carregando transações...
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-muted-foreground">
                Nenhuma transação encontrada para o período e marketplace selecionados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-secondary/50 border-b border-border">
                    <tr>
                      <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-foreground">Data</th>
                      <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-foreground">Produto</th>
                      <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-foreground hidden sm:table-cell">Qtd</th>
                      <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-foreground">Preço</th>
                      <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-foreground hidden md:table-cell">Comprador</th>
                      <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-foreground hidden lg:table-cell">CPF</th>
                      <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-foreground hidden lg:table-cell">Endereço</th>
                      <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-foreground hidden md:table-cell">Pedido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction, idx) => {
                      const dataProduto = parseDataProduto(transaction.data || '');
                      const dataFormatada = dataProduto
                        ? format(dataProduto, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        : transaction.data || '-';

                      return (
                        <tr
                          key={`${transaction.pedido}-${idx}`}
                          className="border-b border-border hover:bg-secondary/30 transition-colors"
                        >
                          <td className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm text-foreground">{dataFormatada}</td>
                          <td className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm text-foreground font-medium max-w-[150px] sm:max-w-none">
                            <div className="truncate" title={transaction.produto || transaction.sku || '-'}>
                              {transaction.produto || transaction.sku || '-'}
                            </div>
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm text-foreground hidden sm:table-cell">{transaction.quantidade || 1}</td>
                          <td className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm text-foreground font-semibold">
                            {formatCurrency(transaction.precoVenda || 0)}
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm text-foreground hidden md:table-cell">
                            {transaction.comprador || '-'}
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm text-muted-foreground font-mono hidden lg:table-cell">
                            {formatCPF(transaction.cpf || '')}
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm text-foreground max-w-xs hidden lg:table-cell">
                            <div className="truncate" title={transaction.endereco || ''}>
                              {transaction.endereco || '-'}
                            </div>
                            {transaction.cidade && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {transaction.cidade}
                                {transaction.cep && ` - CEP: ${transaction.cep}`}
                              </div>
                            )}
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm text-muted-foreground font-mono hidden md:table-cell">
                            {transaction.pedido || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Resumo */}
          {!isLoading && filteredTransactions.length > 0 && (
            <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Total de transações: <span className="font-semibold text-foreground">{filteredTransactions.length}</span>
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Transactions;

