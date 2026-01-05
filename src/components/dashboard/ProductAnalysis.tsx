import { useState, useMemo } from "react";
import { AlertTriangle, TrendingUp, TrendingDown, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProductData } from "@/lib/excelReader";

interface ProductAnalysisProps {
  products: ProductData[];
}

export function ProductAnalysis({ products }: ProductAnalysisProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "profit" | "loss">("all");
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filtro por lucro/prejuízo
    if (filterBy === "profit") {
      filtered = filtered.filter(p => (p.lucroReal || 0) > 0);
    } else if (filterBy === "loss") {
      filtered = filtered.filter(p => (p.lucroReal || 0) < 0);
    }

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.produto?.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term) ||
        p.pedido?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [products, searchTerm, filterBy]);

  const stats = useMemo(() => {
    const total = products.length;
    const comLucro = products.filter(p => (p.lucroReal || 0) > 0).length;
    const comPrejuizo = products.filter(p => (p.lucroReal || 0) < 0).length;
    const lucroTotal = products.reduce((sum, p) => sum + (p.lucroReal || 0), 0);
    
    return { total, comLucro, comPrejuizo, lucroTotal };
  }, [products]);

  const getProblemArea = (product: ProductData): string => {
    const issues: string[] = [];
    const lucro = product.lucroReal || 0;
    
    if (lucro < 0) {
      const custo = product.custo || 0;
      const comissao = product.comissao || 0;
      const frete = product.frete || 0;
      const impostos = product.impostos || 0;
      const taxas = product.taxas || 0;
      const preco = product.precoVenda || 0;
      
      const custoPercent = preco > 0 ? (custo / preco) * 100 : 0;
      const comissaoPercent = preco > 0 ? (comissao / preco) * 100 : 0;
      const fretePercent = preco > 0 ? (frete / preco) * 100 : 0;
      
      if (custoPercent > 50) issues.push("Custo alto");
      if (comissaoPercent > 15) issues.push("Comissão alta");
      if (fretePercent > 20) issues.push("Frete alto");
      if (preco < custo) issues.push("Preço abaixo do custo");
    }
    
    return issues.length > 0 ? issues.join(", ") : "Sem problemas";
  };

  const toggleProduct = (index: number) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedProducts(newExpanded);
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Análise por Produto</CardTitle>
        <CardDescription>
          Visualize quais produtos geram lucro ou prejuízo
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

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto, SKU ou pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterBy("all")}
              className={cn(
                "px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors",
                filterBy === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterBy("profit")}
              className={cn(
                "px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors",
                filterBy === "profit"
                  ? "bg-success text-success-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              Com Lucro
            </button>
            <button
              onClick={() => setFilterBy("loss")}
              className={cn(
                "px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors",
                filterBy === "loss"
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              Com Prejuízo
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-[400px] sm:max-h-[500px] md:max-h-[600px] overflow-auto relative">
            <div className="overflow-x-auto">
              <table className="w-full caption-bottom text-sm min-w-[800px]">
                <thead className="sticky top-0 z-10 bg-background [&_tr]:border-b">
                  <tr className="border-b transition-colors">
                    <th className="h-10 sm:h-12 px-2 sm:px-4 text-left align-middle font-medium text-xs sm:text-sm text-muted-foreground bg-background">Produto</th>
                    <th className="h-10 sm:h-12 px-2 sm:px-4 text-left align-middle font-medium text-xs sm:text-sm text-muted-foreground bg-background hidden md:table-cell">SKU</th>
                    <th className="h-10 sm:h-12 px-2 sm:px-4 text-left align-middle font-medium text-xs sm:text-sm text-muted-foreground bg-background hidden lg:table-cell">Pedido</th>
                    <th className="h-10 sm:h-12 px-2 sm:px-4 text-right align-middle font-medium text-xs sm:text-sm text-muted-foreground bg-background">Preço Venda</th>
                    <th className="h-10 sm:h-12 px-2 sm:px-4 text-right align-middle font-medium text-xs sm:text-sm text-muted-foreground bg-background hidden md:table-cell">Total Custos</th>
                    <th className="h-10 sm:h-12 px-2 sm:px-4 text-right align-middle font-medium text-xs sm:text-sm text-muted-foreground bg-background">Lucro Real</th>
                    <th className="h-10 sm:h-12 px-2 sm:px-4 text-right align-middle font-medium text-xs sm:text-sm text-muted-foreground bg-background hidden sm:table-cell">Margem</th>
                    <th className="h-10 sm:h-12 px-2 sm:px-4 text-left align-middle font-medium text-xs sm:text-sm text-muted-foreground bg-background hidden lg:table-cell">Problema</th>
                  </tr>
                </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredProducts.length === 0 ? (
                  <tr className="border-b transition-colors">
                    <td colSpan={8} className="p-4 align-middle text-center text-muted-foreground py-8">
                      Nenhum produto encontrado
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, index) => {
                    const lucro = product.lucroReal || 0;
                    const margem = product.margem || 0;
                    const temPrejuizo = lucro < 0;
                    const problema = getProblemArea(product);
                    const isExpanded = expandedProducts.has(index);
                    const totalRecebido = (product.precoVenda || 0) - (product.comissao || 0) - (product.impostos || 0);

                    return (
                      <>
                        <tr 
                          key={index} 
                          className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                          onClick={() => toggleProduct(index)}
                        >
                          <td className="p-2 sm:p-3 md:p-4 align-middle font-medium text-xs sm:text-sm">
                            <div className="flex items-center gap-1 sm:gap-2">
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                              ) : (
                                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                              )}
                              <span className="truncate">{product.produto || product.sku || "N/A"}</span>
                            </div>
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 align-middle text-xs sm:text-sm text-muted-foreground hidden md:table-cell">
                            {product.sku || "-"}
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 align-middle text-xs sm:text-sm text-muted-foreground hidden lg:table-cell">
                            {product.pedido || "-"}
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 align-middle text-right text-xs sm:text-sm">
                            R$ {(product.precoVenda || 0).toFixed(2)}
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 align-middle text-right text-xs sm:text-sm hidden md:table-cell">
                            R$ {(product.totalCusto || 0).toFixed(2)}
                          </td>
                          <td className={cn(
                            "p-2 sm:p-3 md:p-4 align-middle text-right text-xs sm:text-sm font-semibold",
                            temPrejuizo ? "text-destructive" : "text-success"
                          )}>
                            <div className="flex items-center justify-end gap-1">
                              {temPrejuizo ? (
                                <TrendingDown className="w-4 h-4" />
                              ) : (
                                <TrendingUp className="w-4 h-4" />
                              )}
                              R$ {lucro.toFixed(2)}
                            </div>
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 align-middle text-right hidden sm:table-cell">
                            <Badge
                              variant={temPrejuizo ? "destructive" : "default"}
                              className={cn(
                                "text-xs",
                                !temPrejuizo && margem > 20 ? "bg-success/10 text-success" : "",
                                temPrejuizo ? "bg-destructive/10 text-destructive" : ""
                              )}
                            >
                              {margem.toFixed(2)}%
                            </Badge>
                          </td>
                          <td className="p-2 sm:p-3 md:p-4 align-middle hidden lg:table-cell">
                            {temPrejuizo ? (
                              <div className="flex items-center gap-1 sm:gap-2 text-xs text-destructive">
                                <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{problema}</span>
                              </div>
                            ) : (
                              <span className="text-xs sm:text-sm text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-muted/30">
                            <td colSpan={8} className="p-3 sm:p-4">
                              <div className="space-y-2 sm:space-y-3">
                                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                                  <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-warning flex-shrink-0" />
                                  <span className="truncate">Análise de Lucro - {product.produto || product.sku || "N/A"} - Pedido #{product.pedido || "N/A"}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 bg-background rounded-lg border">
                                  <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground">Preço de Venda</p>
                                    <p className="text-lg font-semibold">R$ {(product.precoVenda || 0).toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">Frete</p>
                                    <p className="text-sm font-medium">R$ {(product.frete || 0).toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">Lucro</p>
                                    <p className={cn(
                                      "text-lg font-semibold",
                                      temPrejuizo ? "text-destructive" : "text-success"
                                    )}>
                                      R$ {lucro.toFixed(2)}
                                    </p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground">Custo do Produto</p>
                                    <p className="text-sm font-medium">R$ {(product.custo || 0).toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">Total Recebido</p>
                                    <p className="text-sm font-medium">R$ {totalRecebido.toFixed(2)}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground">Comissão</p>
                                    <p className="text-sm font-medium">R$ {(product.comissao || 0).toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">Margem</p>
                                    <p className={cn(
                                      "text-lg font-semibold",
                                      temPrejuizo ? "text-destructive" : "text-success"
                                    )}>
                                      {margem.toFixed(2)}%
                                    </p>
                                  </div>
                                </div>
                                {problema !== "Sem problemas" && (
                                  <div className="flex items-start gap-2 text-sm text-warning">
                                    <AlertTriangle className="w-4 h-4 mt-0.5" />
                                    <span>Problemas detectados: {problema}</span>
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

