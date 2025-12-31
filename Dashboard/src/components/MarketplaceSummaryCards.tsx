import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketplaceSummary } from "@/hooks/useSalesData";
import { ShoppingBag, Package } from "lucide-react";

interface MarketplaceSummaryCardsProps {
  summaries: MarketplaceSummary[];
}

export const MarketplaceSummaryCards = ({ summaries }: MarketplaceSummaryCardsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getMarketplaceColor = (marketplace: string) => {
    const colors: Record<string, { gradient: string, icon: string, badge: string }> = {
      'Amazon': { 
        gradient: 'bg-gradient-to-br from-orange-500/5 to-orange-600/5', 
        icon: 'text-marketplace-amazon',
        badge: 'bg-marketplace-amazon/10 text-marketplace-amazon border-marketplace-amazon/20'
      },
      'Shopee': { 
        gradient: 'bg-gradient-to-br from-orange-600/5 to-red-500/5', 
        icon: 'text-marketplace-shopee',
        badge: 'bg-marketplace-shopee/10 text-marketplace-shopee border-marketplace-shopee/20'
      },
      'Mercado Livre': { 
        gradient: 'bg-gradient-to-br from-yellow-500/5 to-yellow-600/5', 
        icon: 'text-marketplace-mercado-livre',
        badge: 'bg-marketplace-mercado-livre/10 text-marketplace-mercado-livre border-marketplace-mercado-livre/20'
      },
      'Shein': { 
        gradient: 'bg-gradient-to-br from-pink-500/5 to-purple-500/5', 
        icon: 'text-marketplace-shein',
        badge: 'bg-marketplace-shein/10 text-marketplace-shein border-marketplace-shein/20'
      },
    };
    return colors[marketplace] || { 
      gradient: 'bg-gradient-to-br from-primary/5 to-primary/10', 
      icon: 'text-primary',
      badge: 'bg-primary/10 text-primary border-primary/20'
    };
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-foreground tracking-tight">Resumo por Marketplace</h2>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {summaries.map((summary) => {
          const colorScheme = getMarketplaceColor(summary.marketplace);
          return (
            <Card 
              key={summary.marketplace}
              className={`group border-0 shadow-card hover:shadow-card-hover transition-all duration-300 ${colorScheme.gradient}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-foreground uppercase tracking-wide">
                  {summary.marketplace}
                </CardTitle>
                <div className={`p-2 rounded-xl ${colorScheme.badge} border`}>
                  <ShoppingBag className={`h-3.5 w-3.5 ${colorScheme.icon}`} strokeWidth={2.5} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold text-foreground tracking-tight">
                  {formatCurrency(summary.totalVendas)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Package className="h-3.5 w-3.5" strokeWidth={2.5} />
                  <span>{summary.quantidade} produtos vendidos</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
