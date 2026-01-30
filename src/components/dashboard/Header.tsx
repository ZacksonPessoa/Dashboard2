import { useState, useRef } from "react";
import { Search, Calendar as CalendarIcon, Users, Plus, Upload } from "lucide-react";
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
import { useSalesData } from "@/contexts/SalesDataContext";

export function Header() {
  const { selectedMarketplace, setSelectedMarketplace } = useMarketplace();
  const { uploadSalesFile, isLoadingUpload } = useSalesData();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadSalesFile(file);
      e.target.value = "";
    }
  };

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
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-border bg-card backdrop-blur-sm min-w-0">
      <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
        <Select value={selectedMarketplace} onValueChange={handleMarketplaceChange}>
          <SelectTrigger className="w-full min-w-0 sm:w-[140px] md:w-[160px] lg:w-[180px] border-none bg-transparent text-sm sm:text-base md:text-lg font-semibold text-foreground hover:bg-accent">
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

      <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 shrink-0 flex-wrap">
        {/* Search - Hidden on mobile */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="w-40 lg:w-64 pl-10 bg-background border-border"
          />
        </div>

        {/* Calendar */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground h-9 w-9">
              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
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
        
        <Button variant="ghost" size="icon" className="hidden sm:flex shrink-0 text-muted-foreground hover:text-foreground h-9 w-9">
          <Users className="w-5 h-5" />
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Upload planilha"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 h-9 px-3 gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
          onClick={handleUploadClick}
          disabled={isLoadingUpload}
        >
          <Upload className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">{isLoadingUpload ? "Carregando..." : "Upload planilha"}</span>
        </Button>

        <Button className="bg-foreground text-background hover:bg-foreground/90 gap-1.5 sm:gap-2 text-xs sm:text-sm shrink-0 h-9 px-3 sm:px-4">
          <span className="hidden sm:inline">Adicionar novo produto</span>
          <span className="sm:hidden">Adicionar</span>
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
        </Button>
      </div>
    </header>
  );
}
