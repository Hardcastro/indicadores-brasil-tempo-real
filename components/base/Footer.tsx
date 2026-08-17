import { site } from "@/site.config";
import { ExternalLinkIcon } from "./Icons";

export function Footer() {
  return (
    <footer className="border-t border-glass-solid-border bg-glass-solid-bg">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-8 text-center text-body-sm text-text-muted sm:px-6">
        <p>
          Assinado{" "}
          <span className="font-medium text-text-secondary">AEther Data</span> — nenhum destes números foi digitado
          por alguém.
        </p>
        <a
          href={site.repo}
          target="_blank"
          rel="noopener noreferrer"
          // -my-2.5 py-2.5: alvo de toque de 41px sem mexer no layout — a
          // margem negativa devolve exatamente o que o padding tomou.
          className="-my-2.5 inline-flex items-center gap-1.5 py-2.5 font-medium text-text-secondary hover:text-text-primary"
        >
          Código no GitHub
          <ExternalLinkIcon size={14} />
        </a>
      </div>
    </footer>
  );
}
