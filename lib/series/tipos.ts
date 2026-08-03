/**
 * Ponto e SerieTemporal são o único vocabulário que a tela conhece. BCB e
 * IBGE entram por adaptadores (bcb.ts, ibge.ts) e saem sempre neste formato
 * — nenhum componente de tela sabe que existem dois formatos de origem.
 */
export type Ponto = {
  /** ISO 8601 (AAAA-MM-DD) */
  data: string;
  /** null = sem dado no período (buraco versionado, nunca 0 nem NaN) */
  valor: number | null;
};

export type SerieId = "selic" | "cambio-usd" | "ipca-mensal" | "ipca-12m" | "desocupacao";

export type SerieTemporal = {
  id: SerieId;
  /** "IPCA — variação mensal" */
  nome: string;
  unidade: "%" | "R$";
  fonte: "BCB" | "IBGE";
  /** "SGS 432" | "IBGE 1737/63" — aparece em /fontes */
  referencia: string;
  /** ISO 8601 — quando este resultado foi obtido (ou congelado, se degradado) */
  atualizadoEm: string;
  pontos: Ponto[];
  /** true = os pontos vieram do instantâneo versionado, não da API ao vivo */
  degradado: boolean;
};
