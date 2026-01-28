import { MoreHorizontal, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  period?: string;
  currency?: string;
  isLoading?: boolean;
}

export function StatCard({ title, value, change, period = "do mês anterior", currency = "R$", isLoading = false }: StatCardProps) {
  const isPositive = change >= 0;
  
  // Formata o valor
  const formattedValue = isLoading 
    ? "Carregando..."
    : typeof value === 'number' 
      ? value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
      : value;

  return (
    <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-border animate-fade-in min-w-0">
      <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
        <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">{title}</p>
        <button className="text-muted-foreground hover:text-foreground transition-colors shrink-0" aria-label="Mais opções">
          <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
      
      <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2 break-words">
        <span className="text-base sm:text-lg align-top">{currency}</span>
        {formattedValue}
      </p>
      
      <div className="flex items-center gap-1.5 flex-wrap">
        <div className={cn(
          "flex items-center gap-1 text-sm font-medium",
          isPositive ? "text-success" : "text-destructive"
        )}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>{isPositive ? "+" : ""}{change}%</span>
        </div>
        <span className="text-xs sm:text-sm text-muted-foreground">{period}</span>
      </div>
    </div>
  );
}
