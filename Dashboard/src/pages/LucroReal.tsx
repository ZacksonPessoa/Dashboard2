import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useLucroReal } from "@/hooks/useLucroReal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Package, Percent, ArrowLeft, Search, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const LucroReal = () => {
  const { vendasCalculadas, lucroPorProduto, resumo, loading } = useLucroReal();
  const [viewMode, setViewMode] = useState<"produto" | "pedido">("produto");
  const [filtroProduto, setFiltroProduto] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "lucro" | "prejuizo">("todos");
  const [produtoExpandido, setProdutoExpandido] = useState<string | null>(null);
  const [pedidoExpandido, setPedidoExpandido] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Filtra produtos
  const produtosFiltrados = useMemo(() => {
    let filtrados = lucroPorProduto;

    // Filtro por texto (nome do produto ou SKU)
    if (filtroProduto.trim()) {
      const busca = filtroProduto.toLowerCase();
      filtrados = filtrados.filter(
        (p) =>
          p.tituloAnuncio.toLowerCase().includes(busca) ||
          p.sku.toLowerCase().includes(busca)
      );
    }

    // Filtro por status
    if (filtroStatus === "lucro") {
      filtrados = filtrados.filter((p) => !p.temPrejuizo);
    } else if (filtroStatus === "prejuizo") {
      filtrados = filtrados.filter((p) => p.temPrejuizo);
    }

    return filtrados;
  }, [lucroPorProduto, filtroProduto, filtroStatus]);

  // Filtra pedidos
  const pedidosFiltrados = useMemo(() => {
    let filtrados = vendasCalculadas;

    // Filtro por texto (nome do produto, SKU ou número de venda)
    if (filtroProduto.trim()) {
      const busca = filtroProduto.toLowerCase();
      filtrados = filtrados.filter(
        (v) =>
          v.tituloAnuncio.toLowerCase().includes(busca) ||
          v.sku.toLowerCase().includes(busca) ||
          v.numeroVenda.includes(busca)
      );
    }

    // Filtro por status
    if (filtroStatus === "lucro") {
      filtrados = filtrados.filter((v) => !v.temPrejuizo);
    } else if (filtroStatus === "prejuizo") {
      filtrados = filtrados.filter((v) => v.temPrejuizo);
    }

    return filtrados;
  }, [vendasCalculadas, filtroProduto, filtroStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Fixo */}
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">Simulador de Lucro Real - Mercado Livre</h1>
          <p className="text-muted-foreground mt-2">
            Análise detalhada de lucro, margem e identificação de problemas por produto e pedido
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 space-y-6">
        {/* Cards de Resumo */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Receita</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(resumo.totalReceita)}</div>
              <p className="text-xs text-muted-foreground">{resumo.totalVendas} vendas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Custo</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(resumo.totalCusto)}</div>
              <p className="text-xs text-muted-foreground">Custo dos produtos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Real</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${resumo.totalLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(resumo.totalLucro)}
              </div>
              <p className="text-xs text-muted-foreground">
                Margem: {formatPercent((resumo.totalLucro / resumo.totalReceita) * 100)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
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

        {/* Tabs para alternar entre visão por produto e por pedido */}
        <Tabs defaultValue="produto" onValueChange={(v) => setViewMode(v as "produto" | "pedido")}>
          <TabsList>
            <TabsTrigger value="produto">Visão por Produto</TabsTrigger>
            <TabsTrigger value="pedido">Visão por Pedido</TabsTrigger>
          </TabsList>

          {/* Visão por Produto */}
          <TabsContent value="produto" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise por Produto</CardTitle>
                <CardDescription>
                  Lucro consolidado por produto. Identifique quais produtos dão lucro e quais dão prejuízo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filtros */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por produto ou SKU..."
                      value={filtroProduto}
                      onChange={(e) => setFiltroProduto(e.target.value)}
                      className="pl-10"
                    />
                    {filtroProduto && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => setFiltroProduto("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Select value={filtroStatus} onValueChange={(v) => setFiltroStatus(v as "todos" | "lucro" | "prejuizo")}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="lucro">Com Lucro</SelectItem>
                      <SelectItem value="prejuizo">Com Prejuízo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Info de resultados */}
                {filtroProduto || filtroStatus !== "todos" ? (
                  <div className="text-sm text-muted-foreground">
                    Mostrando {produtosFiltrados.length} de {lucroPorProduto.length} produtos
                  </div>
                ) : null}

                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-[calc(100vh-350px)] overflow-y-auto overflow-x-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="sticky top-0 z-10 bg-background shadow-sm [&_tr]:border-b">
                        <tr className="bg-muted/50 border-b">
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-muted/50">Produto</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-muted/50">SKU</th>
                          <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground bg-muted/50">Vendas</th>
                          <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground bg-muted/50">Unidades</th>
                          <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground bg-muted/50">Receita</th>
                          <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground bg-muted/50">Custo</th>
                          <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground bg-muted/50">Comissão</th>
                          <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground bg-muted/50">Frete</th>
                          <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground bg-muted/50">Lucro</th>
                          <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground bg-muted/50">Margem</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-muted/50">Status</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {produtosFiltrados.length === 0 ? (
                          <tr className="border-b transition-colors hover:bg-muted/50">
                            <td colSpan={11} className="p-4 align-middle text-center py-8 text-muted-foreground">
                              Nenhum produto encontrado com os filtros aplicados.
                            </td>
                          </tr>
                        ) : (
                          produtosFiltrados.map((produto, idx) => {
                            const isExpanded = produtoExpandido === produto.tituloAnuncio;
                            const vendasComProblemas = produto.vendas.filter(v => v.temPrejuizo && v.problemas.length > 0);
                            return (
                              <>
                                <tr 
                                  key={idx} 
                                  className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                                  onClick={() => setProdutoExpandido(isExpanded ? null : produto.tituloAnuncio)}
                                >
                                  <td className="p-4 align-middle font-medium">{produto.tituloAnuncio}</td>
                                  <td className="p-4 align-middle">{produto.sku}</td>
                                  <td className="p-4 align-middle text-right">{produto.totalVendas}</td>
                                  <td className="p-4 align-middle text-right">{produto.totalUnidades}</td>
                                  <td className="p-4 align-middle text-right">{formatCurrency(produto.receitaTotal)}</td>
                                  <td className="p-4 align-middle text-right">{formatCurrency(produto.custoTotal)}</td>
                                  <td className="p-4 align-middle text-right">{formatCurrency(produto.comissaoTotal)}</td>
                                  <td className="p-4 align-middle text-right">{formatCurrency(produto.freteTotal)}</td>
                                  <td className={`p-4 align-middle text-right font-bold ${produto.lucroTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(produto.lucroTotal)}
                                  </td>
                                  <td className={`p-4 align-middle text-right ${produto.margemMedia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatPercent(produto.margemMedia)}
                                  </td>
                                  <td className="p-4 align-middle">
                                    {produto.temPrejuizo ? (
                                      <Badge variant="destructive">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Prejuízo
                                      </Badge>
                                    ) : (
                                      <Badge variant="default" className="bg-green-600">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        Lucro
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                                {isExpanded && (
                                  <tr key={`${idx}-detail`} className="border-b bg-muted/20">
                                    <td colSpan={11} className="p-0">
                                      <div className={`p-4 ${produto.temPrejuizo ? 'bg-red-50/80 border-l-4 border-red-300' : 'bg-green-50/80 border-l-4 border-green-300'}`}>
                                        <div className="flex items-center gap-2 mb-4">
                                          {produto.temPrejuizo ? (
                                            <AlertTriangle className="h-5 w-5 text-red-700" />
                                          ) : (
                                            <TrendingUp className="h-5 w-5 text-green-700" />
                                          )}
                                          <h4 className={`font-bold text-lg ${produto.temPrejuizo ? 'text-red-700' : 'text-green-700'}`}>
                                            {produto.temPrejuizo ? 'Análise de Prejuízo' : 'Análise de Lucro'}
                                          </h4>
                                        </div>
                                        <div className="space-y-4">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                              <div className="text-sm text-muted-foreground mb-1">Receita Total</div>
                                              <div className="text-base font-semibold">{formatCurrency(produto.receitaTotal)}</div>
                                            </div>
                                            <div>
                                              <div className="text-sm text-muted-foreground mb-1">Custo Total</div>
                                              <div className="text-base font-semibold">{formatCurrency(produto.custoTotal)}</div>
                                            </div>
                                            <div>
                                              <div className="text-sm text-muted-foreground mb-1">Comissão Total</div>
                                              <div className="text-base font-semibold">{formatCurrency(produto.comissaoTotal)}</div>
                                            </div>
                                            <div>
                                              <div className="text-sm text-muted-foreground mb-1">Frete Total</div>
                                              <div className="text-base font-semibold">{formatCurrency(produto.freteTotal)}</div>
                                            </div>
                                          </div>
                                          <div className="pt-3 border-t border-gray-300">
                                            <div className="text-sm space-y-1">
                                              <div>
                                                <strong>{produto.temPrejuizo ? 'Prejuízo' : 'Lucro'} Total:</strong> {formatCurrency(Math.abs(produto.lucroTotal))}
                                              </div>
                                              <div>
                                                <strong>Margem:</strong> {formatPercent(produto.margemMedia)}
                                              </div>
                                              <div>
                                                <strong>Vendas:</strong> {produto.totalVendas}
                                              </div>
                                            </div>
                                            {vendasComProblemas.length > 0 && produto.temPrejuizo && (
                                              <div className="text-sm mt-3 pt-3 border-t border-gray-300">
                                                <strong>Problemas identificados:</strong> {vendasComProblemas[0].problemas.join(', ')}
                                              </div>
                                            )}
                                          </div>
                                        </div>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visão por Pedido */}
          <TabsContent value="pedido" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise por Pedido</CardTitle>
                <CardDescription>
                  Detalhamento de cada venda com identificação de problemas (frete, taxa, preço).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filtros */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por produto, SKU ou número de venda..."
                      value={filtroProduto}
                      onChange={(e) => setFiltroProduto(e.target.value)}
                      className="pl-10"
                    />
                    {filtroProduto && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => setFiltroProduto("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Select value={filtroStatus} onValueChange={(v) => setFiltroStatus(v as "todos" | "lucro" | "prejuizo")}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="lucro">Com Lucro</SelectItem>
                      <SelectItem value="prejuizo">Com Prejuízo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Info de resultados */}
                {filtroProduto || filtroStatus !== "todos" ? (
                  <div className="text-sm text-muted-foreground">
                    Mostrando {pedidosFiltrados.length} de {vendasCalculadas.length} pedidos
                  </div>
                ) : null}

                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-[calc(100vh-350px)] overflow-y-auto overflow-x-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="sticky top-0 z-10 bg-background shadow-sm [&_tr]:border-b">
                        <tr className="bg-muted/50 border-b">
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-muted/50">Nº Venda</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-muted/50">Produto</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-muted/50">Status</th>
                          <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground bg-muted/50">Preço Venda</th>
                          <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground bg-muted/50">Custo</th>
                          <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground bg-muted/50">Comissão</th>
                          <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground bg-muted/50">Frete</th>
                          <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground bg-muted/50">Total Recebido</th>
                          <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground bg-muted/50">Lucro</th>
                          <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground bg-muted/50">Margem</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-muted/50">Problemas</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {pedidosFiltrados.length === 0 ? (
                          <tr className="border-b transition-colors hover:bg-muted/50">
                            <td colSpan={11} className="p-4 align-middle text-center py-8 text-muted-foreground">
                              Nenhum pedido encontrado com os filtros aplicados.
                            </td>
                          </tr>
                        ) : (
                          pedidosFiltrados.map((venda, idx) => {
                            const isExpanded = pedidoExpandido === venda.numeroVenda;
                            return (
                              <>
                                <tr 
                                  key={idx} 
                                  className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                                  onClick={() => setPedidoExpandido(isExpanded ? null : venda.numeroVenda)}
                                >
                                  <td className="p-4 align-middle font-mono text-xs">{venda.numeroVenda}</td>
                                  <td className="p-4 align-middle">
                                    <div>
                                      <div className="font-medium">{venda.tituloAnuncio}</div>
                                      {venda.variacao && (
                                        <div className="text-xs text-muted-foreground">{venda.variacao}</div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-4 align-middle">
                                    <Badge variant="outline">{venda.status}</Badge>
                                  </td>
                                  <td className="p-4 align-middle text-right">{formatCurrency(venda.precoVenda)}</td>
                                  <td className="p-4 align-middle text-right">{formatCurrency(venda.custoProduto)}</td>
                                  <td className="p-4 align-middle text-right">{formatCurrency(venda.comissaoMarketplace)}</td>
                                  <td className="p-4 align-middle text-right">{formatCurrency(venda.frete)}</td>
                                  <td className="p-4 align-middle text-right">{formatCurrency(venda.totalRecebido)}</td>
                                  <td className={`p-4 align-middle text-right font-bold ${venda.lucroReal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(venda.lucroReal)}
                                  </td>
                                  <td className={`p-4 align-middle text-right ${venda.margemPercentual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatPercent(venda.margemPercentual)}
                                  </td>
                                  <td className="p-4 align-middle">
                                    {venda.temPrejuizo && venda.problemas.length > 0 ? (
                                      <Alert variant="destructive" className="py-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription className="text-xs">
                                          {venda.problemas.join(', ')}
                                        </AlertDescription>
                                      </Alert>
                                    ) : (
                                      <Badge variant="outline" className="text-green-600">
                                        OK
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                                {isExpanded && (
                                  <tr key={`${idx}-detail`} className="border-b bg-muted/20">
                                    <td colSpan={11} className="p-4">
                                      <div className={`rounded-lg p-4 ${venda.temPrejuizo ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                                        <div className="flex items-center gap-2 mb-3">
                                          {venda.temPrejuizo ? (
                                            <AlertTriangle className="h-5 w-5 text-red-700" />
                                          ) : (
                                            <TrendingUp className="h-5 w-5 text-green-700" />
                                          )}
                                          <h4 className={`font-bold text-lg ${venda.temPrejuizo ? 'text-red-700' : 'text-green-700'}`}>
                                            {venda.temPrejuizo ? 'Análise de Prejuízo' : 'Análise de Lucro'}
                                          </h4>
                                        </div>
                                        <div className="space-y-3">
                                          <div className="text-sm">
                                            <strong>Venda #{venda.numeroVenda}</strong> - {venda.tituloAnuncio}
                                            {venda.variacao && (
                                              <div className="text-xs text-muted-foreground mt-1">{venda.variacao}</div>
                                            )}
                                          </div>
                                          <div className="text-sm grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <div>
                                              <div className="text-xs text-muted-foreground">Preço de Venda</div>
                                              <div className="font-semibold">{formatCurrency(venda.precoVenda)}</div>
                                            </div>
                                            <div>
                                              <div className="text-xs text-muted-foreground">Custo do Produto</div>
                                              <div className="font-semibold">{formatCurrency(venda.custoPorUnidade)}</div>
                                            </div>
                                            <div>
                                              <div className="text-xs text-muted-foreground">Comissão</div>
                                              <div className="font-semibold">{formatCurrency(venda.comissaoPorUnidade)}</div>
                                            </div>
                                            <div>
                                              <div className="text-xs text-muted-foreground">Frete</div>
                                              <div className="font-semibold">{formatCurrency(venda.fretePorUnidade)}</div>
                                            </div>
                                            <div>
                                              <div className="text-xs text-muted-foreground">Total Recebido</div>
                                              <div className="font-semibold">{formatCurrency(venda.totalRecebido)}</div>
                                            </div>
                                            <div>
                                              <div className="text-xs text-muted-foreground">Margem</div>
                                              <div className={`font-semibold ${venda.margemPercentual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatPercent(venda.margemPercentual)}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="pt-2 border-t">
                                            <div className="text-sm font-bold">
                                              {venda.temPrejuizo ? 'Prejuízo' : 'Lucro'}: {formatCurrency(Math.abs(venda.lucroReal))}
                                            </div>
                                            {venda.problemas.length > 0 && venda.temPrejuizo && (
                                              <div className="text-xs mt-2">
                                                <strong>Problemas identificados:</strong> {venda.problemas.join(', ')}
                                              </div>
                                            )}
                                          </div>
                                        </div>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default LucroReal;

