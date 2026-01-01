export function PromoCard() {
  return (
    <div className="bg-secondary rounded-2xl p-5 overflow-hidden relative animate-fade-in">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-30">
          <circle cx="80" cy="20" r="40" fill="hsl(var(--accent))" />
          <path 
            d="M60 10 L90 40 M65 5 L95 35 M70 0 L100 30" 
            stroke="hsl(var(--chart-green-dark))" 
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>
      
      <div className="absolute bottom-0 left-0 w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-20">
          <path 
            d="M10 90 L50 50 M20 100 L60 60 M0 80 L40 40" 
            stroke="hsl(var(--accent))" 
            strokeWidth="3"
            fill="none"
          />
        </svg>
      </div>

      <div className="relative z-10">
        <h3 className="text-xl font-bold text-foreground mb-2 leading-tight">
          Eleve suas vendas<br />
          gerenciando para o<br />
          próximo nível.
        </h3>
        
        <p className="text-sm text-muted-foreground mb-5">
          Uma forma de gerenciar vendas com cuidado e precisão.
        </p>

        <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
          Update to Formula da terra+
        </button>
      </div>
    </div>
  );
}
