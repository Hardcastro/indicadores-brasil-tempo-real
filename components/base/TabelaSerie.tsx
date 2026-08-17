import type { Ponto, SerieId } from "@/lib/series";
import { formatDataCurta, formatMesAno, formatNumeroPT, formatPercentualPT } from "@/lib/format";

/**
 * Variação em relação ao ponto anterior, com sinal explícito. Usa o sinal de
 * menos tipográfico (−, U+2212) e não o hífen: numa coluna com tabular-nums o
 * hífen fica curto demais e o olho perde o sinal. Zero sai sem sinal — dizer
 * "+0,00" seria afirmar um movimento que não houve.
 */
function formatVariacao(delta: number, unidade: "%" | "R$"): string {
  const casas = unidade === "R$" ? 4 : 2;
  const sufixo = unidade === "R$" ? "" : " p.p.";
  const corpo = formatNumeroPT(Math.abs(delta), casas);
  if (Math.abs(delta) < Math.pow(10, -casas) / 2) return `${formatNumeroPT(0, casas)}${sufixo}`;
  return `${delta > 0 ? "+" : "−"}${corpo}${sufixo}`;
}

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
            // h-10 aqui e no botão: com items-end e alturas diferentes (o
            // select vinha 42px e o botão 36px) os dois encostavam na mesma
            // linha de base e ficavam visivelmente tortos.
            className="h-10 rounded-control border border-glass-solid-border bg-glass-solid-bg px-3 text-body text-text-primary"
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
          className="inline-flex h-10 items-center rounded-control bg-clay-primary px-4 text-body-sm font-medium text-clay-primary-ink shadow-clay transition-[box-shadow,transform] active:shadow-clay-active active:translate-y-px"
        >
          Filtrar
        </button>
      </form>

      {/*
        Três colunas, não duas. Com Data e Valor só, a coluna da data ficava
        com 640px para caber uma data de 15 caracteres e o resto era branco.
        A variação não é dado novo — é a diferença entre este ponto e o
        anterior da mesma série, que é justamente o que alguém quer saber ao
        percorrer uma série temporal. Números à direita, porque coluna de
        número se lê pela unidade alinhada, não pela primeira letra.
      */}
      <div className="max-h-[28rem] overflow-y-auto rounded-card border border-glass-solid-border">
        <table className="w-full text-left text-body-sm">
          <caption className="sr-only">
            {linhas.length} pontos da série, do mais recente para o mais antigo, com a variação em relação ao
            ponto anterior.
          </caption>
          <thead className="sticky top-0 bg-glass-solid-bg text-text-muted">
            <tr>
              <th scope="col" className="px-4 py-2 font-medium">
                {periodicidadeDiaria ? "Data" : "Mês"}
              </th>
              <th scope="col" className="px-4 py-2 text-right font-medium">
                Valor
              </th>
              <th scope="col" className="w-[26%] px-4 py-2 text-right font-medium">
                Variação
              </th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((p, i) => {
              // linhas está do mais recente para o mais antigo, então o ponto
              // anterior no tempo é o SEGUINTE no array.
              const anterior = linhas[i + 1];
              const delta =
                p.valor !== null && anterior && anterior.valor !== null ? p.valor - anterior.valor : null;
              const casasDaUnidade = unidade === "R$" ? 4 : 2;
              const semVariacao = delta === null || Math.abs(delta) < Math.pow(10, -casasDaUnidade) / 2;
              return (
                <tr key={p.data} className="linha-tabela">
                  <td className="px-4 py-2 tabular-nums text-text-primary">
                    {periodicidadeDiaria ? formatDataCurta(p.data) : formatMesAno(p.data)}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-text-primary">
                    {/* R$ com QUATRO casas nesta tabela, não duas. O PTAX é
                        publicado com quatro, o gráfico já mostrava quatro no
                        hover, e a coluna de variação também — com o valor em
                        duas casas a conta não fechava na tela: 5,19 mais
                        0,0377 dava 5,23 e a linha de baixo dizia 5,22. O
                        cartão lá em cima segue com duas, que é manchete. */}
                    {p.valor === null ? (
                      <span className="text-text-muted">sem dado</span>
                    ) : unidade === "R$" ? (
                      `R$ ${formatNumeroPT(p.valor, 4)}`
                    ) : (
                      formatPercentualPT(p.valor)
                    )}
                  </td>
                  {/* Sem variação sai como célula vazia, não como "0,00 p.p.".
                      A Selic fica meses no mesmo valor: repetir o zero em 700
                      linhas transforma a coluna em ruído e some com os dias em
                      que o número de fato mexeu, que é o que se procura ao
                      percorrer a série. O "—" fica reservado para o caso
                      diferente: não existe ponto anterior para comparar. */}
                  {/* `relative` não é decoração: o `sr-only` abaixo é
                      position:absolute, e sem um bloco de contenção dentro da
                      célula ele resolve contra o <body>. Como a tabela vive
                      num contêiner que rola, o span de uma linha lá embaixo
                      ia parar a 28.000px do topo do body e esticava a PÁGINA
                      de 2.175 para 29.128px. Medido, não deduzido. */}
                  <td
                    className={`relative px-4 py-2 text-right tabular-nums ${
                      semVariacao ? "text-text-muted" : "font-medium text-text-primary"
                    }`}
                  >
                    {delta === null ? (
                      "—"
                    ) : semVariacao ? (
                      <span className="sr-only">sem variação</span>
                    ) : (
                      formatVariacao(delta, unidade)
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
