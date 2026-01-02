import * as XLSX from 'xlsx';

export interface ProductData {
  // Dados básicos do produto
  produto?: string;
  sku?: string;
  codigo?: string;
  
  // Valores financeiros
  precoVenda?: number;
  custo?: number;
  comissao?: number;
  frete?: number;
  impostos?: number;
  taxas?: number;
  
  // Dados do pedido
  pedido?: string;
  data?: string;
  quantidade?: number;
  
  // Dados do comprador
  comprador?: string;
  cpf?: string;
  endereco?: string;
  cidade?: string;
  cep?: string;
  
  // Calculados
  lucroReal?: number;
  margem?: number;
  totalVenda?: number;
  totalCusto?: number;
}

export function readExcelFile(file: File): Promise<ProductData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Pega a primeira planilha
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Converte para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: null 
        }) as any[];
        
        // Processa os dados
        const processedData = processExcelData(jsonData);
        resolve(processedData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function processExcelData(rawData: any[]): ProductData[] {
  if (rawData.length === 0) return [];
  
  // Primeira linha são os cabeçalhos
  const headers = rawData[0] as string[];
  const dataRows = rawData.slice(1);
  
  // Mapeia os índices das colunas
  const columnMap: { [key: string]: number } = {};
  headers.forEach((header, index) => {
    if (header) {
      const normalizedHeader = header.toString().toLowerCase().trim();
      columnMap[normalizedHeader] = index;
    }
  });
  
  // Função auxiliar para encontrar coluna
  const getColumn = (possibleNames: string[]): number | null => {
    for (const name of possibleNames) {
      const normalized = name.toLowerCase().trim();
      if (columnMap[normalized] !== undefined) {
        return columnMap[normalized];
      }
    }
    return null;
  };
  
  // Processa cada linha
  const processed: ProductData[] = [];
  
  dataRows.forEach((row, rowIndex) => {
    if (!row || row.length === 0) return;
    
    const product: ProductData = {};
    
    // Tenta mapear os campos comuns
    const produtoIdx = getColumn(['produto', 'product', 'nome', 'descrição', 'descricao']);
    const skuIdx = getColumn(['sku', 'código', 'codigo', 'id']);
    const precoIdx = getColumn(['preço', 'preco', 'preço de venda', 'preco de venda', 'valor', 'price']);
    const custoIdx = getColumn(['custo', 'custo do produto', 'cost']);
    const comissaoIdx = getColumn(['comissão', 'comissao', 'taxa', 'fee']);
    const freteIdx = getColumn(['frete', 'shipping', 'envio']);
    const impostosIdx = getColumn(['impostos', 'tax', 'imposto']);
    const taxasIdx = getColumn(['taxas', 'taxas extras', 'outras taxas']);
    const pedidoIdx = getColumn(['pedido', 'order', 'ordem']);
    const dataIdx = getColumn(['data', 'date', 'data do pedido']);
    const quantidadeIdx = getColumn(['quantidade', 'qtd', 'qty', 'amount']);
    
    if (produtoIdx !== null) product.produto = row[produtoIdx]?.toString() || '';
    if (skuIdx !== null) product.sku = row[skuIdx]?.toString() || '';
    if (precoIdx !== null) product.precoVenda = parseFloat(row[precoIdx]) || 0;
    if (custoIdx !== null) product.custo = parseFloat(row[custoIdx]) || 0;
    if (comissaoIdx !== null) product.comissao = parseFloat(row[comissaoIdx]) || 0;
    if (freteIdx !== null) product.frete = parseFloat(row[freteIdx]) || 0;
    if (impostosIdx !== null) product.impostos = parseFloat(row[impostosIdx]) || 0;
    if (taxasIdx !== null) product.taxas = parseFloat(row[taxasIdx]) || 0;
    if (pedidoIdx !== null) product.pedido = row[pedidoIdx]?.toString() || '';
    if (dataIdx !== null) product.data = row[dataIdx]?.toString() || '';
    if (quantidadeIdx !== null) product.quantidade = parseInt(row[quantidadeIdx]) || 1;
    
    // Calcula valores derivados
    product.totalVenda = product.precoVenda || 0;
    product.totalCusto = (product.custo || 0) + (product.comissao || 0) + (product.frete || 0) + (product.impostos || 0) + (product.taxas || 0);
    product.lucroReal = product.totalVenda - product.totalCusto;
    product.margem = product.totalVenda > 0 ? (product.lucroReal / product.totalVenda) * 100 : 0;
    
    // Só adiciona se tiver pelo menos algum dado
    if (product.produto || product.sku || product.precoVenda) {
      processed.push(product);
    }
  });
  
  return processed;
}

// Função para ler arquivo do sistema de arquivos (Node.js)
export async function readExcelFileFromPath(filePath: string): Promise<ProductData[]> {
  try {
    const workbook = XLSX.readFile(filePath);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: null 
    }) as any[];
    
    return processExcelData(jsonData);
  } catch (error) {
    console.error('Erro ao ler arquivo Excel:', error);
    return [];
  }
}

