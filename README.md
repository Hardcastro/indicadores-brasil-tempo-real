# Indicadores Brasil — tempo real

**Resumo em português:** painel de indicadores econômicos do Brasil (Selic, câmbio, IPCA e desemprego) que lê dado ao vivo direto do Banco Central e do IBGE — duas APIs públicas, sem chave, de formatos incompatíveis, atrás de uma única interface. Quando uma fonte cai, a página não finge que está tudo bem: mostra o último instantâneo salvo, com a data, em vez de um número velho disfarçado de novo. Nenhum destes números foi digitado por alguém.

Live demo: _adicionar a URL do deploy na Vercel aqui após o primeiro deploy_

## Stack

- Next.js 15 (App Router), TypeScript strict
- Tailwind CSS v4, configuração CSS-first (`@theme` em `app/globals.css`, sem `tailwind.config.js`)
- Inter via `next/font/google`
- Zero bibliotecas de gráfico e zero bibliotecas de data — o gráfico é SVG escrito à mão (`components/base/GraficoSerie.tsx`) e as duas conversões de data são aritmética trivial (`lib/series/bcb.ts`, `lib/series/ibge.ts`)
- Sem CMS, sem banco, sem variável de ambiente — as duas fontes são públicas e o fallback está versionado no repositório
- `backdrop-filter`: usado **uma única vez** em toda a peça, no cabeçalho grudado (`components/base/Header.tsx`) — o único elemento com algo rolando atrás dele o tempo todo. Zero em qualquer outro lugar, bem abaixo do teto de três por viewport.

## Como rodar

```bash
git clone https://github.com/Hardcastro/indicadores-brasil-tempo-real.git
cd indicadores-brasil-tempo-real
npm install
npm run dev
```

Não precisa de `.env`. As duas APIs são abertas e o build nunca depende de rede — se elas estiverem fora do ar, a página usa o instantâneo salvo em `lib/series/fallback/*.json`.

## As duas fontes

### Banco Central — SGS

```bash
curl "https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/3?formato=json"
# [{"data":"03/08/2026","valor":"14.25"}, ...]
```

Selic = série `432`, câmbio USD/BRL (PTAX venda) = série `1`. Sem chave, `Access-Control-Allow-Origin: *`.

### IBGE — Agregados v3

```bash
curl "https://servicodados.ibge.gov.br/api/v3/agregados/1737/periodos/-3/variaveis/63?localidades=N1[all]"
# [{"id":"63","variavel":"IPCA - Variação mensal", ..., "serie":{"202605":"0.58","202606":"0.16"}}]
```

IPCA mensal = agregado `1737`/variável `63`, IPCA 12 meses = `1737`/`2265`, desocupação = `6381`/`4099`.

## Como a normalização funciona

`lib/series/index.ts` é a única coisa que a tela conhece — um tipo (`SerieTemporal`, `lib/series/tipos.ts`) e duas funções (`getSerie`, `getTodasSeries`). Nenhum componente sabe que existem dois formatos de origem:

```
lib/series/tipos.ts       Ponto e SerieTemporal — o vocabulário único
lib/series/catalogo.ts    registro das 5 séries: id -> fonte + parâmetros
lib/series/bcb.ts         adaptador BCB (array plano, data dd/mm/aaaa)
lib/series/ibge.ts        adaptador IBGE (objeto aninhado, período AAAAMM)
lib/series/index.ts       getSerie(id) / getTodasSeries() — junta tudo
lib/series/fallback/*.json  instantâneo versionado de cada série
```

Cada adaptador (`buscarSerieBcb`, `buscarSerieIbge`) **nunca lança** — qualquer falha (rede, timeout, forma inesperada) vira `null`, e `getSerie()` troca por `FALLBACK[id]`, marcando `degradado: true`. `getTodasSeries()` busca as cinco em paralelo com `Promise.allSettled`: uma fonte fora do ar nunca apaga as outras da tela.

## As cinco armadilhas

**1 — o BCB pode recusar a janela de consulta sem um erro HTTP claro.** Séries diárias do SGS aceitam no máximo 10 anos. Pedir mais devolve um **array vazio de formato errado** — um objeto `{"error": "..."}` em vez da lista de pontos —, e o status HTTP varia (200 em alguns caminhos, 406 em outros, confirmado testando ao vivo). Por isso `bcb.ts` **nunca confia no status**: `respostaValida()` verifica se o corpo é de fato um array de `{data, valor}`; qualquer outra coisa é tratada como fonte fora do ar. Em produção a janela pedida é de 2 anos — bem abaixo do teto de 10 —, então a armadilha não deveria disparar sozinha; a validação existe para o dia em que alguém mudar essa constante sem lembrar do teto.

**2 — o IBGE marca ponto sem dado com a string `"..."`, não com `null`.** O primeiro ponto do IPCA mensal (dezembro de 1979) é literalmente `"197912": "..."`. `Number("...")` é `NaN`, e um `NaN` dentro de um atributo `d` de `<path>` SVG **apaga o traço inteiro**, sem erro no console. `ibge.ts` testa `Number.isFinite()` em cada valor e troca qualquer coisa não numérica por `null` — nunca `0`, nunca `NaN`. `GraficoSerie.tsx` trata `null` como buraco: fecha o trecho de `path` ali e abre um novo depois, em vez de ligar os dois lados.

**3 — o recorte regional do IBGE responde 500.** `localidades=N2[all]` e `N3[all]` no agregado da desocupação (`6381`) devolvem `{"statusCode":500}`. Não existe correção para isso do lado do cliente — a peça simplesmente não oferece recorte regional (ver "Fora deste projeto" no brief). `catalogo.ts` só registra `localidades=N1[all]` (Brasil).

**4 — os colchetes de `localidades` precisam ir codificados.** `URLSearchParams` resolve isso sozinho (`N1[all]` vira `N1%5Ball%5D` na serialização), então `ibge.ts` nunca monta a query string na mão.

**5 — as duas APIs mandam número com ponto; a tela é brasileira e usa vírgula.** `bcb.ts` e `ibge.ts` convertem para `number` no adaptador. `lib/format.ts` só formata em `pt-BR` (`Intl.NumberFormat`) na borda da renderização — nenhum componente recebe ou repassa uma string já formatada.

### Um sexto comportamento, não documentado no brief original

Gerando o fallback (`scripts/gerar-fallback.mjs`) contra a API real do BCB, uma rajada de chamadas em sequência ocasionalmente recebeu de volta uma página HTML de erro (`"Requisição inválida!"`) com **HTTP 200** — não é a armadilha 1 (o corpo não é o objeto `{"error": ...}` documentado ali, é HTML puro), e sumiu sozinha ao repetir a chamada alguns segundos depois. Tudo indica um limite de taxa do WAF do Banco Central sob chamadas repetidas rápidas, não um bug de código. `respostaValida()` já cobre esse caso de graça (HTML não é um array, vira fonte fora do ar do mesmo jeito), mas o script de geração de fallback ganhou 4 retentativas com backoff porque ali o objetivo é sempre conseguir o dado real, não apenas degradar direito.

## Escala do gráfico — a decisão sobre o IPCA mensal

O IPCA mensal completo (1979–2026, 559 pontos) varia de **-0,68%** a **82,39%** (março de 1990, hiperinflação). Um eixo Y linear cobrindo esse range inteiro esmagaria os dados modernos (~0,5%) numa linha quase reta perto de zero. A solução escolhida foi **clipar visualmente**: `catalogo.ts` define um `tetoExibicaoGrafico` (15% no IPCA mensal, 30% no IPCA 12 meses); pontos acima do teto ficam com um marcador triangular truncado na linha tracejada do topo do gráfico, com uma legenda explicando o corte — o valor exato de cada ponto continua na tabela abaixo, nunca escondido, só fora da escala visual.

## Como o fallback é gerado

```bash
npm run gerar-fallback
```

`scripts/gerar-fallback.mjs` chama as duas APIs de verdade e escreve `lib/series/fallback/*.json`. Não inventa número — o instantâneo é literalmente o que a página mostra no pior dia (fonte fora do ar), e um número inventado num painel público seria o pior erro possível desta peça.

## Licença

MIT — ver [LICENSE](./LICENSE).
