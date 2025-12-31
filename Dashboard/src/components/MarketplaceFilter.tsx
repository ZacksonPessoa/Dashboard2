import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Marketplace } from "@/hooks/useSalesData";

interface MarketplaceFilterProps {
  value: Marketplace | 'Todos';
  onChange: (value: Marketplace | 'Todos') => void;
}

export const MarketplaceFilter = ({ value, onChange }: MarketplaceFilterProps) => {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Filtrar por:
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[220px] h-11 bg-card border-0 shadow-card hover:shadow-card-hover transition-all rounded-xl">
          <SelectValue placeholder="Selecione o marketplace" />
        </SelectTrigger>
        <SelectContent className="bg-card border-0 shadow-card-hover rounded-xl">
          <SelectItem value="Todos" className="rounded-lg">Todos os Marketplaces</SelectItem>
          <SelectItem value="Amazon" className="rounded-lg">Amazon</SelectItem>
          <SelectItem value="Shopee" className="rounded-lg">Shopee</SelectItem>
          <SelectItem value="Mercado Livre" className="rounded-lg">Mercado Livre</SelectItem>
          <SelectItem value="Shein" className="rounded-lg">Shein</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
