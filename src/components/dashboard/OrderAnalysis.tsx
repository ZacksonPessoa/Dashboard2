import { useState, useMemo } from "react";
import { AlertTriangle, TrendingUp, TrendingDown, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProductData } from "@/lib/excelReader";

interface OrderAnalysisProps {
  products: ProductData[];
}

interface OrderGroup {
  pedido: string;
  produtos: ProductData[];
  totalVenda: number;
  totalCusto: number;
  totalRecebido: number;
  lucroTotal: number;
  margem: number;
  data?: string;
}

export function OrderAnalysis({ products }: OrderAnalysisProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "profit" | "loss">("all");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  // Agrupar produtos por pedido
  const orders = useMemo(() => {
    const orderMap = new Map<string, ProductData[]>();

    products.forEach((product) => {
      const pedido = product.pedido || "Sem pedido";
      if (!orderMap.has(pedido)) {
        orderMap.set(pedido, []);
      }
      orderMap.get(pedido)!.push(product);
    });

    const orderGroups: OrderGroup[] = Array.from(orderMap.entries()).map(([pedido, produtos]) => {
      const totalVenda = produtos.reduce((sum, p) => sum + (p.precoVenda || 0), 0);
      const totalCusto = produtos.reduce((sum, p) => sum + (p.totalCusto || 0), 0);
      const totalRecebido = totalVenda - (produtos.reduce((sum, p) => sum + (p.comissao || 0) + (p.impostos || 0), 0));
      const lucroTotal = totalVenda - totalCusto;
      const margem = totalVenda > 0 ? (lucroTotal / totalVenda) * 100 : 0;

      return {
        pedido,
        produtos,
        totalVenda,
        totalCusto,
        totalRecebido,
        lucroTotal,
        margem,
        data: produtos[0]?.data
      };
    });

    return orderGroups.sort((a, b) => {
      // Ordena por data mais recente primeiro
      if (a.data && b.data) {
        return new Date(b.data).getTime() - new Date(a.data).getTime();
      }
      return 0;
    });
  }, [products]);

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filtro por lucro/prejuízo
    if (filterBy === "profit") {
      filtered = filtered.filter(o => o.lucroTotal > 0);
    } else if (filterBy === "loss") {
      filtered = filtered.filter(o => o.lucroTotal < 0);
    }

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o => 
        o.pedido.toLowerCase().includes(term) ||
        o.produtos.some(p => 
          p.produto?.toLowerCase().includes(term) ||
          p.sku?.toLowerCase().includes(term)
        )
      );
    }

    return filtered;
  }, [orders, searchTerm, filterBy]);

  const stats = useMemo(() => {
    const total = orders.length;
    const comLucro = orders.filter(o => o.lucroTotal > 0).length;
    const comPrejuizo = orders.filter(o => o.lucroTotal < 0).length;
    const lucroTotal = orders.reduce((sum, o) => sum + o.lucroTotal, 0);
    
    return { total, comLucro, comPrejuizo, lucroTotal };
  }, [orders]);

  const toggleOrder = (pedido: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(pedido)) {
      newExpanded.delete(pedido);
    } else {
      newExpanded.add(pedido);
    }
    setExpandedOrders(newExpanded);
  };

  const getProblemArea = (order: OrderGroup): string => {
    const issues: string[] = [];
    
    if (order.lucroTotal < 0) {
      const custoPercent = order.totalVenda > 0 ? (order.totalCusto / order.totalVenda) * 100 : 0;
      const comissaoTotal = order.produtos.reduce((sum, p) => sum + (p.comissao || 0), 0);
      const freteTotal = order.produtos.reduce((sum, p) => sum + (p.frete || 0), 0);
      const comissaoPercent = order.totalVenda > 0 ? (comissaoTotal / order.totalVenda) * 100 : 0;
      const fretePercent = order.totalVenda > 0 ? (freteTotal / order.totalVenda) * 100 : 0;
      
      if (custoPercent > 50) issues.push("Custo alto");
      if (comissaoPercent > 15) issues.push("Comissão alta");
      if (fretePercent > 20) issues.push("Frete alto");
      if (order.totalVenda < order.totalCusto) issues.push("Preço abaixo do custo");
    }
    
    return issues.length > 0 ? issues.join(", ") : "-";
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Análise por Pedido</CardTitle>
        <CardDescription>
          Detalhamento de cada venda com identificação de problemas (frete, taxa, preço).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <div className="p-2 sm:p-3 rounded-lg bg-muted/50">
            <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
            <p className="text-lg sm:text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="p-2 sm:p-3 rounded-lg bg-success/10">
            <p className="text-xs sm:text-sm text-muted-foreground">Com Lucro</p>
            <p className="text-lg sm:text-2xl font-bold text-success">{stats.comLucro}</p>
          </div>
          <div className="p-2 sm:p-3 rounded-lg bg-destructive/10">
            <p className="text-xs sm:text-sm text-muted-foreground">Com Prejuízo</p>
            <p className="text-lg sm:text-2xl font-bold text-destructive">{stats.comPrejuizo}</p>
          </div>
          <div className="p-2 sm:p-3 rounded-lg bg-primary/10">
            <p className="text-xs sm:text-sm text-muted-foreground">Lucro Total</p>
            <p className={cn(
              "text-lg sm:text-2xl font-bold",
              stats.lucroTotal >= 0 ? "text-success" : "text-destructive"
            )}>
              R$ {stats.lucroTotal.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Busca e Filtros */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por produto, SKU ou número de venda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterBy === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterBy("all")}
            >
              Todos
            </Button>
            <Button
              variant={filterBy === "profit" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterBy("profit")}
              className="text-success"
            >
              Com Lucro
            </Button>
            <Button
              variant={filterBy === "loss" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterBy("loss")}
              className="text-destructive"
            >
              Com Prejuízo
            </Button>
          </div>
        </div>

        {/* Tabela de Pedidos */}
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-[400px] sm:max-h-[500px] md:max-h-[600px] overflow-auto relative">
            <div className="overflow-x-auto">
              <table className="w-full caption-bottom text-sm min-w-[900px]">
                <thead className="sticky top-0 z-10 bg-background border-b">
                  <tr className="border-b transition-colors">
                    <th className="h-10 sm:h-12 px-2 sm:px-4 text-left align-middle font-medium text-xs sm:text-sm text-muted-foreground bg-background">N° Venda</th>
                    <th className="h-10 sm:h-12 px-2 sm:px-4 text-left align-middle font-medium text-xs sm:text-sm text-muted-foreground bg-background">Produto</th>
                    <th className="h-10 sm:h-12 px-2 sm:px-4 text-left align-middle font-medium text-xs sm:text-sm text-muted-foreground bg-background hidden sm:table-cell">Status</th>
                    <th className="h-10 sm:h-12 px-2 sm:px-4 text-right align-middle font-medium text-xs sm:text-sm text-muted-foreground bg-background">Preço Venda</th>
                    <th className="h-10 sm:h-12 px-2 sm:px-4 text-right align-middle font-medium text-xs sm:text-sm text-muted-foreground bg-background hidden md:table-cell">Custo</th>
                    <th className="h-10 sm:h-12 px-2 sm:px-4 text-right align-middle font-medium text-xs sm:text-sm text-muted-foreground bg-background hidden lg:table-cell">Comissão</th>
                    <th className="h-10 sm:h-12 px-2 sm:px-4 text-right align-middle font-medium text-xs sm:text-sm text-muted-foreground bg-background hidden lg:table-cell">Frete</th>
                    <th className="h-10 sm:h-12 px-2 sm:px-4 text-right align-middle font-medium text-xs sm:text-sm text-muted-foreground bg-background hidden md:table-cell">Total Recebido</th>
                    <th className="h-10 sm:h-12 px-2 sm:px-4 text-right align-middle font-medium text-xs sm:text-sm text-muted-foreground bg-background">Lucro</th>
                    <th className="h-10 sm:h-12 px-2 sm:px-4 text-right align-middle font-medium text-xs sm:text-sm text-muted-foreground bg-background hidden sm:table-cell">Margem</th>
                  </tr>
                </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr className="border-b transition-colors">
                    <td colSpan={10} className="p-4 align-middle text-center text-muted-foreground py-8">
                      Nenhum pedido encontrado
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isExpanded = expandedOrders.has(order.pedido);
                    const primeiroProduto = order.produtos[0];
                    const temPrejuizo = order.lucroTotal < 0;
                    const problema = getProblemArea(order);
                    const totalComissao = order.produtos.reduce((sum, p) => sum + (p.comissao || 0), 0);
                    const totalFrete = order.produtos.reduce((sum, p) => sum + (p.frete || 0), 0);
                    const totalCustoProduto = order.produtos.reduce((sum, p) => sum + (p.custo || 0), 0);

                    return (
                      <>
                        <tr 
                          key={order.pedido}
                          className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                          onClick={() => toggleOrder(order.pedido)}
                        >
                          <td className="p-2 sm:p-3 md:p-4 align-middle font-medium text-xs sm:text-sm">
                            <div className="flex items-center gap-1 sm:gap-2">
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                              ) : (
                                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                              )}
                              <span className="truncate">{order.pedido}</span>
                            </div>
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 align-middle text-xs sm:text-sm">
                            <span className="truncate block">{primeiroProduto?.produto || primeiroProduto?.sku || "N/A"}</span>
                            {order.produtos.length > 1 && (
                              <span className="text-xs text-muted-foreground">
                                (+{order.produtos.length - 1} {order.produtos.length === 2 ? 'produto' : 'produtos'})
                              </span>
                            )}
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 align-middle hidden sm:table-cell">
                            <Badge variant="secondary" className="text-xs">Entregue</Badge>
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 align-middle text-right text-xs sm:text-sm">
                            R$ {order.totalVenda.toFixed(2)}
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 align-middle text-right text-xs sm:text-sm hidden md:table-cell">
                            R$ {totalCustoProduto.toFixed(2)}
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 align-middle text-right text-xs sm:text-sm hidden lg:table-cell">
                            R$ {totalComissao.toFixed(2)}
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 align-middle text-right text-xs sm:text-sm hidden lg:table-cell">
                            R$ {totalFrete.toFixed(2)}
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 align-middle text-right text-xs sm:text-sm hidden md:table-cell">
                            R$ {order.totalRecebido.toFixed(2)}
                          </td>
                          <td className={cn(
                            "p-2 sm:p-3 md:p-4 align-middle text-right text-xs sm:text-sm font-medium",
                            temPrejuizo ? "text-destructive" : "text-success"
                          )}>
                            <div className="flex items-center justify-end gap-1">
                              {temPrejuizo ? (
                                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              ) : (
                                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              )}
                              R$ {order.lucroTotal.toFixed(2)}
                            </div>
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 align-middle text-right hidden sm:table-cell">
                            <Badge
                              variant={temPrejuizo ? "destructive" : "default"}
                              className={cn(
                                "text-xs",
                                temPrejuizo ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                              )}
                            >
                              {order.margem.toFixed(2)}%
                            </Badge>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-muted/30">
                            <td colSpan={10} className="p-3 sm:p-4">
                              <div className="space-y-2 sm:space-y-3">
                                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                                  <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-warning flex-shrink-0" />
                                  <span className="truncate">Análise de Lucro - Venda #{order.pedido} - {primeiroProduto?.produto || "N/A"}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 bg-background rounded-lg border">
                                  <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground">Preço de Venda</p>
                                    <p className="text-lg font-semibold">R$ {order.totalVenda.toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">Frete</p>
                                    <p className="text-sm font-medium">R$ {totalFrete.toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">Lucro</p>
                                    <p className={cn(
                                      "text-lg font-semibold",
                                      temPrejuizo ? "text-destructive" : "text-success"
                                    )}>
                                      R$ {order.lucroTotal.toFixed(2)}
                                    </p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground">Custo do Produto</p>
                                    <p className="text-sm font-medium">R$ {totalCustoProduto.toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">Total Recebido</p>
                                    <p className="text-sm font-medium">R$ {order.totalRecebido.toFixed(2)}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground">Comissão</p>
                                    <p className="text-sm font-medium">R$ {totalComissao.toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">Margem</p>
                                    <p className={cn(
                                      "text-lg font-semibold",
                                      temPrejuizo ? "text-destructive" : "text-success"
                                    )}>
                                      {order.margem.toFixed(2)}%
                                    </p>
                                  </div>
                                </div>
                                {problema !== "-" && (
                                  <div className="flex items-start gap-2 text-sm text-warning">
                                    <AlertTriangle className="w-4 h-4 mt-0.5" />
                                    <span>Problemas detectados: {problema}</span>
                                  </div>
                                )}
                                {order.produtos.length > 1 && (
                                  <div className="mt-2">
                                    <p className="text-xs text-muted-foreground mb-2">Produtos no pedido:</p>
                                    <div className="space-y-1">
                                      {order.produtos.map((produto, idx) => (
                                        <div key={idx} className="text-xs p-2 bg-background rounded border">
                                          {produto.produto || produto.sku || "N/A"} - R$ {(produto.precoVenda || 0).toFixed(2)}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

