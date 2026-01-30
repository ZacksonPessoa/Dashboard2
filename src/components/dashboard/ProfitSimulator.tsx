import { useState } from "react";
import { Calculator, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useSalesData } from "@/contexts/SalesDataContext";

interface ProfitSimulatorProps {
  trigger?: React.ReactNode;
}

export function ProfitSimulator({ trigger }: ProfitSimulatorProps) {
  const [open, setOpen] = useState(false);
  const { productCosts, isLoadingUpload } = useSalesData();
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [precoVenda, setPrecoVenda] = useState("");
  const [impostos, setImpostos] = useState("");
  const [taxas, setTaxas] = useState("");

  const products = productCosts;
  const selectedProductData = products.find(p => p.titulo === selectedProduct);

  const custo = selectedProductData?.custo || 0;
  const comissao = selectedProductData?.comissao || 0;
  const frete = selectedProductData?.frete || 0;
  const precoVendaNum = parseFloat(precoVenda) || 0;
  const impostosPercent = parseFloat(impostos) || 0; // Porcentagem
  const taxasNum = parseFloat(taxas) || 0;

  // Calcula impostos como porcentagem do preço de venda
  const impostosNum = precoVendaNum > 0 ? (precoVendaNum * impostosPercent) / 100 : 0;

  const totalCustos = custo + comissao + frete + impostosNum + taxasNum;
  const lucroReal = precoVendaNum - totalCustos;
  const margem = precoVendaNum > 0 ? (lucroReal / precoVendaNum) * 100 : 0;
  const temPrejuizo = lucroReal < 0;

  const handleReset = () => {
    setSelectedProduct("");
    setPrecoVenda("");
    setImpostos("");
    setTaxas("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Calculator className="w-4 h-4 mr-2" />
            Simulador de Lucro Real
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Simulador de Lucro Real
          </DialogTitle>
          <DialogDescription>
            Calcule o lucro real considerando todos os custos e taxas. Selecione um produto para preencher automaticamente custo, comissão e frete.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Seleção de Produto */}
          <div className="space-y-2">
            <Label htmlFor="produto">Selecione o Produto</Label>
            <Select
              value={selectedProduct}
              onValueChange={setSelectedProduct}
              disabled={isLoadingUpload}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingUpload ? "Carregando produtos..." : "Selecione um produto"} />
              </SelectTrigger>
              <SelectContent>
                {products.map((product, index) => (
                  <SelectItem key={index} value={product.titulo}>
                    {product.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Campos preenchidos automaticamente */}
            <div className="space-y-2">
              <Label htmlFor="custo">Custo do Produto (R$)</Label>
              <Input
                id="custo"
                type="number"
                step="0.01"
                value={custo.toFixed(2)}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Preenchido automaticamente</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comissao">Comissão Marketplace (R$)</Label>
              <Input
                id="comissao"
                type="number"
                step="0.01"
                value={comissao.toFixed(2)}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Preenchido automaticamente</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="frete">Frete (R$)</Label>
              <Input
                id="frete"
                type="number"
                step="0.01"
                value={frete.toFixed(2)}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Preenchido automaticamente</p>
            </div>

            {/* Campos para digitar */}
            <div className="space-y-2">
              <Label htmlFor="precoVenda">Preço de Venda (R$)</Label>
              <Input
                id="precoVenda"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={precoVenda}
                onChange={(e) => setPrecoVenda(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="impostos">Impostos (%)</Label>
              <Input
                id="impostos"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={impostos}
                onChange={(e) => setImpostos(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {impostosPercent > 0 && precoVendaNum > 0 
                  ? `R$ ${impostosNum.toFixed(2)} (${impostosPercent}% de R$ ${precoVendaNum.toFixed(2)})`
                  : "Porcentagem sobre o preço de venda"}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxas">Taxas Extras (R$)</Label>
              <Input
                id="taxas"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={taxas}
                onChange={(e) => setTaxas(e.target.value)}
              />
            </div>
          </div>

          {/* Resultado */}
          <div className="mt-6 p-4 rounded-lg bg-muted/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total de Custos:</span>
              <span className="font-semibold">R$ {totalCustos.toFixed(2)}</span>
            </div>
            {impostosPercent > 0 && precoVendaNum > 0 && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Impostos ({impostosPercent}%):</span>
                <span>R$ {impostosNum.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Lucro Real:</span>
              <span className={cn(
                "font-bold text-lg",
                temPrejuizo ? "text-destructive" : "text-success"
              )}>
                R$ {lucroReal.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Margem (%):</span>
              <span className={cn(
                "font-bold text-lg flex items-center gap-2",
                temPrejuizo ? "text-destructive" : "text-success"
              )}>
                {temPrejuizo ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
                {margem.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Alertas */}
          {temPrejuizo && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Prejuízo Detectado!</AlertTitle>
              <AlertDescription>
                Este produto está gerando prejuízo. Revise os custos ou ajuste o preço de venda.
              </AlertDescription>
            </Alert>
          )}

          {!temPrejuizo && margem < 10 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Margem Baixa</AlertTitle>
              <AlertDescription>
                A margem de lucro está abaixo de 10%. Considere revisar os custos ou aumentar o preço.
              </AlertDescription>
            </Alert>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset}>
              Limpar
            </Button>
            <Button onClick={() => setOpen(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
