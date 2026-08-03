import type { Ponto, SerieId } from "@/lib/series";
import { formatDataCurta, formatMesAno, formatMoedaPT, formatPercentualPT } from "@/lib/format";

type Props = {
  pontos: Ponto[];
  unidade: "%" | "R$";
  periodicidadeDiaria: boolean;
  anosDisponiveis: string[];
  deAtual?: string;
  serieAtual: SerieId;
};

/**
 * Filtro por ano num <form method="GET"> — a resposta é resolvida no
 * servidor via searchParams, funciona sem nenhum JavaScript no navegador,
 * e o botão voltar desfaz a troca sozinho.
 */
export function TabelaSerie({ pontos, unidade, periodicidadeDiaria, anosDisponiveis, deAtual, serieAtual }: Props) {
  const linhas = [...pontos].reverse();

  return (
    <div className="flex flex-col gap-4">
      <form action="/" method="GET" className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="serie" value={serieAtual} />
        <label className="flex flex-col gap-1 text-body-sm text-text-muted">
          Mostrar a partir de
          <select
            name="de"
            defaultValue={deAtual ?? ""}
            className="rounded-control border border-glass-solid-border bg-glass-solid-bg px-3 py-2 text-body text-text-primary"
          >
            <option value="">Início da série</option>
            {anosDisponiveis.map((ano) => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-control bg-clay-primary px-4 py-2 text-body-sm font-medium text-clay-primary-ink shadow-clay transition-[box-shadow,transform] active:shadow-clay-active active:translate-y-px"
        >
          Filtrar
        </button>
      </form>

      <div className="max-h-[28rem] overflow-y-auto rounded-card border border-glass-solid-border">
        <table className="w-full text-left text-body-sm">
          <thead className="sticky top-0 bg-glass-solid-bg text-text-muted">
            <tr>
              <th scope="col" className="px-4 py-2 font-medium">
                {periodicidadeDiaria ? "Data" : "Mês"}
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Valor
              </th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((p) => (
              <tr key={p.data} className="linha-tabela">
                <td className="px-4 py-2 tabular-nums text-text-primary">
                  {periodicidadeDiaria ? formatDataCurta(p.data) : formatMesAno(p.data)}
                </td>
                <td className="px-4 py-2 tabular-nums text-text-primary">
                  {p.valor === null ? (
                    <span className="text-text-muted">sem dado</span>
                  ) : unidade === "R$" ? (
                    formatMoedaPT(p.valor)
                  ) : (
                    formatPercentualPT(p.valor)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
