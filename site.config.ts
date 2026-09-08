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

  /**
   * Peça de portfólio, e a única das quatro que não é negócio inventado: os
   * números são reais e vêm da fonte. Por isso a ressalva aqui só afirma a
   * autoria — não há ficção a declarar.
   *
   * A `competencia` é a linha do manifesto do hub, com uma correção: lá ela
   * diz "fica em pé quando uma cai", que é expressão idiomática, e o registro
   * escolhido para texto assinado pede descrição direta. Corrigir também o
   * manifesto é uma linha, e está anotado.
   */
  portfolio: {
    sufixo: "peça de portfólio",
    ressalva: "Peça de portfólio de Gabriel Barreto.",
    competencia:
      "Duas fontes públicas, de formatos incompatíveis, atrás de uma interface só — e as demais continuam quando uma não responde.",
    hub: "https://aether-data-steel.vercel.app",
  },
} as const;
