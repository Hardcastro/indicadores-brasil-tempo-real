// Endereço público numa constante só. VERCEL_PROJECT_PRODUCTION_URL é o
// domínio de produção estável do projeto; VERCEL_URL muda a cada deploy
// (preview inclusive) e não deve alimentar metadataBase nunca.
const producaoUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const site = {
  name: "Indicadores Brasil",
  shortName: "Indicadores Brasil",
  tagline: "Os números do Brasil, atualizados sozinhos",
  descricao:
    "Selic, IPCA, câmbio e desemprego, direto do Banco Central e do IBGE. Sem digitação no meio.",
  nav: [
    { href: "/", label: "Indicadores" },
    { href: "/fontes", label: "Fontes" },
  ],
  url: producaoUrl,
  repo: "https://github.com/Hardcastro/indicadores-brasil-tempo-real",
  locale: "pt_BR",
} as const;
