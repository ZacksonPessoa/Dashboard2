/**
 * Utilitário para parsear valores monetários do CSV
 */
export function parseCurrency(value: string): number {
  if (!value || value.trim() === '') return 0;
  
  // Remove R$, espaços e converte vírgula para ponto
  const cleaned = value
    .replace(/R\$/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  
  return parseFloat(cleaned) || 0;
}

/**
 * Parseia uma linha do CSV de vendas do Mercado Livre
 */
export interface MercadoLivreVenda {
  numeroVenda: string;
  dataVenda: string;
  status: string;
  unidades: number;
  receitaProdutos: number;
  receitaEnvio: number;
  tarifaVendaImpostos: number; // negativo
  tarifasEnvio: number; // negativo
  cancelamentosReembolsos: number; // negativo
  total: number;
  sku: string;
  tituloAnuncio: string;
  variacao: string;
  precoUnitario: number;
  custoPorUnidade: number;
  tipoAnuncio: string;
}

export function parseVendasCSV(csvContent: string): MercadoLivreVenda[] {
  // Parse CSV completo considerando campos entre aspas que podem ter quebras de linha
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;
  
  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];
    
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if (char === '\n' && !inQuotes) {
      lines.push(currentLine);
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  const vendas: MercadoLivreVenda[] = [];
  
  // Pula o cabeçalho (linha 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV considerando que valores podem estar entre aspas
    const columns = parseCSVLine(line);
    
    if (columns.length < 20) continue;
    
    try {
      const venda: MercadoLivreVenda = {
        numeroVenda: columns[0] || '',
        dataVenda: columns[1] || '',
        status: columns[2] || '',
        unidades: parseInt(columns[5] || '0') || 0,
        receitaProdutos: parseCurrency(columns[6] || '0'),
        receitaEnvio: parseCurrency(columns[7] || '0'),
        tarifaVendaImpostos: parseCurrency(columns[8] || '0'), // já vem negativo
        tarifasEnvio: parseCurrency(columns[9] || '0'), // já vem negativo
        cancelamentosReembolsos: parseCurrency(columns[10] || '0'), // já vem negativo
        total: parseCurrency(columns[11] || '0'),
        sku: columns[14] || '',
        tituloAnuncio: columns[16] || '',
        variacao: columns[17] || '',
        precoUnitario: parseCurrency(columns[18] || '0'),
        custoPorUnidade: parseCurrency(columns[19] || '0'),
        tipoAnuncio: columns[20] || '',
      };
      
      // Só adiciona se tiver dados válidos
      if (venda.numeroVenda && venda.tituloAnuncio) {
        vendas.push(venda);
      }
    } catch (error) {
      console.warn(`Erro ao parsear linha ${i}:`, error);
    }
  }
  
  return vendas;
}

/**
 * Parseia uma linha do CSV de custos
 */
export interface ProdutoCusto {
  titulo: string;
  custoPorUnidade: number;
}

export function parseCustosCSV(csvContent: string): Map<string, number> {
  const lines = csvContent.split('\n');
  const custos = new Map<string, number>();
  
  // Pula as duas primeiras linhas (cabeçalho)
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const columns = parseCSVLine(line);
    
    if (columns.length >= 2) {
      const titulo = columns[0]?.trim() || '';
      const custo = parseCurrency(columns[1] || '0');
      
      if (titulo && custo > 0) {
        custos.set(titulo, custo);
      }
    }
  }
  
  return custos;
}

/**
 * Parseia uma linha CSV considerando valores entre aspas
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

