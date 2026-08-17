"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { site } from "@/site.config";

type IndicatorRect = { left: number; width: number };

/**
 * Único elemento com vidro da peça — fica sobre o conteúdo rolando, então
 * tem algo atrás para borrar. Dois links só, sem menu móvel: não há o que
 * esconder — isso não muda aqui, só o link ativo ganha um sublinhado que
 * desliza em vez de trocar sem transição (mesma técnica da S1/S2/S3).
 */
export function Header() {
  const pathname = usePathname();
  const [indicator, setIndicator] = useState<IndicatorRect | null>(null);
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const activeIndex = site.nav.findIndex((item) => item.href === pathname);

  useLayoutEffect(() => {
    const medir = () => {
      const el = linkRefs.current[activeIndex];
      if (!el) {
        setIndicator(null);
        return;
      }
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    };
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [activeIndex, pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-glass-border vidro-barra">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="-my-2 inline-flex min-h-10 items-center py-2 text-body font-medium text-text-primary"
        >
          {site.name}
        </Link>

        <nav aria-label="Principal" className="relative flex items-center gap-1">
          {indicator ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-clay-primary transition-[left,width] duration-300 ease-out"
              style={{ left: indicator.left, width: indicator.width }}
            />
          ) : null}
          {site.nav.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <Link
                key={item.href}
                ref={(el) => {
                  linkRefs.current[index] = el;
                }}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-control px-3 py-2 text-body-sm font-medium transition-colors ${
                  isActive ? "text-text-primary" : "text-text-muted hover:text-text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
