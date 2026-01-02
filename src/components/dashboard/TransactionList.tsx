import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { format, parse, isToday } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { cn } from "@/lib/utils";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { loadSalesData } from "@/lib/dataLoader";
import type { ProductData } from "@/lib/excelReader";
import { filterProductsByMarketplace } from "@/lib/marketplaceFilter";

// Função para obter ícone baseado no nome do produto
const getProductIcon = (productName: string): string => {
  const name = productName.toLowerCase();
  if (name.includes('camisa') || name.includes('shirt') || name.includes('blusa')) return "👕";
  if (name.includes('calça') || name.includes('pants') || name.includes('jeans')) return "👖";
  if (name.includes('tênis') || name.includes('sapato') || name.includes('shoe')) return "👟";
  if (name.includes('bolsa') || name.includes('bag') || name.includes('mochila')) return "👜";
  if (name.includes('relógio') || name.includes('watch')) return "⌚";
  if (name.includes('óculos') || name.includes('oculos') || name.includes('glasses')) return "👓";
  if (name.includes('celular') || name.includes('phone') || name.includes('iphone') || name.includes('smartphone')) return "📱";
  if (name.includes('notebook') || name.includes('laptop') || name.includes('computador')) return "💻";
  if (name.includes('tablet') || name.includes('ipad')) return "📱";
  if (name.includes('fone') || name.includes('headphone') || name.includes('headset')) return "🎧";
  if (name.includes('game') || name.includes('playstation') || name.includes('xbox') || name.includes('nintendo')) return "🎮";
  if (name.includes('livro') || name.includes('book')) return "📚";
  if (name.includes('café') || name.includes('coffee') || name.includes('starbucks')) return "☕";
  if (name.includes('comida') || name.includes('food') || name.includes('lanche')) return "🍔";
  return "📦"; // Ícone padrão
};

export function TransactionList() {
  const navigate = useNavigate();
  const { selectedMarketplace } = useMarketplace();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleCardClick = () => {
    navigate("/transactions");
  };

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

  // Filtrar transações do dia atual
  const transactionsToday = useMemo(() => {
    if (products.length === 0) return [];

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let produtosFiltrados = products.filter((product) => {
      const dataProduto = parseDataProduto(product.data || '');
      if (!dataProduto) return false;
      
      dataProduto.setHours(0, 0, 0, 0);
      return dataProduto.getTime() === hoje.getTime();
    });

    // Filtrar por marketplace
    produtosFiltrados = filterProductsByMarketplace(produtosFiltrados, selectedMarketplace);

    // Se não houver dados do dia atual, pega o dia mais recente
    if (produtosFiltrados.length === 0 && products.length > 0) {
      const produtosComData = products
        .map(p => ({ ...p, dataParsed: parseDataProduto(p.data || '') }))
        .filter(p => p.dataParsed !== null)
        .sort((a, b) => b.dataParsed!.getTime() - a.dataParsed!.getTime());
      
      if (produtosComData.length > 0) {
        const dataMaisRecente = produtosComData[0].dataParsed!;
        dataMaisRecente.setHours(0, 0, 0, 0);
        
        produtosFiltrados = produtosComData
          .filter(p => {
            const data = p.dataParsed!;
            data.setHours(0, 0, 0, 0);
            return data.getTime() === dataMaisRecente.getTime();
          })
          .map(p => {
            const { dataParsed, ...rest } = p;
            return rest;
          });
        
        // Filtrar por marketplace
        produtosFiltrados = filterProductsByMarketplace(produtosFiltrados, selectedMarketplace);
      }
    }

    // Converter para formato de transação
    return produtosFiltrados.map((product) => {
      const dataProduto = parseDataProduto(product.data || '');
      const lucro = product.lucroReal || 0;
      const status = lucro > 0 ? "Concluído" : "Pendente";
      
      return {
        name: product.produto || product.sku || "Produto sem nome",
        date: dataProduto ? format(dataProduto, "dd 'de' MMM 'de' yyyy", { locale: ptBR }) : "Data inválida",
        id: product.pedido || product.sku || "N/A",
        status,
        icon: getProductIcon(product.produto || product.sku || ""),
        product
      };
    }).slice(0, 20); // Limitar a 20 transações
  }, [products, selectedMarketplace]);

  return (
    <div 
      onClick={handleCardClick}
      className="bg-card rounded-2xl p-5 border border-border animate-fade-in cursor-pointer hover:border-primary/50 transition-all group"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Transações</h3>
        <button 
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando transações...
          </div>
        ) : transactionsToday.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma transação encontrada
          </div>
        ) : (
          transactionsToday.map((tx, idx) => (
            <div 
              key={`${tx.id}-${idx}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg">
                {tx.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{tx.name}</p>
                <p className="text-xs text-muted-foreground">{tx.date}</p>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-sm font-medium",
                  tx.status === "Concluído" ? "text-success" : "text-warning"
                )}>
                  {tx.status}
                </p>
                <p className="text-xs text-muted-foreground">{tx.id}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
