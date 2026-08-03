import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página não encontrada",
  description: "Essa página não existe ou mudou de endereço.",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-24 sm:px-6">
      <span className="text-body-sm font-medium uppercase tracking-wide text-text-secondary">Erro 404</span>
      <h1 className="text-h2 font-medium tracking-tight text-text-primary">
        Essa página não existe — ou mudou de endereço.
      </h1>
      <p className="text-lead text-text-muted">Os indicadores estão todos na página inicial.</p>
      <div className="mt-2 flex flex-wrap gap-4">
        <Link
          href="/"
          className="inline-flex items-center rounded-control bg-clay-primary px-4 py-2.5 text-body font-medium text-clay-primary-ink shadow-clay transition-[box-shadow,transform] active:shadow-clay-active active:translate-y-px"
        >
          Voltar para o início
        </Link>
        <Link
          href="/fontes"
          className="inline-flex items-center rounded-control border border-glass-solid-border bg-glass-solid-bg px-4 py-2.5 text-body font-medium text-text-secondary hover:text-text-primary"
        >
          Ver as fontes
        </Link>
      </div>
    </div>
  );
}
