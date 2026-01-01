import * as XLSX from 'xlsx';
import type { ProductData } from './excelReader';

export interface ProductCost {
  titulo: string;
  custo: number;
  comissao?: number;
  frete?: number;
}

// Carrega dados do Excel NOVEMBRO_ML.xlsx
export async function loadSalesData(): Promise<ProductData[]> {
  try {
    // No navegador, precisamos fazer fetch do arquivo
    const response = await fetch('/NOVEMBRO_ML.xlsx');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });
    
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: null 
    }) as any[];
    
    const processed = processExcelData(jsonData);
    console.log(`Carregados ${processed.length} produtos do Excel`);
    console.log('Primeiros produtos:', processed.slice(0, 3));
    return processed;
  } catch (error) {
    console.error('Erro ao carregar dados de vendas:', error);
    return [];
  }
}

// Carrega dados do CSV de custos
export async function loadProductCosts(): Promise<ProductCost[]> {
  try {
    const response = await fetch('/PRODUTOS E CUSTO PRODUÇÃO ML - 2024.xlsx - Planilha1.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    const lines = text.split('\n');
    
    // Pula as duas primeiras linhas (cabeçalhos)
    const products: ProductCost[] = [];
    
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      let titulo = '';
      let custo = 0;
      
      // Tenta diferentes padrões de parsing
      // Padrão 1: "Título","R$ X,XX"
      let match = line.match(/^"(.+?)"\s*,\s*"R\$\s*([\d,]+)"/);
      
      // Padrão 2: Título,"R$ X,XX" (sem aspas no título)
      if (!match) {
        match = line.match(/^(.+?),\s*"R\$\s*([\d,]+)"/);
      }
      
      // Padrão 3: Título, R$ X,XX (sem aspas)
      if (!match) {
        match = line.match(/^(.+?),\s*R\$\s*([\d,]+)/);
      }
      
      if (match) {
        titulo = match[1].trim().replace(/^"|"$/g, '');
        const custoStr = match[2].replace(',', '.');
        custo = parseFloat(custoStr) || 0;
      } else {
        // Fallback: separa por vírgula e pega os dois últimos campos
        const parts = line.split(',');
        if (parts.length >= 2) {
          // Título pode ter vírgulas, então pega tudo exceto o último campo
          titulo = parts.slice(0, -1).join(',').trim().replace(/^"|"$/g, '');
          const custoPart = parts[parts.length - 1].trim();
          const custoMatch = custoPart.match(/R\$\s*([\d,]+)/);
          if (custoMatch) {
            custo = parseFloat(custoMatch[1].replace(',', '.')) || 0;
          }
        }
      }
      
      if (titulo && custo > 0) {
        products.push({
          titulo,
          custo,
          comissao: custo * 0.12, // 12% de comissão padrão
          frete: 15.00, // Frete padrão
        });
      }
    }
    
    console.log(`Carregados ${products.length} produtos do CSV`);
    if (products.length > 0) {
      console.log('Exemplo de produto carregado:', products[0]);
    }
    return products;
  } catch (error) {
    console.error('Erro ao carregar custos de produtos:', error);
    return [];
  }
}

function processExcelData(rawData: any[]): ProductData[] {
  if (rawData.length === 0) {
    console.log("Nenhum dado no Excel");
    return [];
  }
  
  const headers = rawData[0] as string[];
  const dataRows = rawData.slice(1);
  
  console.log("Cabeçalhos encontrados:", headers);
  console.log(`Total de linhas de dados: ${dataRows.length}`);
  
  const columnMap: { [key: string]: number } = {};
  headers.forEach((header, index) => {
    if (header) {
      const normalizedHeader = header.toString().toLowerCase().trim();
      columnMap[normalizedHeader] = index;
    }
  });
  
  console.log("Mapeamento de colunas:", columnMap);
  
  const getColumn = (possibleNames: string[]): number | null => {
    for (const name of possibleNames) {
      const normalized = name.toLowerCase().trim();
      if (columnMap[normalized] !== undefined) {
        return columnMap[normalized];
      }
    }
    return null;
  };
  
  const processed: ProductData[] = [];
  
  dataRows.forEach((row, index) => {
    if (!row || row.length === 0) return;
    
    const product: ProductData = {};
    
    // Mapeamento baseado na estrutura real do Excel NOVEMBRO_ML.xlsx
    const produtoIdx = getColumn(['título do anúncio', 'titulo do anuncio', 'produto', 'product', 'nome', 'descrição', 'descricao', 'título', 'titulo', 'title']);
    const skuIdx = getColumn(['sku', 'código', 'codigo', 'id', 'código do produto']);
    const precoIdx = getColumn(['preço unitário de venda do anúncio (brl)', 'preco unitario de venda do anuncio (brl)', 'preço unitário de venda do anúncio', 'preco unitario de venda do anuncio', 'preço de venda', 'preco de venda', 'valor', 'price', 'venda', 'receita por produtos (brl)']);
    const custoIdx = getColumn(['custo por unidade', 'custo', 'custo do produto', 'cost', 'custo produto']);
    const comissaoIdx = getColumn(['comissão', 'comissao', 'taxa', 'fee', 'taxa marketplace', 'comissao marketplace', 'tarifa de venda e impostos']);
    const freteIdx = getColumn(['tarifas de envio', 'tarifa de envio', 'frete', 'shipping', 'envio', 'custo frete', 'receita por envio (brl)']);
    const impostosIdx = getColumn(['tarifa de venda e impostos', 'impostos', 'tax', 'imposto', 'imposto total']);
    const taxasIdx = getColumn(['tarifas de envio', 'taxas', 'taxas extras', 'outras taxas', 'taxa extra']);
    const pedidoIdx = getColumn(['n.º de venda', 'nº de venda', 'numero de venda', 'número de venda', 'pedido', 'order', 'ordem', 'id pedido', 'número pedido', 'numero pedido']);
    const dataIdx = getColumn(['data da venda', 'data de venda', 'data', 'date', 'data do pedido', 'data pedido']);
    const quantidadeIdx = getColumn(['unidades', 'quantidade', 'qtd', 'qty', 'amount', 'qty.']);
    
    // Função auxiliar para parsear valores numéricos
    const parseValue = (value: any): number => {
      if (value === null || value === undefined) return 0;
      if (typeof value === 'number') return Math.abs(value); // Valores negativos viram positivos (são custos)
      const str = String(value).replace(/[^\d,.-]/g, '').replace(',', '.');
      return Math.abs(parseFloat(str) || 0);
    };
    
    if (produtoIdx !== null) product.produto = row[produtoIdx]?.toString() || '';
    if (skuIdx !== null) product.sku = row[skuIdx]?.toString() || '';
    
    // Preço de venda - pode vir de "Receita por produtos" ou "Preço unitário de venda"
    if (precoIdx !== null) {
      product.precoVenda = parseValue(row[precoIdx]);
    }
    
    // Custo por unidade
    if (custoIdx !== null) {
      product.custo = parseValue(row[custoIdx]);
    }
    
    // "Tarifa de venda e impostos" - inclui comissão e impostos (vem negativo)
    const tarifaVendaImpostos = impostosIdx !== null ? Math.abs(parseValue(row[impostosIdx])) : 0;
    
    // "Tarifas de envio" - frete (vem negativo)
    if (freteIdx !== null) {
      product.frete = Math.abs(parseValue(row[freteIdx]));
    }
    
    // Comissão - se tiver campo específico, usa ele. Senão, calcula da tarifa
    if (comissaoIdx !== null && comissaoIdx !== impostosIdx) {
      product.comissao = Math.abs(parseValue(row[comissaoIdx]));
    } else {
      // A tarifa de venda geralmente inclui comissão (~12%) + impostos
      // Vamos usar 70% como comissão e 30% como impostos da tarifa total
      product.comissao = tarifaVendaImpostos * 0.7;
      product.impostos = tarifaVendaImpostos * 0.3;
    }
    
    // Se não calculou impostos acima, usa a tarifa completa
    if (!product.impostos && tarifaVendaImpostos > 0) {
      product.impostos = tarifaVendaImpostos * 0.3;
    }
    
    // Taxas extras (geralmente zero, mas pode ter campos adicionais)
    if (taxasIdx !== null && taxasIdx !== impostosIdx && taxasIdx !== freteIdx) {
      product.taxas = Math.abs(parseValue(row[taxasIdx]));
    } else {
      product.taxas = 0;
    }
    
    if (pedidoIdx !== null) product.pedido = row[pedidoIdx]?.toString() || '';
    if (dataIdx !== null) product.data = row[dataIdx]?.toString() || '';
    if (quantidadeIdx !== null) product.quantidade = parseInt(String(row[quantidadeIdx])) || 1;
    
    // Calcula totais
    product.totalVenda = product.precoVenda || 0;
    product.totalCusto = (product.custo || 0) + (product.comissao || 0) + (product.frete || 0) + (product.impostos || 0) + (product.taxas || 0);
    product.lucroReal = product.totalVenda - product.totalCusto;
    product.margem = product.totalVenda > 0 ? (product.lucroReal / product.totalVenda) * 100 : 0;
    
    // Aceita produto se tiver pelo menos nome ou preço
    if (product.produto || product.sku || product.precoVenda > 0) {
      processed.push(product);
    }
  });
  
  console.log(`Processados ${processed.length} produtos válidos`);
  if (processed.length > 0) {
    const primeiro = processed[0];
    console.log("Primeiro produto processado:", {
      produto: primeiro.produto,
      sku: primeiro.sku,
      precoVenda: primeiro.precoVenda,
      custo: primeiro.custo,
      comissao: primeiro.comissao,
      frete: primeiro.frete,
      impostos: primeiro.impostos,
      taxas: primeiro.taxas,
      totalVenda: primeiro.totalVenda,
      totalCusto: primeiro.totalCusto,
      lucroReal: primeiro.lucroReal,
      margem: primeiro.margem,
    });
    
    // Estatísticas gerais
    const receitaTotal = processed.reduce((sum, p) => sum + (p.precoVenda || 0), 0);
    const lucroTotal = processed.reduce((sum, p) => sum + (p.lucroReal || 0), 0);
    console.log(`Receita Total: R$ ${receitaTotal.toFixed(2)}`);
    console.log(`Lucro Total: R$ ${lucroTotal.toFixed(2)}`);
  }
  
  return processed;
}

