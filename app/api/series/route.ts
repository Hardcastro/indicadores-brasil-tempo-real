import { getTodasSeries, ORDEM_SERIES, CATALOGO } from "@/lib/series";
import type { Ponto, SerieTemporal } from "@/lib/series";

/**
 * O endpoint que a N4 (`/monitor`, no hub) consome — brief-14.
 *
 * A regra número um deste arquivo: **nenhuma segunda lógica de cálculo.**
 * Ele chama `getTodasSeries()`, que é exatamente o que a página desta S4
 * chama, e reformata. Se um dia a série mudar de origem, de fallback ou de
 * forma, a página e o monitor mudam juntos porque leem a mesma função.
 *
 * Dois formatos, escolhidos pelo consumidor:
 *
 *   GET /api/series                → resumo: último e anterior de cada série
 *   GET /api/series?historico=1    → resumo + os pontos dos 2 anos
 *
 * O resumo é o que o cron diário lê — ele só precisa saber o valor de hoje e
 * o de ontem para decidir se a regra atravessou. O histórico é o que o
 * contrafactual lê: "essa regra teria disparado quantas vezes em 2 anos".
 * Separar os dois evita mandar 3.600 pontos numa chamada que precisa de dez
 * números.
 *
 * `degradado: true` viaja junto e não é detalhe: é assim que o registro de
 * execuções do monitor consegue escrever "IBGE falhou" em vez de fingir que
 * a rodada foi limpa. Uma fonte no fallback não impede a avaliação — ela
 * muda o que o registro diz sobre aquela rodada.
 */

export const revalidate = 900;

type PontoResumo = { data: string; valor: number };

type SerieResumo = {
  id: string;
  nome: string;
  unidade: "%" | "R$";
  fonte: "BCB" | "IBGE";
  referencia: string;
  /** "diária" | "mensal" — decide a base do "variar mais de" */
  periodicidade: string;
  atualizadoEm: string;
  /** true = veio do instantâneo versionado, não da API ao vivo */
  degradado: boolean;
  /** A publicação mais recente com valor. null = série sem nenhum ponto útil */
  ultimo: PontoResumo | null;
  /** A publicação imediatamente anterior — a base da condição "variar mais de" */
  anterior: PontoResumo | null;
  /** Só com ?historico=1. Pontos sem valor já saem de fora */
  historico?: PontoResumo[];
};

/**
 * Buracos versionados viajam como `valor: null` e não podem virar 0 nem NaN
 * numa comparação — uma regra "cair abaixo de 5" dispararia contra um buraco.
 * Some daqui, uma vez, em vez de ser lembrado em cada lugar que compara.
 */
function apenasComValor(pontos: Ponto[]): PontoResumo[] {
  const limpos: PontoResumo[] = [];
  for (const p of pontos) {
    if (typeof p.valor === "number" && Number.isFinite(p.valor)) {
      limpos.push({ data: p.data, valor: p.valor });
    }
  }
  return limpos.sort((a, b) => a.data.localeCompare(b.data));
}

function resumir(serie: SerieTemporal, periodicidade: string, comHistorico: boolean): SerieResumo {
  const pontos = apenasComValor(serie.pontos);
  const ultimo = pontos.length > 0 ? pontos[pontos.length - 1] : null;
  const anterior = pontos.length > 1 ? pontos[pontos.length - 2] : null;

  const resumo: SerieResumo = {
    id: serie.id,
    nome: serie.nome,
    unidade: serie.unidade,
    fonte: serie.fonte,
    referencia: serie.referencia,
    periodicidade,
    atualizadoEm: serie.atualizadoEm,
    degradado: serie.degradado,
    ultimo,
    anterior,
  };

  if (comHistorico) resumo.historico = pontos;
  return resumo;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const comHistorico = searchParams.get("historico") === "1";

  const series = await getTodasSeries();

  const porId = new Map(series.map((s) => [s.id, s]));
  const lidas: SerieResumo[] = [];

  for (const id of ORDEM_SERIES) {
    const serie = porId.get(id);
    if (!serie) continue;
    lidas.push(resumir(serie, CATALOGO[id].periodicidade, comHistorico));
  }

  const corpo = {
    /**
     * Quantas séries responderam ao vivo e quantas vieram do instantâneo. É o
     * que o registro de execuções do monitor escreve como "5 indicadores lidos"
     * ou "4 indicadores lidos · IBGE falhou".
     */
    lidasAoVivo: lidas.filter((s) => !s.degradado).length,
    total: lidas.length,
    consultadoEm: new Date().toISOString(),
    series: lidas,
  };

  return Response.json(corpo, {
    headers: {
      // O hub é outra origem (outro projeto na Vercel). A leitura é pública e
      // idêntica à da página — não há nada aqui que já não esteja no HTML.
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
    },
  });
}
