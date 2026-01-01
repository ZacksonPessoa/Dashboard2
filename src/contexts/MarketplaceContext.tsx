import { createContext, useContext, useState, ReactNode } from "react";

interface MarketplaceContextType {
  selectedMarketplace: string;
  setSelectedMarketplace: (marketplace: string) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [selectedMarketplace, setSelectedMarketplace] = useState("Marketplace");

  return (
    <MarketplaceContext.Provider value={{ selectedMarketplace, setSelectedMarketplace }}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (context === undefined) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider");
  }
  return context;
}

