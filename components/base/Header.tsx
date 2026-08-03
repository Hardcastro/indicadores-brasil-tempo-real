"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/site.config";

/**
 * Único elemento com vidro da peça — fica sobre o conteúdo rolando, então
 * tem algo atrás para borrar. Dois links só, sem menu móvel: não há o que
 * esconder.
 */
export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-glass-border bg-glass-bg backdrop-blur-glass">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="text-body font-medium text-text-primary">
          {site.name}
        </Link>

        <nav aria-label="Principal" className="flex items-center gap-1">
          {site.nav.map((item) => {
            const isActive = item.href === pathname;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-control px-3 py-2 text-body-sm font-medium transition-colors ${
                  isActive
                    ? "text-text-primary underline decoration-clay-primary decoration-2 underline-offset-4"
                    : "text-text-muted hover:text-text-primary"
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
