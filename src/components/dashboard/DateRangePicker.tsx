import { useState } from "react";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { DateRange } from "react-day-picker";
import { useDateRange } from "@/contexts/DateRangeContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DateRangePicker() {
  const { dateRange, setDateRange } = useDateRange();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange({ from: range.from, to: range.to });
      setIsOpen(false);
    } else if (range?.from) {
      // Se apenas from foi selecionado, aguarda a seleção do to
      setDateRange({ from: range.from, to: range.from });
    }
  };

  const formatDateRange = () => {
    if (!dateRange.from) return "Selecione um período";
    
    const fromStr = format(dateRange.from, "MMMM yyyy", { locale: ptBR });
    
    if (!dateRange.to || dateRange.from.getTime() === dateRange.to.getTime()) {
      return format(dateRange.from, "MMMM yyyy", { locale: ptBR });
    }
    
    const toStr = format(dateRange.to, "MMMM yyyy", { locale: ptBR });
    
    // Se for o mesmo mês, mostra apenas um
    if (dateRange.from.getMonth() === dateRange.to.getMonth() && 
        dateRange.from.getFullYear() === dateRange.to.getFullYear()) {
      return fromStr;
    }
    
    return `${fromStr} - ${toStr}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors",
            !dateRange && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <span>{formatDateRange()}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 max-w-[100vw] sm:max-w-none" align="end" sideOffset={4}>
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange.from}
          selected={{ from: dateRange.from, to: dateRange.to }}
          onSelect={handleSelect}
          numberOfMonths={isMobile ? 1 : 2}
        />
      </PopoverContent>
    </Popover>
  );
}
