import { useEffect, useState, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { loadSalesData, type ProductData } from "@/lib/dataLoader";
import { filterProductsByMarketplace } from "@/lib/marketplaceFilter";
import { Link } from "react-router-dom";

export function UpdateCard() {
  const { selectedMarketplace } = useMarketplace();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loadSalesData();
      setProducts(data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setError("Erro ao carregar dados. Verifique o console.");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para parsear data do formato do Excel
  const parseDataProduto = (dataStr: string): Date | null => {
    if (!dataStr) return null;
    
    try {
      // Formato: "30 de novembro de 2024 23:59 hs."
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
      
      // Tenta formato ISO ou outros formatos
      const data = new Date(dataStr);
      return isNaN(data.getTime()) ? null : data;
    } catch {
      return null;
    }
  };

  // Calcula vendas do dia atual filtradas por marketplace
  const vendasDoDia = useMemo(() => {
    if (products.length === 0) return { total: 0, quantidade: 0, data: null as Date | null, isToday: false };

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Filtra produtos do dia atual
    const produtosHoje = products.filter((product) => {
      const dataProduto = parseDataProduto(product.data || '');
      if (!dataProduto) return false;
      
      dataProduto.setHours(0, 0, 0, 0);
      return dataProduto.getTime() === hoje.getTime();
    });

    // Filtra por marketplace
    let produtosFiltrados = filterProductsByMarketplace(produtosHoje, selectedMarketplace);

    const total = produtosFiltrados.reduce((sum, p) => sum + (p.precoVenda || 0), 0);
    const quantidade = produtosFiltrados.length;

    // Se não houver vendas do dia atual, pega o dia mais recente
    if (quantidade === 0 && products.length > 0) {
      const produtosComData = products
        .map(p => ({ ...p, dataParsed: parseDataProduto(p.data || '') }))
        .filter(p => p.dataParsed !== null)
        .sort((a, b) => b.dataParsed!.getTime() - a.dataParsed!.getTime());
      
      if (produtosComData.length > 0) {
        const dataMaisRecente = produtosComData[0].dataParsed!;
        dataMaisRecente.setHours(0, 0, 0, 0);
        
        const produtosRecente = produtosComData.filter(p => {
          const data = p.dataParsed!;
          data.setHours(0, 0, 0, 0);
          return data.getTime() === dataMaisRecente.getTime();
        });
        
        // Filtra por marketplace
        let produtosFiltradosRecente = produtosRecente;
               produtosFiltradosRecente = filterProductsByMarketplace(produtosRecente, selectedMarketplace);
        
        const totalRecente = produtosFiltradosRecente.reduce((sum, p) => sum + (p.precoVenda || 0), 0);
        const quantidadeRecente = produtosFiltradosRecente.length;
        
        return { 
          total: totalRecente, 
          quantidade: quantidadeRecente,
          data: dataMaisRecente,
          isToday: false
        };
      }
    }

    return { 
      total, 
      quantidade,
      data: hoje,
      isToday: true
    };
  }, [products, selectedMarketplace]);

  const dataFormatada = vendasDoDia.data 
    ? format(vendasDoDia.data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="bg-primary rounded-2xl p-5 text-primary-foreground animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <span className="text-sm font-medium opacity-90">Atualização</span>
      </div>
      
      <p className="text-xs opacity-70 mb-1">
        {vendasDoDia.isToday ? 'Hoje' : dataFormatada}
      </p>
      
      <p className="text-lg font-medium mb-1">
        {vendasDoDia.isToday ? 'Vendas do dia' : 'Vendas do dia'}
      </p>
      <p className="text-2xl font-bold text-accent mb-4">
        {isLoading ? (
          <span className="text-lg font-medium text-primary-foreground opacity-90">Carregando...</span>
        ) : error ? (
          <span className="text-lg font-medium text-destructive opacity-90">Erro ao carregar</span>
        ) : (
          <>
            R$ {vendasDoDia.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-lg font-medium text-primary-foreground opacity-90 ml-2">
              ({vendasDoDia.quantidade} {vendasDoDia.quantidade === 1 ? 'venda' : 'vendas'})
            </span>
          </>
        )}
      </p>
      
      <Link 
        to="/statistics"
        className="inline-flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all"
      >
        Ver Estatísticas
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
