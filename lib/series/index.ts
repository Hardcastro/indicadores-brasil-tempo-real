import { CATALOGO, ORDEM_SERIES } from "./catalogo";
import { buscarSerieBcb } from "./bcb";
import { buscarSerieIbge } from "./ibge";
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

async function buscarPontosAoVivo(item: ItemCatalogo): Promise<Ponto[] | null> {
  if (item.origem.tipo === "bcb") return buscarSerieBcb(item.origem.serieId);
  return buscarSerieIbge(item.origem.agregado, item.origem.variavel, "all");
}

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
 * A única coisa que a tela conhece. Nunca lança: fonte ao vivo falha (rede,
 * timeout, forma inesperada) e a série volta do instantâneo versionado,
 * marcada `degradado: true` — a tela decide como avisar, esta função só
 * decide o dado.
 */
export async function getSerie(id: SerieId): Promise<SerieTemporal> {
  const item = CATALOGO[id];
  const pontos = await buscarPontosAoVivo(item);

  if (pontos && pontos.length > 0) {
    return montarSerie(item, pontos, new Date().toISOString(), false);
  }

  const fallback = FALLBACK[id];
  return montarSerie(item, fallback.pontos, fallback.atualizadoEm, true);
}

/**
 * Busca as cinco séries em paralelo com Promise.allSettled — uma fonte
 * fora do ar não pode apagar as outras da tela.
 */
export async function getTodasSeries(): Promise<SerieTemporal[]> {
  const resultados = await Promise.allSettled(ORDEM_SERIES.map((id) => getSerie(id)));

  return resultados.map((resultado, i) => {
    if (resultado.status === "fulfilled") return resultado.value;

    const id = ORDEM_SERIES[i];
    const item = CATALOGO[id];
    const fallback = FALLBACK[id];
    return montarSerie(item, fallback.pontos, fallback.atualizadoEm, true);
  });
}

export type { SerieId, SerieTemporal, Ponto } from "./tipos";
export { CATALOGO, ORDEM_SERIES } from "./catalogo";
export type { ItemCatalogo } from "./catalogo";
