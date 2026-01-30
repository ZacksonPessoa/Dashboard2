import type { ProductData } from "./excelReader";
import { readExcelFile } from "./excelReader";

export type { ProductData } from "./excelReader";

export interface ProductCost {
  titulo: string;
  custo: number;
  comissao?: number;
  frete?: number;
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsText(file, "UTF-8");
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/** Parse CSV de vendas (ex.: exportação Mercado Livre) para ProductData[] */
function parseCSVSales(text: string): ProductData[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  const getIndex = (names: string[]): number => {
    for (const name of names) {
      const idx = headers.findIndex((h) => h.toLowerCase().includes(name.toLowerCase()));
      if (idx !== -1) return idx;
    }
    return -1;
  };
  const nVendaIdx = getIndex(["n.º de venda", "numero de venda", "nº de venda"]);
  const dataIdx = getIndex(["data da venda", "data de venda"]);
  const unidadesIdx = getIndex(["unidades"]);
  const receitaIdx = getIndex(["receita por produtos", "receita produtos"]);
  const skuIdx = getIndex(["sku"]);
  const tituloIdx = getIndex(["título do anúncio", "titulo do anuncio"]);
  const precoUnitIdx = getIndex(["preço unitário", "preco unitario"]);
  const custoIdx = getIndex(["custo por unidade", "custo"]);
  const compradorIdx = getIndex(["comprador"]);
  const cpfIdx = getIndex(["cpf"]);
  const enderecoIdx = getIndex(["endereço", "endereco"]);
  const cidadeIdx = getIndex(["cidade"]);
  const cepIdx = getIndex(["cep"]);

  const parseCurrency = (val: string): number => {
    if (!val) return 0;
    const cleaned = val.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
    return Math.abs(parseFloat(cleaned) || 0);
  };

  const products: ProductData[] = [];
  for (let i = 1; i < lines.length; i++) {
    const columns = parseCSVLine(lines[i]);
    if (columns.length < 5) continue;
    const product: ProductData = {
      pedido: nVendaIdx >= 0 ? columns[nVendaIdx] : "",
      data: dataIdx >= 0 ? columns[dataIdx] : "",
      quantidade: unidadesIdx >= 0 ? parseInt(columns[unidadesIdx]) || 1 : 1,
      precoVenda:
        precoUnitIdx >= 0
          ? parseCurrency(columns[precoUnitIdx])
          : receitaIdx >= 0
            ? parseCurrency(columns[receitaIdx])
            : 0,
      produto: tituloIdx >= 0 ? columns[tituloIdx] : "",
      sku: skuIdx >= 0 ? columns[skuIdx] : "",
      custo: custoIdx >= 0 ? parseCurrency(columns[custoIdx]) : 0,
      comprador: compradorIdx >= 0 ? columns[compradorIdx] : "",
      cpf: cpfIdx >= 0 ? columns[cpfIdx] : "",
      endereco: enderecoIdx >= 0 ? columns[enderecoIdx] : "",
      cidade: cidadeIdx >= 0 ? columns[cidadeIdx] : "",
      cep: cepIdx >= 0 ? columns[cepIdx] : "",
    };
    product.totalVenda = product.precoVenda ?? 0;
    product.totalCusto = product.custo ?? 0;
    product.lucroReal = (product.totalVenda ?? 0) - (product.totalCusto ?? 0);
    product.margem =
      (product.totalVenda ?? 0) > 0
        ? ((product.lucroReal ?? 0) / (product.totalVenda ?? 1)) * 100
        : 0;
    if (product.produto || product.pedido) products.push(product);
  }
  return products;
}

/** Parse CSV de custos (título, custo) para ProductCost[] */
function parseCSVCosts(text: string): ProductCost[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const products: ProductCost[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    let titulo = "";
    let custo = 0;
    let match = line.match(/^"(.+?)"\s*,\s*"R\$\s*([\d,]+)"/);
    if (!match) match = line.match(/^(.+?),\s*"R\$\s*([\d,]+)"/);
    if (!match) match = line.match(/^(.+?),\s*R\$\s*([\d,]+)/);
    if (match) {
      titulo = match[1].trim().replace(/^"|"$/g, "");
      custo = parseFloat(match[2].replace(",", ".")) || 0;
    } else {
      const parts = line.split(",");
      if (parts.length >= 2) {
        titulo = parts.slice(0, -1).join(",").trim().replace(/^"|"$/g, "");
        const custoMatch = parts[parts.length - 1].trim().match(/R\$\s*([\d,]+)/);
        if (custoMatch) custo = parseFloat(custoMatch[1].replace(",", ".")) || 0;
      }
    }
    if (titulo && custo > 0) {
      products.push({
        titulo,
        custo,
        comissao: custo * 0.12,
        frete: 15,
      });
    }
  }
  return products;
}

/**
 * Lê arquivo de vendas (Excel ou CSV) e retorna ProductData[].
 * Use para upload pelo usuário.
 */
export async function parseSalesFile(file: File): Promise<ProductData[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv")) {
    const text = await readFileAsText(file);
    return parseCSVSales(text);
  }
  return readExcelFile(file);
}

/**
 * Lê arquivo de custos (CSV com título e custo) e retorna ProductCost[].
 */
export async function parseCostsFile(file: File): Promise<ProductCost[]> {
  const text = await readFileAsText(file);
  return parseCSVCosts(text);
}
