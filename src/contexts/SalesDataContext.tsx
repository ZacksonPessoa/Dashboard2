import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { ProductData } from "@/lib/excelReader";
import type { ProductCost } from "@/lib/dataLoader";
import { parseSalesFile, parseCostsFile } from "@/lib/dataLoader";

interface SalesDataContextType {
  salesData: ProductData[];
  productCosts: ProductCost[];
  isLoadingUpload: boolean;
  uploadError: string | null;
  uploadSalesFile: (file: File) => Promise<void>;
  uploadCostsFile: (file: File) => Promise<void>;
  clearSalesData: () => void;
  clearCostsData: () => void;
}

const SalesDataContext = createContext<SalesDataContextType | undefined>(undefined);

export function SalesDataProvider({ children }: { children: ReactNode }) {
  const [salesData, setSalesData] = useState<ProductData[]>([]);
  const [productCosts, setProductCosts] = useState<ProductCost[]>([]);
  const [isLoadingUpload, setIsLoadingUpload] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadSalesFile = useCallback(async (file: File) => {
    setUploadError(null);
    setIsLoadingUpload(true);
    try {
      const data = await parseSalesFile(file);
      setSalesData(data);
      console.log(`Planilha de vendas carregada: ${data.length} registros`);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erro ao ler a planilha de vendas.");
      setSalesData([]);
    } finally {
      setIsLoadingUpload(false);
    }
  }, []);

  const uploadCostsFile = useCallback(async (file: File) => {
    setUploadError(null);
    setIsLoadingUpload(true);
    try {
      const data = await parseCostsFile(file);
      setProductCosts(data);
      console.log(`Planilha de custos carregada: ${data.length} registros`);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erro ao ler a planilha de custos.");
      setProductCosts([]);
    } finally {
      setIsLoadingUpload(false);
    }
  }, []);

  const clearSalesData = useCallback(() => {
    setSalesData([]);
    setUploadError(null);
  }, []);

  const clearCostsData = useCallback(() => {
    setProductCosts([]);
    setUploadError(null);
  }, []);

  return (
    <SalesDataContext.Provider
      value={{
        salesData,
        productCosts,
        isLoadingUpload,
        uploadError,
        uploadSalesFile,
        uploadCostsFile,
        clearSalesData,
        clearCostsData,
      }}
    >
      {children}
    </SalesDataContext.Provider>
  );
}

export function useSalesData() {
  const context = useContext(SalesDataContext);
  if (context === undefined) {
    throw new Error("useSalesData must be used within a SalesDataProvider");
  }
  return context;
}
