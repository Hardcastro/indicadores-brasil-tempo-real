import type { Ponto } from "./tipos";

const TIMEOUT_MS = 5000;

/**
 * Séries diárias do SGS aceitam no máximo 10 anos de janela — pedir mais
 * devolve um objeto de erro em vez de um array (armadilha 1), às vezes com
 * HTTP 200, às vezes com 406. 2 anos fica bem abaixo desse teto — folga de
 * sobra — e mantém a tabela de pontos diários (730 linhas, não 2900) leve
 * o bastante para não pesar o DOM no Lighthouse mobile.
 */
const ANOS_HISTORICO = 2;

function formatarDataBr(d: Date): string {
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${d.getFullYear()}`;
}

/** dd/mm/aaaa (BCB) -> aaaa-mm-dd (ISO). Conversão trivial, sem biblioteca de data. */
function dataBrParaIso(dataBr: string): string {
  const [dia, mes, ano] = dataBr.split("/");
  return `${ano}-${mes}-${dia}`;
}

export function buildUrlBcb(serieId: number, anos: number = ANOS_HISTORICO): string {
  const hoje = new Date();
  const inicio = new Date(hoje);
  inicio.setFullYear(inicio.getFullYear() - anos);

  const params = new URLSearchParams({
    formato: "json",
    dataInicial: formatarDataBr(inicio),
    dataFinal: formatarDataBr(hoje),
  });
  return `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serieId}/dados?${params.toString()}`;
}

type PontoBrutoBcb = { data: string; valor: string };

/**
 * Valida a FORMA da resposta, nunca o status HTTP — o BCB pode devolver o
 * objeto de erro da armadilha 1 com 200 ou com 406 dependendo do caminho.
 * Qualquer coisa que não seja um array de {data, valor} é fonte fora do ar.
 */
function respostaValida(json: unknown): json is PontoBrutoBcb[] {
  return (
    Array.isArray(json) &&
    json.every(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        typeof (item as Record<string, unknown>).data === "string" &&
        typeof (item as Record<string, unknown>).valor === "string"
    )
  );
}

/** Busca uma série do BCB SGS. Nunca lança — retorna null em qualquer falha. */
export async function buscarSerieBcb(serieId: number): Promise<Ponto[] | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(buildUrlBcb(serieId), {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    const json: unknown = await res.json().catch(() => null);

    if (!respostaValida(json)) return null;

    return json.map((ponto) => ({
      data: dataBrParaIso(ponto.data),
      valor: Number(ponto.valor),
    }));
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
