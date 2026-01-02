import { useNavigate } from "react-router-dom";
import { ArrowRight, DollarSign } from "lucide-react";
import { DateRangePicker } from "./DateRangePicker";

export function TransactionsCard() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/transactions");
  };

  const handleDateRangeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Previne que o clique no DateRangePicker acione a navegação
  };

  return (
    <div className="bg-card rounded-2xl p-5 border border-border animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Transações</h3>
            <p className="text-sm text-muted-foreground">Visualizar todas as vendas</p>
          </div>
        </div>
        <div onClick={handleDateRangeClick}>
          <DateRangePicker />
        </div>
      </div>
      
      <div 
        onClick={handleClick}
        className="cursor-pointer group"
      >
        <p className="text-sm text-muted-foreground mb-3">
          Acesse a página completa de transações para ver detalhes de todas as vendas, incluindo dados do comprador, CPF e endereço.
        </p>
        <div className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
          <span>Ver todas as transações</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
}

