import type { Metadata } from "next";
import { CATALOGO, ORDEM_SERIES } from "@/lib/series";
import { site } from "@/site.config";

export const metadata: Metadata = {
  title: "Fontes",
  description: "De onde vem cada número, com que frequência atualiza, e o que a página faz quando a fonte cai.",
};

const COMPORTAMENTO_QUEDA: Record<string, string> = {
  BCB: "Se o Banco Central não responder em 5 segundos, ou devolver algo que não seja a lista de pontos esperada — o que também acontece quando a janela de consulta passa de 10 anos numa série diária —, a página volta para o último instantâneo salvo neste repositório e avisa a data dele. Nunca mostra número velho como se fosse novo.",
  IBGE: "Se o IBGE não responder em 5 segundos, ou devolver um formato diferente do esperado, a página volta para o último instantâneo salvo neste repositório e avisa a data dele. Pontos sem valor publicado (o IBGE marca isso com \"...\") viram um buraco na série, nunca um zero.",
};

export default function Fontes() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-h2 font-medium text-text-primary">De onde vêm os números</h1>
        <p className="max-w-2xl text-lead text-text-muted">
          Duas fontes públicas, sem chave de acesso. Cada série tem uma referência exata — dá para conferir com um{" "}
          <code className="rounded bg-glass-solid-border px-1 py-0.5 text-body-sm">curl</code> num terminal qualquer.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {ORDEM_SERIES.map((id) => {
          const item = CATALOGO[id];
          return (
            <article
              key={id}
              className="flex flex-col gap-3 rounded-card border border-glass-solid-border bg-glass-solid-bg p-5 shadow-surface"
            >
              <div>
                <h2 className="text-lead font-medium text-text-primary">{item.nome}</h2>
                <p className="text-body-sm text-text-muted">{item.instituicao}</p>
              </div>

              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-body-sm">
                <dt className="text-text-muted">Referência</dt>
                <dd className="font-medium text-text-primary">{item.referencia}</dd>
                <dt className="text-text-muted">Periodicidade</dt>
                <dd className="text-text-primary">{item.periodicidade}</dd>
                <dt className="text-text-muted">Atualiza</dt>
                <dd className="text-text-primary">{item.atualiza}</dd>
              </dl>

              <p className="text-body-sm text-text-muted">{COMPORTAMENTO_QUEDA[item.fonte]}</p>
            </article>
          );
        })}
      </div>

      <p className="mt-10 text-body-sm text-text-muted">
        Código-fonte completo, incluindo os adaptadores e os instantâneos de fallback, no{" "}
        <a href={site.repo} target="_blank" rel="noopener noreferrer" className="font-medium text-text-secondary hover:text-text-primary">
          repositório no GitHub
        </a>
        .
      </p>
    </div>
  );
}
