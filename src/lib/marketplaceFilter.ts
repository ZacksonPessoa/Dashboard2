import type { ProductData } from './excelReader';

/**
 * Filtra produtos por marketplace selecionado
 * 
 * @param products - Lista de produtos
 * @param selectedMarketplace - Marketplace selecionado ("Marketplace" = todos, "Mercado Livre", "Shopee", "Amazon", "Shein")
 * @returns Lista filtrada de produtos
 */
export function filterProductsByMarketplace(
  products: ProductData[],
  selectedMarketplace: string
): ProductData[] {
  // "Marketplace" = somatório geral (todos os produtos)
  if (selectedMarketplace === "Marketplace") {
    return products;
  }

  // Filtrar por marketplace específico
  // Por enquanto, todos os dados do Excel são do Mercado Livre (NOVEMBRO_ML.xlsx)
  // Quando tivermos dados de outros marketplaces, podemos adicionar um campo "marketplace" ao ProductData
  // ou identificar pelo nome do arquivo/contexto
  
  if (selectedMarketplace === "Mercado Livre") {
    // Todos os produtos do arquivo NOVEMBRO_ML.xlsx são do Mercado Livre
    return products;
  }

  // Outros marketplaces (Shopee, Amazon, Shein) ainda não têm dados
  // Retorna array vazio até que tenhamos dados desses marketplaces
  if (selectedMarketplace === "Shopee" || 
      selectedMarketplace === "Amazon" || 
      selectedMarketplace === "Shein") {
    return [];
  }

  // Fallback: retorna todos se marketplace não reconhecido
  return products;
}

