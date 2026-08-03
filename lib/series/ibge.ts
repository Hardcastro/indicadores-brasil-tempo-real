import type { Ponto } from "./tipos";

const TIMEOUT_MS = 5000;

/** AAAAMM (IBGE) -> aaaa-mm-01 (ISO, primeiro dia do mês). Conversão trivial. */
function periodoParaIso(periodo: string): string {
  const ano = periodo.slice(0, 4);
  const mes = periodo.slice(4, 6);
  return `${ano}-${mes}-01`;
}

export function buildUrlIbge(agregado: number, variavel: number, periodos: string = "all"): string {
  // URLSearchParams codifica "[" e "]" sozinho — cobre a armadilha 4
  // (localidades=N1[all] precisa ir como %5Ball%5D).
  const params = new URLSearchParams({ localidades: "N1[all]" });
  return `https://servicodados.ibge.gov.br/api/v3/agregados/${agregado}/periodos/${periodos}/variaveis/${variavel}?${params.toString()}`;
}

type RespostaIbge = Array<{
  resultados: Array<{
    series: Array<{ serie: Record<string, string> }>;
  }>;
}>;

/** Valida a forma até a chave `serie` — o resto é aninhamento fixo do agregado. */
function respostaValida(json: unknown): json is RespostaIbge {
  if (!Array.isArray(json) || json.length === 0) return false;
  const primeiro = json[0] as Record<string, unknown> | undefined;
  const resultados = primeiro?.resultados;
  if (!Array.isArray(resultados) || resultados.length === 0) return false;
  const series = (resultados[0] as Record<string, unknown>)?.series;
  if (!Array.isArray(series) || series.length === 0) return false;
  const serie = (series[0] as Record<string, unknown>)?.serie;
  return typeof serie === "object" && serie !== null;
}

/**
 * Busca uma série de agregado do IBGE. Nunca lança — retorna null em
 * qualquer falha (rede, timeout, forma inesperada, agregado fora do ar
 * como o regional da armadilha 3).
 */
export async function buscarSerieIbge(
  agregado: number,
  variavel: number,
  periodos: string = "all"
): Promise<Ponto[] | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(buildUrlIbge(agregado, variavel, periodos), {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    const json: unknown = await res.json().catch(() => null);

    if (!respostaValida(json)) return null;

    const serie = json[0].resultados[0].series[0].serie;

    return Object.entries(serie)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([periodo, valorBruto]) => {
        // Armadilha 2: "..." (e qualquer outro não-numérico) é buraco —
        // null, nunca 0 e nunca o NaN que Number("...") produziria.
        const valor = Number(valorBruto);
        return {
          data: periodoParaIso(periodo),
          valor: Number.isFinite(valor) ? valor : null,
        };
      });
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
