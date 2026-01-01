import { useState } from "react";
import { Search, Calendar as CalendarIcon, Users, Plus } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMarketplace } from "@/contexts/MarketplaceContext";

export function Header() {
  const { selectedMarketplace, setSelectedMarketplace } = useMarketplace();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const handleMarketplaceChange = (value: string) => {
    setSelectedMarketplace(value);
    // Aqui você pode adicionar a lógica para recarregar os dados
    // baseado no marketplace selecionado
    if (value === "Marketplace") {
      // Recarregar todas as informações gerais dos e-commerces
      console.log("Recarregando dados de todos os marketplaces");
    } else {
      // Recarregar dados do marketplace específico
      console.log(`Recarregando dados do ${value}`);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      // Aqui você pode adicionar a lógica para filtrar/recarregar dados pela data selecionada
      console.log("Data selecionada:", format(date, "dd/MM/yyyy"));
    }
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-card backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Select value={selectedMarketplace} onValueChange={handleMarketplaceChange}>
          <SelectTrigger className="w-[180px] border-none bg-transparent text-xl font-semibold text-foreground hover:bg-accent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Marketplace">Marketplace</SelectItem>
            <SelectItem value="Mercado Livre">Mercado Livre</SelectItem>
            <SelectItem value="Shopee">Shopee</SelectItem>
            <SelectItem value="Amazon">Amazon</SelectItem>
            <SelectItem value="Shein">Shein</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar qualquer coisa no Formula da terra..."
            className="w-64 pl-10 bg-background border-border"
          />
        </div>

        {/* Calendar */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <CalendarIcon className="w-5 h-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Users className="w-5 h-5" />
        </Button>

        {/* Add Product Button */}
        <Button className="bg-foreground text-background hover:bg-foreground/90 gap-2">
          Adicionar novo produto
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
