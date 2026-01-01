import { 
  LayoutGrid, 
  BarChart3, 
  Users, 
  Package, 
  Mail, 
  Receipt, 
  Settings, 
  Shield,
  ChevronDown
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutGrid, label: "Visão Geral", path: "/" },
  { icon: BarChart3, label: "Estatísticas", path: "/statistics" },
  { icon: Users, label: "Clientes", path: "/customers" },
  { icon: Package, label: "Produtos", path: "/products", hasSubmenu: true },
  { icon: Mail, label: "Mensagens", path: "/messages", badge: 13 },
  { icon: Receipt, label: "Transações", path: "/transactions" },
];

const generalItems = [
  { icon: Settings, label: "Configurações" },
  { icon: Shield, label: "Segurança" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-sidebar flex flex-col p-4 overflow-y-auto z-40">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-sidebar-primary">
              <path
                fill="currentColor"
                d="M12 2L12 7M12 17L12 22M2 12H7M17 12H22M4.93 4.93L8.46 8.46M15.54 15.54L19.07 19.07M4.93 19.07L8.46 15.54M15.54 8.46L19.07 4.93"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-sidebar-foreground font-semibold text-lg">Formula da terra</span>
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
                {item.badge && (
                  <span className="bg-sidebar-primary text-sidebar-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.hasSubmenu && <ChevronDown className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        {/* General Section */}
        <p className="text-sidebar-muted text-xs font-medium uppercase tracking-wider px-2 mt-8 mb-3">
          Geral
        </p>
        <nav className="space-y-1">
          {generalItems.map((item) => (
            <a
              key={item.label}
              href="#"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </a>
          ))}
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
    </aside>
  );
}
