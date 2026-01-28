import { useState } from "react";
import { 
  LayoutGrid, 
  BarChart3, 
  Receipt,
  Menu
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: LayoutGrid, label: "Visão Geral", path: "/" },
  { icon: BarChart3, label: "Estatísticas", path: "/statistics" },
  { icon: Receipt, label: "Transações", path: "/transactions" },
];

const SidebarContent = () => {
  const location = useLocation();

  return (
    <>
      {/* Logo */}
      <div className="px-2 mb-6">
        <Link to="/" className="flex items-center gap-2">
          {/* Logo Icon - Círculo com folhas */}
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 60 60" className="w-full h-full">
              {/* Círculo externo */}
              <circle
                cx="30"
                cy="30"
                r="28"
                fill="none"
                stroke="hsl(var(--sidebar-primary))"
                strokeWidth="2"
              />
              {/* Folha maior (atrás) */}
              <path
                d="M 30 15 Q 20 20 18 30 Q 20 40 30 45 Q 40 40 42 30 Q 40 20 30 15 Z"
                fill="hsl(var(--sidebar-primary))"
                opacity="0.9"
              />
              {/* Folha menor (frente) */}
              <path
                d="M 30 20 Q 24 24 23 30 Q 24 36 30 40 Q 36 36 37 30 Q 36 24 30 20 Z"
                fill="hsl(var(--sidebar-primary))"
              />
            </svg>
          </div>
          {/* Texto do logo */}
          <div className="flex flex-col">
            <span className="text-sidebar-foreground font-bold text-xs leading-tight">
              Fórmula da Terra
            </span>
            <span className="text-sidebar-muted text-[9px] leading-tight mt-0.5">
              Farmácia de manipulação e<br />
              bem estar, desde 2004.
            </span>
          </div>
        </Link>
      </div>

      {/* Menu Section */}
      <div className="flex-1">
        <p className="text-sidebar-muted text-xs font-medium uppercase tracking-wider px-2 mb-3">
          Menu
        </p>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-foreground border-l-2 border-sidebar-primary"
                    : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3 px-2 py-3 mt-4 border-t border-sidebar-border">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-semibold">
          F
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sidebar-foreground text-sm font-medium truncate">
            Fandaww Punx
          </p>
          <p className="text-sidebar-muted text-xs truncate">
            fandaww6@gmail.com
          </p>
        </div>
      </div>
    </>
  );
};

export function Sidebar() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[min(85vw,20rem)] p-0 bg-sidebar">
          <div className="flex flex-col h-full p-4 overflow-y-auto">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-sidebar flex flex-col p-4 overflow-y-auto z-40">
      <SidebarContent />
    </aside>
  );
}
