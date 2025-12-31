import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useLucroReal } from "@/hooks/useLucroReal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, DollarSign, Search, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ReceitaDetalhada = () => {
  const { vendasCalculadas, resumo, loading } = useLucroReal();
  const [filtroProduto, setFiltroProduto] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "entregue" | "cancelada">("todos");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcula totais
  const totais = useMemo(() => {
    const receitaProdutos = vendasCalculadas.reduce((sum, v) => {
      // Receita por produtos = preço de venda * unidades
      return sum + (v.precoVenda * v.unidades);
    }, 0);

    const cancelamentosReembolsos = vendasCalculadas.reduce((sum, v) => {
      return sum + v.taxasExtras;
    }, 0);

    const totalVendido = receitaProdutos - cancelamentosReembolsos;
    const totalCancelados = vendasCalculadas.filter(v => 
      v.status.toLowerCase().includes('cancel') || v.taxasExtras > 0
    ).length;

    return {
      receitaProdutos,
      cancelamentosReembolsos,
      totalVendido,
      totalCancelados,
      totalUnidades: vendasCalculadas.reduce((sum, v) => sum + v.unidades, 0),
      totalRecebido: resumo.totalReceita,
    };
  }, [vendasCalculadas, resumo]);

  // Filtra vendas
  const vendasFiltradas = useMemo(() => {
    let filtradas = vendasCalculadas;

    // Filtro por texto
    if (filtroProduto.trim()) {
      const busca = filtroProduto.toLowerCase();
      filtradas = filtradas.filter(
        (v) =>
          v.tituloAnuncio.toLowerCase().includes(busca) ||
          v.sku.toLowerCase().includes(busca) ||
          v.numeroVenda.includes(busca)
      );
    }

    // Filtro por status
    if (filtroStatus === "entregue") {
      filtradas = filtradas.filter((v) => v.status.toLowerCase().includes('entregue'));
    } else if (filtroStatus === "cancelada") {
      filtradas = filtradas.filter((v) => 
        v.status.toLowerCase().includes('cancel') || v.taxasExtras > 0
      );
    }

    return filtradas;
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
          <h1 className="text-3xl font-bold">Detalhamento de Receita - Mercado Livre</h1>
          <p className="text-muted-foreground mt-2">
            Análise detalhada de receita por produtos, cancelamentos e valores recebidos
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 space-y-6">
        {/* Cards de Resumo */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita por Produtos</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totais.receitaProdutos)}</div>
              <p className="text-xs text-muted-foreground">Soma de (Preço × Unidades)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelamentos/Reembolsos</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totais.cancelamentosReembolsos)}</div>
              <p className="text-xs text-muted-foreground">{totais.totalCancelados} vendas canceladas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vendido</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totais.totalVendido)}</div>
              <p className="text-xs text-muted-foreground">Receita - Cancelamentos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totais.totalRecebido)}</div>
              <p className="text-xs text-muted-foreground">{totais.totalUnidades} unidades vendidas</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
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
              <Select value={filtroStatus} onValueChange={(v) => setFiltroStatus(v as "todos" | "entregue" | "cancelada")}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="entregue">Entregues</SelectItem>
                  <SelectItem value="cancelada">Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Info de resultados */}
            {(filtroProduto || filtroStatus !== "todos") && (
              <div className="text-sm text-muted-foreground mt-4">
                Mostrando {vendasFiltradas.length} de {vendasCalculadas.length} vendas
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabela de Vendas */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhamento de Receita por Venda</CardTitle>
            <CardDescription>
              Receita por produtos, cancelamentos, valor unitário, unidades e total recebido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[calc(100vh-350px)] overflow-y-auto overflow-x-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="sticky top-0 z-10 bg-background shadow-sm [&_tr]:border-b">
                    <tr className="bg-muted/50 border-b">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-muted/50">Nº Venda</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-muted/50">Produto</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-muted/50">Status</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground bg-muted/50">Valor Unitário</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground bg-muted/50">Unidades</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground bg-muted/50">Receita Produtos</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground bg-muted/50">Cancelamentos</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground bg-muted/50">Total Vendido</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground bg-muted/50">Total Recebido</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {vendasFiltradas.length === 0 ? (
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <td colSpan={9} className="p-4 align-middle text-center py-8 text-muted-foreground">
                          Nenhuma venda encontrada com os filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      <>
                        {vendasFiltradas.map((venda, idx) => {
                          const receitaProdutos = venda.precoVenda * venda.unidades;
                          const cancelamentos = venda.taxasExtras;
                          const totalVendido = receitaProdutos - cancelamentos;
                          
                          return (
                            <tr key={idx} className="border-b transition-colors hover:bg-muted/50">
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
                                <span className={`text-xs px-2 py-1 rounded ${
                                  venda.status.toLowerCase().includes('entregue') 
                                    ? 'bg-green-100 text-green-700' 
                                    : venda.status.toLowerCase().includes('cancel')
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {venda.status}
                                </span>
                              </td>
                              <td className="p-4 align-middle text-right">{formatCurrency(venda.precoVenda)}</td>
                              <td className="p-4 align-middle text-right">{venda.unidades}</td>
                              <td className="p-4 align-middle text-right font-semibold">{formatCurrency(receitaProdutos)}</td>
                              <td className="p-4 align-middle text-right text-red-600">
                                {cancelamentos > 0 ? formatCurrency(cancelamentos) : '-'}
                              </td>
                              <td className="p-4 align-middle text-right font-semibold">{formatCurrency(totalVendido)}</td>
                              <td className="p-4 align-middle text-right font-bold text-green-600">{formatCurrency(venda.totalRecebido)}</td>
                            </tr>
                          );
                        })}
                        <tr className="bg-muted/30 hover:bg-muted/30 border-t-2 border-border">
                          <td colSpan={5} className="p-4 align-middle font-bold text-foreground uppercase text-sm">Total</td>
                          <td className="p-4 align-middle text-right font-bold text-foreground">
                            {formatCurrency(vendasFiltradas.reduce((sum, v) => sum + (v.precoVenda * v.unidades), 0))}
                          </td>
                          <td className="p-4 align-middle text-right font-bold text-red-600">
                            {formatCurrency(vendasFiltradas.reduce((sum, v) => sum + v.taxasExtras, 0))}
                          </td>
                          <td className="p-4 align-middle text-right font-bold text-foreground">
                            {formatCurrency(vendasFiltradas.reduce((sum, v) => sum + (v.precoVenda * v.unidades) - v.taxasExtras, 0))}
                          </td>
                          <td className="p-4 align-middle text-right font-bold text-lg text-green-600">
                            {formatCurrency(vendasFiltradas.reduce((sum, v) => sum + v.totalRecebido, 0))}
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ReceitaDetalhada;

