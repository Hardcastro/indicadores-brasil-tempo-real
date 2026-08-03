import type { SerieTemporal } from "@/lib/series";
import { CATALOGO } from "@/lib/series";
import { formatDataCurta, formatMesAno, formatMoedaPT, formatPercentualPT } from "@/lib/format";
import { WarningIcon } from "./Icons";

function ultimoPontoValido(serie: SerieTemporal) {
  for (let i = serie.pontos.length - 1; i >= 0; i--) {
    if (serie.pontos[i].valor !== null) return serie.pontos[i];
  }
  return undefined;
}

/**
 * O número é o herói: maior escala tipográfica da página, rótulo e unidade
 * bem menores. Cartão sólido, não vidro — vidro precisa de algo atrás para
 * existir, e aqui atrás só tem o fundo do próprio cartão.
 */
export function CartaoIndicador({ serie }: { serie: SerieTemporal }) {
  const item = CATALOGO[serie.id];
  const ultimo = ultimoPontoValido(serie);
  const periodicidadeDiaria = item.periodicidade === "diária";

  return (
    <article className="flex flex-col gap-3 rounded-card border border-glass-solid-border bg-glass-solid-bg p-5 shadow-surface">
      <header className="flex items-start justify-between gap-2">
        <h2 className="text-body-sm font-medium text-text-muted">{item.nomeCurto}</h2>
        {serie.degradado && (
          <span
            className="inline-flex items-center gap-1 rounded-control bg-amber-100 px-2 py-1 text-body-sm font-medium text-amber-800"
            title={`Dado defasado — instantâneo de ${formatDataCurta(serie.atualizadoEm.slice(0, 10))}`}
          >
            <WarningIcon size={14} />
            defasado
          </span>
        )}
      </header>

      <p className="text-h2 font-medium tabular-nums text-text-primary">
        {ultimo ? (
          item.unidade === "R$" ? formatMoedaPT(ultimo.valor as number) : formatPercentualPT(ultimo.valor as number)
        ) : (
          "—"
        )}
      </p>

      <p className="text-body-sm text-text-muted">
        {ultimo
          ? periodicidadeDiaria
            ? formatDataCurta(ultimo.data)
            : formatMesAno(ultimo.data)
          : "sem dado"}
        <span className="mx-1.5">·</span>
        {item.referencia}
      </p>
    </article>
  );
}
