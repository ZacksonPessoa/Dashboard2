import { useMemo, useState, useEffect } from 'react';
import { parseVendasCSV, parseCustosCSV, MercadoLivreVenda, ProdutoCusto } from '@/utils/csvParser';

export interface LucroCalculado {
  // Dados da venda
  numeroVenda: string;
  dataVenda: string;
  status: string;
  sku: string;
  tituloAnuncio: string;
  variacao: string;
  unidades: number;
  
  // Valores financeiros
  precoVenda: number; // unitário
  custoProduto: number; // total
  custoPorUnidade: number; // unitário
  comissaoMarketplace: number; // total (tarifa de venda e impostos)
  comissaoPorUnidade: number; // unitário
  frete: number; // total (tarifas de envio)
  fretePorUnidade: number; // unitário
  receitaEnvio: number;
  impostos: number; // parte dos impostos na tarifa
  taxasExtras: number; // cancelamentos e reembolsos
  totalRecebido: number;
  
  // Cálculos
  lucroReal: number;
  margemPercentual: number;
  temPrejuizo: boolean;
  
  // Detalhamento de problemas
  problemas: string[];
}

export interface LucroPorProduto {
  tituloAnuncio: string;
  sku: string;
  totalVendas: number;
  totalUnidades: number;
  receitaTotal: number;
  custoTotal: number;
  comissaoTotal: number;
  freteTotal: number;
  lucroTotal: number;
  margemMedia: number;
  temPrejuizo: boolean;
  vendas: LucroCalculado[];
}

export function useLucroReal() {
  const [vendasCSV, setVendasCSV] = useState<string>('');
  const [custosCSV, setCustosCSV] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Carrega os arquivos CSV
  useEffect(() => {
    const loadCSVs = async () => {
      try {
        // Carrega vendas
        const vendasResponse = await fetch('/NOVEMBRO_ML.xlsx - Vendas BR.csv');
        if (!vendasResponse.ok) {
          throw new Error('Erro ao carregar vendas');
        }
        const vendasText = await vendasResponse.text();
        setVendasCSV(vendasText);

        // Carrega custos
        const custosResponse = await fetch('/PRODUTOS E CUSTO PRODUÇÃO ML - 2024.xlsx - Planilha1.csv');
        if (!custosResponse.ok) {
          throw new Error('Erro ao carregar custos');
        }
        const custosText = await custosResponse.text();
        setCustosCSV(custosText);
      } catch (error) {
        console.error('Erro ao carregar CSVs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCSVs();
  }, []);

  // Processa os dados e calcula lucro
  const { vendasCalculadas, lucroPorProduto, resumo } = useMemo(() => {
    if (!vendasCSV || !custosCSV) {
      return {
        vendasCalculadas: [],
        lucroPorProduto: [],
        resumo: {
          totalVendas: 0,
          totalReceita: 0,
          totalCusto: 0,
          totalLucro: 0,
          vendasComPrejuizo: 0,
          produtosComPrejuizo: 0,
        },
      };
    }

    const vendas = parseVendasCSV(vendasCSV);
    const custos = parseCustosCSV(custosCSV);

    // Calcula lucro para cada venda
    const vendasCalculadas: LucroCalculado[] = vendas.map((venda) => {
      // Busca custo do produto (tenta match exato primeiro, depois parcial)
      let custoProduto = venda.custoPorUnidade;
      
      if (custoProduto === 0 || !custoProduto) {
        // Tenta encontrar pelo título
        for (const [titulo, custo] of custos.entries()) {
          if (venda.tituloAnuncio.toLowerCase().includes(titulo.toLowerCase()) ||
              titulo.toLowerCase().includes(venda.tituloAnuncio.toLowerCase())) {
            custoProduto = custo;
            break;
          }
        }
      }

      // Valores já vêm do CSV
      const precoVenda = venda.precoUnitario;
      const receitaProdutos = venda.receitaProdutos;
      const receitaEnvio = venda.receitaEnvio;
      
      // Taxas vêm negativas no CSV (ex: -15,3, -19,95)
      const tarifaVendaImpostos = venda.tarifaVendaImpostos; // já vem negativo
      const tarifasEnvio = venda.tarifasEnvio; // já vem negativo
      const cancelamentosReembolsos = venda.cancelamentosReembolsos; // já vem negativo
      
      // Valores absolutos para exibição
      const comissaoMarketplace = Math.abs(tarifaVendaImpostos);
      const frete = Math.abs(tarifasEnvio);
      const taxasExtras = Math.abs(cancelamentosReembolsos);
      
      // Receita líquida = receita produtos + receita envio - comissão - frete - cancelamentos
      // Calculamos explicitamente para garantir que todas as taxas são consideradas
      const receitaLiquida = receitaProdutos + receitaEnvio + tarifaVendaImpostos + tarifasEnvio + cancelamentosReembolsos;
      
      // Usamos o Total (BRL) do CSV como validação, mas preferimos o cálculo explícito
      // O campo total do CSV deve bater com nosso cálculo

      // Custo total do produto
      const custoTotal = custoProduto * venda.unidades;

      // Lucro real = receita líquida (já descontando todas as taxas) - custo do produto
      const lucroReal = receitaLiquida - custoTotal;

      // Margem percentual baseada na receita líquida
      const margemPercentual = receitaLiquida > 0 
        ? (lucroReal / receitaLiquida) * 100 
        : 0;

      // Prejuízo quando lucro é negativo
      const temPrejuizo = lucroReal < 0;

      // Identifica problemas
      const problemas: string[] = [];
      if (temPrejuizo) {
        if (custoTotal > receitaLiquida) {
          problemas.push('Custo do produto muito alto');
        }
        if (comissaoMarketplace > receitaProdutos * 0.2) {
          problemas.push('Comissão do marketplace alta');
        }
        if (frete > receitaProdutos * 0.3) {
          problemas.push('Frete muito caro');
        }
        if (taxasExtras > 0) {
          problemas.push('Cancelamentos/reembolsos');
        }
      }

      // Valores unitários para exibição na análise
      const custoPorUnidade = custoProduto;
      const comissaoPorUnidade = venda.unidades > 0 ? comissaoMarketplace / venda.unidades : 0;
      const fretePorUnidade = venda.unidades > 0 ? frete / venda.unidades : 0;

      return {
        numeroVenda: venda.numeroVenda,
        dataVenda: venda.dataVenda,
        status: venda.status,
        sku: venda.sku,
        tituloAnuncio: venda.tituloAnuncio,
        variacao: venda.variacao,
        unidades: venda.unidades,
        precoVenda, // já é unitário
        custoProduto: custoTotal, // total para cálculos
        custoPorUnidade, // unitário para exibição
        comissaoMarketplace, // total
        comissaoPorUnidade, // unitário
        frete, // total
        fretePorUnidade, // unitário
        receitaEnvio,
        impostos: comissaoMarketplace * 0.3, // estimativa
        taxasExtras,
        totalRecebido: receitaLiquida, // receita líquida (já descontando todas as taxas)
        lucroReal,
        margemPercentual,
        temPrejuizo,
        problemas,
      };
    });

    // Agrupa por produto
    const produtosMap = new Map<string, LucroPorProduto>();

    vendasCalculadas.forEach((venda) => {
      const key = venda.tituloAnuncio;
      
      if (!produtosMap.has(key)) {
        produtosMap.set(key, {
          tituloAnuncio: venda.tituloAnuncio,
          sku: venda.sku,
          totalVendas: 0,
          totalUnidades: 0,
          receitaTotal: 0,
          custoTotal: 0,
          comissaoTotal: 0,
          freteTotal: 0,
          lucroTotal: 0,
          margemMedia: 0,
          temPrejuizo: false,
          vendas: [],
        });
      }

      const produto = produtosMap.get(key)!;
      produto.totalVendas++;
      produto.totalUnidades += venda.unidades;
      produto.receitaTotal += venda.totalRecebido;
      produto.custoTotal += venda.custoProduto;
      produto.comissaoTotal += venda.comissaoMarketplace;
      produto.freteTotal += venda.frete;
      produto.lucroTotal += venda.lucroReal;
      produto.vendas.push(venda);
    });

    // Calcula margem média por produto e define se tem prejuízo
    produtosMap.forEach((produto) => {
      produto.margemMedia = produto.receitaTotal > 0
        ? (produto.lucroTotal / produto.receitaTotal) * 100
        : 0;
      // Produto tem prejuízo se o lucro total for negativo
      produto.temPrejuizo = produto.lucroTotal < 0;
    });

    const lucroPorProduto = Array.from(produtosMap.values()).sort(
      (a, b) => b.lucroTotal - a.lucroTotal
    );

    // Resumo geral
    const totalVendas = vendasCalculadas.length;
    const totalReceita = vendasCalculadas.reduce((sum, v) => sum + v.totalRecebido, 0);
    const totalCusto = vendasCalculadas.reduce((sum, v) => sum + v.custoProduto, 0);
    const totalLucro = vendasCalculadas.reduce((sum, v) => sum + v.lucroReal, 0);
    const vendasComPrejuizo = vendasCalculadas.filter((v) => v.temPrejuizo).length;
    const produtosComPrejuizo = lucroPorProduto.filter((p) => p.temPrejuizo).length;

    return {
      vendasCalculadas,
      lucroPorProduto,
      resumo: {
        totalVendas,
        totalReceita,
        totalCusto,
        totalLucro,
        vendasComPrejuizo,
        produtosComPrejuizo,
      },
    };
  }, [vendasCSV, custosCSV]);

  return {
    vendasCalculadas,
    lucroPorProduto,
    resumo,
    loading,
  };
}

