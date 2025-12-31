import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { DashboardCard } from "@/components/DashboardCard";
import { MarketplaceFilter } from "@/components/MarketplaceFilter";
import { MarketplaceSummaryCards } from "@/components/MarketplaceSummaryCards";
import { useSalesData, Marketplace } from "@/hooks/useSalesData";
import { useLucroReal } from "@/hooks/useLucroReal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, TrendingUp, Calculator, AlertTriangle } from "lucide-react";

interface ProdutoVenda {
  produto: string;
  quantidade: number;
  valorUnitario: number;
  marketplace: Marketplace;
}

const Index = () => {
  const [marketplaceFilter, setMarketplaceFilter] = useState<Marketplace | 'Todos'>('Todos');
  // Sempre busca todos os dados fictícios (filtro será aplicado depois)
  const { items: itemsFicticios, marketplaceSummaries: marketplaceSummariesFicticio } = useSalesData('Todos');
  const { lucroPorProduto, resumo, loading: loadingLucro } = useLucroReal();

  // Converte produtos do Mercado Livre para o formato da tabela
  const produtosMercadoLivre: ProdutoVenda[] = useMemo(() => {
    if (!lucroPorProduto || lucroPorProduto.length === 0) return [];
    
    return lucroPorProduto.map(produto => {
      // Calcula preço médio de venda (não receita líquida)
      const precoMedio = produto.vendas.length > 0
        ? produto.vendas.reduce((sum, v) => sum + v.precoVenda, 0) / produto.vendas.length
        : produto.totalUnidades > 0 ? produto.receitaTotal / produto.totalUnidades : 0;
      
      return {
        produto: produto.tituloAnuncio,
        quantidade: produto.totalUnidades,
        valorUnitario: precoMedio,
        marketplace: 'Mercado Livre' as Marketplace,
      };
    });
  }, [lucroPorProduto]);

  // Combina produtos reais do ML com produtos fictícios
  const todosProdutos: ProdutoVenda[] = useMemo(() => {
    const produtosFicticios = itemsFicticios.filter(item => item.marketplace !== 'Mercado Livre');
    return [...produtosMercadoLivre, ...produtosFicticios];
  }, [produtosMercadoLivre, itemsFicticios]);

  // Filtra produtos baseado no marketplace selecionado
  const produtosFiltrados = useMemo(() => {
    if (marketplaceFilter === 'Todos') return todosProdutos;
    return todosProdutos.filter(item => item.marketplace === marketplaceFilter);
  }, [todosProdutos, marketplaceFilter]);

  // Calcula totais dos produtos fictícios filtrados
  const produtosFicticiosFiltrados = useMemo(() => {
    if (marketplaceFilter === 'Todos') return itemsFicticios.filter(item => item.marketplace !== 'Mercado Livre');
    if (marketplaceFilter === 'Mercado Livre') return [];
    return itemsFicticios.filter(item => item.marketplace === marketplaceFilter);
  }, [itemsFicticios, marketplaceFilter]);

  const totalVendasFicticio = useMemo(() => {
    return produtosFicticiosFiltrados.reduce((sum, item) => sum + (item.quantidade * item.valorUnitario), 0);
  }, [produtosFicticiosFiltrados]);

  // Calcula totais combinados
  const totalVendas = useMemo(() => {
    if (marketplaceFilter === 'Todos') {
      const totalML = resumo.totalReceita || 0;
      return totalML + totalVendasFicticio;
    } else if (marketplaceFilter === 'Mercado Livre') {
      return resumo.totalReceita || 0;
    } else {
      return totalVendasFicticio;
    }
  }, [marketplaceFilter, resumo.totalReceita, totalVendasFicticio]);

  const totalQuantidade = useMemo(() => {
    return produtosFiltrados.reduce((sum, item) => sum + item.quantidade, 0);
  }, [produtosFiltrados]);

  const ticketMedio = useMemo(() => {
    return totalQuantidade > 0 ? totalVendas / totalQuantidade : 0;
  }, [totalVendas, totalQuantidade]);

  // Resumo por marketplace combinado
  const marketplaceSummaries = useMemo(() => {
    const summaries: Array<{ marketplace: Marketplace; totalVendas: number; quantidade: number }> = [];
    
    // Mercado Livre (dados reais)
    if (!loadingLucro && resumo.totalVendas > 0) {
      const mlQuantidade = produtosMercadoLivre.reduce((sum, p) => sum + p.quantidade, 0);
      summaries.push({
        marketplace: 'Mercado Livre',
        totalVendas: resumo.totalReceita,
        quantidade: mlQuantidade,
      });
    }

    // Outros marketplaces (dados fictícios)
    marketplaceSummariesFicticio.forEach(summary => {
      if (summary.marketplace !== 'Mercado Livre') {
        summaries.push(summary);
      }
    });

    return summaries;
  }, [produtosMercadoLivre, marketplaceSummariesFicticio, loadingLucro, resumo]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getMarketplaceBadgeColor = (marketplace: string) => {
    const colors: Record<string, string> = {
      'Amazon': 'bg-marketplace-amazon/10 text-marketplace-amazon border-marketplace-amazon/20',
      'Shopee': 'bg-marketplace-shopee/10 text-marketplace-shopee border-marketplace-shopee/20',
      'Mercado Livre': 'bg-marketplace-mercado-livre/10 text-marketplace-mercado-livre border-marketplace-mercado-livre/20',
      'Shein': 'bg-marketplace-shein/10 text-marketplace-shein border-marketplace-shein/20',
    };
    return colors[marketplace] || 'bg-primary/10 text-primary border-primary/20';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-10 shadow-card">
        <div className="container mx-auto px-6 py-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1.5">
                Dashboard de Vendas — Versão 2
              </h1>
              <p className="text-muted-foreground text-sm">
                Dados reais do Mercado Livre — Dados fictícios para outros marketplaces (Amazon, Shopee, Shein)
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/lucro-real">
                <Button variant="outline" className="gap-2">
                  <Calculator className="h-4 w-4" />
                  Simulador de Lucro Real
                </Button>
              </Link>
              <MarketplaceFilter value={marketplaceFilter} onChange={setMarketplaceFilter} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 space-y-10">
        {/* Cards de Métricas Gerais - Combinando dados reais (ML) e fictícios */}
        <div className="grid gap-6 md:grid-cols-3">
          <DashboardCard
            title="Total de Vendas"
            value={formatCurrency(totalVendas)}
            icon={DollarSign}
            description={marketplaceFilter === 'Mercado Livre' ? 'Dados reais do Mercado Livre' : marketplaceFilter === 'Todos' ? 'Dados reais (ML) + fictícios (outros)' : 'Dados fictícios'}
          />
          <DashboardCard
            title="Quantidade Total"
            value={totalQuantidade.toString()}
            icon={Package}
            description="Produtos vendidos"
          />
          <DashboardCard
            title="Ticket Médio"
            value={formatCurrency(ticketMedio)}
            icon={TrendingUp}
            description="Valor médio por produto"
          />
        </div>

        {/* Cards de Lucro Real - Apenas para Mercado Livre */}
        {!loadingLucro && resumo.totalVendas > 0 && (marketplaceFilter === 'Todos' || marketplaceFilter === 'Mercado Livre') && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Link to="/receita-detalhada">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Receita (ML)</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(resumo.totalReceita)}</div>
                  <p className="text-xs text-muted-foreground">{resumo.totalVendas} vendas</p>
                </CardContent>
              </Card>
            </Link>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Custo (ML)</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(resumo.totalCusto)}</div>
                <p className="text-xs text-muted-foreground">Custo dos produtos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro Real (ML)</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${resumo.totalLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(resumo.totalLucro)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Margem: {resumo.totalReceita > 0 ? ((resumo.totalLucro / resumo.totalReceita) * 100).toFixed(2) : '0.00'}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas (ML)</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{resumo.vendasComPrejuizo}</div>
                <p className="text-xs text-muted-foreground">
                  {resumo.produtosComPrejuizo} produtos com prejuízo
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cards de Resumo por Marketplace */}
        <MarketplaceSummaryCards summaries={marketplaceSummaries} />

        {/* Tabela de Produtos */}
        <div className="rounded-2xl border-0 bg-card shadow-card overflow-hidden">
          <div className="p-7">
            <h2 className="text-xl font-semibold mb-5 text-foreground tracking-tight">Vendas por Produto</h2>
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold text-xs uppercase tracking-wide">Produto</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wide">Marketplace</TableHead>
                    <TableHead className="text-right font-semibold text-xs uppercase tracking-wide">Quantidade</TableHead>
                    <TableHead className="text-right font-semibold text-xs uppercase tracking-wide">Valor Unitário</TableHead>
                    <TableHead className="text-right font-semibold text-xs uppercase tracking-wide">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum produto encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {produtosFiltrados.map((item, index) => {
                        const total = item.quantidade * item.valorUnitario;
                        return (
                          <TableRow key={index} className="hover:bg-muted/20 transition-colors border-border/50">
                            <TableCell className="font-medium text-foreground">{item.produto}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${getMarketplaceBadgeColor(item.marketplace)}`}>
                                {item.marketplace}
                                {item.marketplace === 'Mercado Livre' && (
                                  <span className="ml-1 text-[10px] text-green-600">(Real)</span>
                                )}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-medium">{item.quantidade}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.valorUnitario)}</TableCell>
                            <TableCell className="text-right font-semibold text-foreground">{formatCurrency(total)}</TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="bg-muted/30 hover:bg-muted/30 border-t-2 border-border">
                        <TableCell className="font-bold text-foreground uppercase text-sm">Total</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-bold text-foreground">{totalQuantidade}</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-bold text-lg text-primary">{formatCurrency(totalVendas)}</TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
