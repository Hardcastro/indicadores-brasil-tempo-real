import { CATALOGO, ORDEM_SERIES } from "./catalogo";
import type { ItemCatalogo } from "./catalogo";
import type { Ponto, SerieId, SerieTemporal } from "./tipos";

import fallbackSelic from "./fallback/selic.json";
import fallbackCambioUsd from "./fallback/cambio-usd.json";
import fallbackIpcaMensal from "./fallback/ipca-mensal.json";
import fallbackIpca12m from "./fallback/ipca-12m.json";
import fallbackDesocupacao from "./fallback/desocupacao.json";

type Fallback = { atualizadoEm: string; pontos: Ponto[] };

const FALLBACK: Record<SerieId, Fallback> = {
  selic: fallbackSelic as Fallback,
  "cambio-usd": fallbackCambioUsd as Fallback,
  "ipca-mensal": fallbackIpcaMensal as Fallback,
  "ipca-12m": fallbackIpca12m as Fallback,
  desocupacao: fallbackDesocupacao as Fallback,
};

function montarSerie(item: ItemCatalogo, pontos: Ponto[], atualizadoEm: string, degradado: boolean): SerieTemporal {
  return {
    id: item.id,
    nome: item.nome,
    unidade: item.unidade,
    fonte: item.fonte,
    referencia: item.referencia,
    atualizadoEm,
    pontos,
    degradado,
  };
}

/**
 * Estágio 1: só o instantâneo versionado, sem chamada de rede nenhuma —
 * a tela inteira já funciona offline antes de qualquer adaptador de API
 * existir. Os adaptadores ao vivo entram no commit seguinte.
 */
export async function getSerie(id: SerieId): Promise<SerieTemporal> {
  const item = CATALOGO[id];
  const fallback = FALLBACK[id];
  return montarSerie(item, fallback.pontos, fallback.atualizadoEm, true);
}

export async function getTodasSeries(): Promise<SerieTemporal[]> {
  return Promise.all(ORDEM_SERIES.map((id) => getSerie(id)));
}

export type { SerieId, SerieTemporal, Ponto } from "./tipos";
export { CATALOGO, ORDEM_SERIES } from "./catalogo";
export type { ItemCatalogo } from "./catalogo";
