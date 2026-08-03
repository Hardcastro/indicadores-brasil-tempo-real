import Link from "next/link";
import { CATALOGO, ORDEM_SERIES } from "@/lib/series";
import type { SerieId } from "@/lib/series";

/**
 * Links de navegação, não estado de cliente — a troca de série é resolvida
 * no servidor (searchParams), e o botão voltar do navegador desfaz sozinho.
 */
export function SeletorSerie({ atual, de }: { atual: SerieId; de?: string }) {
  return (
    <nav aria-label="Escolher série do gráfico" className="flex flex-wrap gap-2">
      {ORDEM_SERIES.map((id) => {
        const item = CATALOGO[id];
        const ativo = id === atual;
        const params = new URLSearchParams({ serie: id });
        if (de) params.set("de", de);
        return (
          <Link
            key={id}
            href={`/?${params.toString()}`}
            aria-current={ativo ? "true" : undefined}
            className={`rounded-control px-3 py-2 text-body-sm font-medium transition-[box-shadow,transform] ${
              ativo
                ? "bg-clay-primary text-clay-primary-ink shadow-clay active:shadow-clay-active active:translate-y-px"
                : "border border-glass-solid-border bg-glass-solid-bg text-text-secondary hover:text-text-primary"
            }`}
          >
            {item.nomeCurto}
          </Link>
        );
      })}
    </nav>
  );
}
