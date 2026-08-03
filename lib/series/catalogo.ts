import type { SerieId } from "./tipos";

type OrigemBCB = { tipo: "bcb"; serieId: number };
type OrigemIBGE = { tipo: "ibge"; agregado: number; variavel: number };

export type ItemCatalogo = {
  id: SerieId;
  nome: string;
  nomeCurto: string;
  unidade: "%" | "R$";
  fonte: "BCB" | "IBGE";
  /** Aparece em /fontes: "SGS 432" | "IBGE 1737/63" */
  referencia: string;
  instituicao: string;
  periodicidade: "diária" | "mensal";
  /** Quando a fonte costuma publicar dado novo, em prosa curta */
  atualiza: string;
  origem: OrigemBCB | OrigemIBGE;
  /**
   * Teto de exibição do gráfico, só para séries com outlier de hiperinflação
   * que esmagaria os dados recentes num eixo linear (ver GraficoSerie.tsx).
   * Undefined = eixo cobre o range real inteiro, sem truncar nada.
   */
  tetoExibicaoGrafico?: number;
};

/**
 * O registro das cinco séries. Cada uma aponta para uma única origem —
 * bcb.ts e ibge.ts leem daqui os parâmetros da chamada, e /fontes lê daqui
 * o texto que explica a fonte ao visitante.
 */
export const CATALOGO: Record<SerieId, ItemCatalogo> = {
  selic: {
    id: "selic",
    nome: "Selic — meta definida pelo Copom",
    nomeCurto: "Selic",
    unidade: "%",
    fonte: "BCB",
    referencia: "SGS 432",
    instituicao: "Banco Central do Brasil",
    periodicidade: "diária",
    atualiza: "no dia útil seguinte a cada reunião do Copom, e se repete nos dias sem reunião",
    origem: { tipo: "bcb", serieId: 432 },
  },
  "cambio-usd": {
    id: "cambio-usd",
    nome: "Câmbio — dólar americano, PTAX venda",
    nomeCurto: "Câmbio (USD)",
    unidade: "R$",
    fonte: "BCB",
    referencia: "SGS 1",
    instituicao: "Banco Central do Brasil",
    periodicidade: "diária",
    atualiza: "todo dia útil, por volta das 13h",
    origem: { tipo: "bcb", serieId: 1 },
  },
  "ipca-mensal": {
    id: "ipca-mensal",
    nome: "IPCA — variação mensal",
    nomeCurto: "IPCA (mês)",
    unidade: "%",
    fonte: "IBGE",
    referencia: "IBGE 1737/63",
    instituicao: "Instituto Brasileiro de Geografia e Estatística",
    periodicidade: "mensal",
    atualiza: "em torno do dia 10 do mês seguinte ao de referência",
    origem: { tipo: "ibge", agregado: 1737, variavel: 63 },
    tetoExibicaoGrafico: 15,
  },
  "ipca-12m": {
    id: "ipca-12m",
    nome: "IPCA — acumulado em 12 meses",
    nomeCurto: "IPCA (12m)",
    unidade: "%",
    fonte: "IBGE",
    referencia: "IBGE 1737/2265",
    instituicao: "Instituto Brasileiro de Geografia e Estatística",
    periodicidade: "mensal",
    atualiza: "em torno do dia 10 do mês seguinte ao de referência",
    origem: { tipo: "ibge", agregado: 1737, variavel: 2265 },
    tetoExibicaoGrafico: 30,
  },
  desocupacao: {
    id: "desocupacao",
    nome: "Taxa de desocupação — PNAD Contínua",
    nomeCurto: "Desocupação",
    unidade: "%",
    fonte: "IBGE",
    referencia: "IBGE 6381/4099",
    instituicao: "Instituto Brasileiro de Geografia e Estatística",
    periodicidade: "mensal",
    atualiza: "em torno do final do mês seguinte ao trimestre móvel de referência",
    origem: { tipo: "ibge", agregado: 6381, variavel: 4099 },
  },
};

export const ORDEM_SERIES: SerieId[] = [
  "selic",
  "cambio-usd",
  "ipca-mensal",
  "ipca-12m",
  "desocupacao",
];
