import type { Metadata } from "next";
import { CATALOGO, ORDEM_SERIES, getTodasSeries } from "@/lib/series";
import type { SerieId } from "@/lib/series";
import { CartaoIndicador } from "@/components/base/CartaoIndicador";
import { SeletorSerie } from "@/components/base/SeletorSerie";
import { GraficoSerie } from "@/components/base/GraficoSerie";
import { TabelaSerie } from "@/components/base/TabelaSerie";
import { WarningIcon } from "@/components/base/Icons";
import { formatDataHoraPT } from "@/lib/format";

type SearchParams = { serie?: string; de?: string };

function serieValida(valor: string | undefined): SerieId {
  if (valor && (ORDEM_SERIES as string[]).includes(valor)) return valor as SerieId;
  return "selic";
}

function anoValido(valor: string | undefined): string | undefined {
  if (!valor || !/^\d{4}$/.test(valor)) return undefined;
  const ano = Number(valor);
  if (ano < 1900 || ano > new Date().getFullYear() + 1) return undefined;
  return valor;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const serie = serieValida(params.serie);
  const item = CATALOGO[serie];
  const de = anoValido(params.de);

  const titulo = de ? `${item.nome} desde ${de}` : item.nome;
  return {
    title: titulo,
    description: `${item.nome} (${item.referencia}), direto do ${item.instituicao}. ${de ? `A partir de ${de}.` : ""}`,
  };
}

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const serieId = serieValida(params.serie);
  const de = anoValido(params.de);

  const todasSeries = await getTodasSeries();
  const serieAtual = todasSeries.find((s) => s.id === serieId) ?? todasSeries[0];
  const item = CATALOGO[serieAtual.id];

  const pontosFiltrados = de ? serieAtual.pontos.filter((p) => p.data.slice(0, 4) >= de) : serieAtual.pontos;

  const anosDisponiveis = Array.from(new Set(serieAtual.pontos.map((p) => p.data.slice(0, 4)))).sort(
    (a, b) => Number(a) - Number(b)
  );

  const algumaDegradada = todasSeries.some((s) => s.degradado);

  return (
    <div className="relative">
      <div className="ambient-glow" />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <header className="mb-8 flex flex-col gap-2">
          <h1 className="text-h2 font-medium text-text-primary">Os números do Brasil, atualizados sozinhos</h1>
          <p className="max-w-2xl text-lead text-text-muted">
            Selic, IPCA, câmbio e desemprego, direto do Banco Central e do IBGE. Sem digitação no meio.
          </p>
          <p className="text-body-sm font-medium text-text-secondary">
            Nenhum destes números foi digitado por alguém.
          </p>
        </header>

        {algumaDegradada && (
          <div className="mb-8 flex items-start gap-2 rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-body-sm text-amber-900">
            <WarningIcon size={18} className="mt-0.5 shrink-0" />
            <p>
              Uma ou mais fontes não responderam agora — os cartões marcados &ldquo;defasado&rdquo; mostram o último
              instantâneo salvo, com a data, em vez de fingir que é dado novo.
            </p>
          </div>
        )}

        <section aria-label="Indicadores de hoje" className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ORDEM_SERIES.map((id) => {
            const serie = todasSeries.find((s) => s.id === id);
            return serie ? <CartaoIndicador key={id} serie={serie} /> : null;
          })}
        </section>

        <section aria-label="Histórico" className="mb-12 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-h3 font-medium text-text-primary">Histórico</h2>
            <p className="text-body-sm text-text-muted">
              Atualizado em {formatDataHoraPT(serieAtual.atualizadoEm)}
            </p>
          </div>

          <SeletorSerie atual={serieAtual.id} de={de} />

          <div className="rounded-panel border border-glass-solid-border bg-glass-solid-bg p-4 sm:p-6">
            <GraficoSerie
              pontos={pontosFiltrados}
              nome={item.nome}
              unidade={item.unidade}
              periodicidadeDiaria={item.periodicidade === "diária"}
              tetoExibicao={item.tetoExibicaoGrafico}
            />
          </div>
        </section>

        <section aria-label="Todos os pontos" className="flex flex-col gap-4">
          <h2 className="text-h3 font-medium text-text-primary">Todos os pontos — {item.nome}</h2>
          <TabelaSerie
            pontos={pontosFiltrados}
            unidade={item.unidade}
            periodicidadeDiaria={item.periodicidade === "diária"}
            anosDisponiveis={anosDisponiveis}
            deAtual={de}
            serieAtual={serieAtual.id}
          />
        </section>
      </div>
    </div>
  );
}
