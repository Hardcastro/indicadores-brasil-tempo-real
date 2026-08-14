/**
 * A faixa de procedência — 14/08/2026.
 *
 * ⚠ ESTE ARQUIVO É CÓPIA IDÊNTICA EM QUATRO REPOSITÓRIOS:
 *   contabilidade-institucional · restaurante-cardapio-planilha
 *   distribuidora-autopecas     · indicadores-brasil-tempo-real
 *
 * Mudou aqui, muda nos quatro. Não há como o compilador ligar um ao outro, e
 * foi exatamente por não haver que as quatro peças chegaram a contar três
 * versões diferentes do que são: a S1 dizia só "conteúdo fictício", a S3 dizia
 * "peça fictícia + código", a S4 assinava "AEther Data" sem link nenhum.
 *
 * ── Por que ela existe ───────────────────────────────────────────────────
 *
 * Achado lendo as quatro no ar como quem chega por uma proposta: **nenhuma
 * tinha um link de volta para a AEther Data.** O contratante abre
 * `contabilidade-institucional.vercel.app` e vê um escritório de
 * contabilidade — telefone, endereço, 180 clientes, a história da Marina. Ele
 * não sabe quem fez, não sabe que devia estar olhando para o formulário, e não
 * tem como chamar quem fez.
 *
 * É o mesmo furo que a N4 tinha, um nível acima: lá a peça apresentava o
 * material de demonstração como se fosse o produto. Aqui ela faz isso **e**
 * não deixa caminho de volta.
 *
 * ── Por que a faixa NÃO é fixa ───────────────────────────────────────────
 *
 * Ela rola junto com a página, de propósito. Fixa, brigaria com o cabeçalho
 * grudento de três dos quatro sites, e cada um resolveria essa briga de um
 * jeito — que é como quatro cópias voltam a divergir. Quem chega vê; quem
 * desce encontra o bloco do rodapé, que diz a mesma coisa por extenso.
 *
 * ── Tokens ───────────────────────────────────────────────────────────────
 *
 * Só utilitários do núcleo do Tailwind. Nenhum token do sistema visual de
 * nenhum dos quatro sites — é o que permite o arquivo ser byte a byte igual
 * nos quatro, mesmo que um deles renomeie uma cor amanhã.
 *
 * `black/10` e não `current/10`: opacidade sobre `currentColor` só compila no
 * Tailwind v4. Os quatro repos estão na v4 hoje — conferido — mas a falha, se
 * um deles voltasse, seria SILENCIOSA: a faixa apareceria sem borda e sem
 * fundo, e ninguém ligaria isso a uma versão de dependência. Os quatro sites
 * são de canvas claro, então preto a 10% dá o mesmo resultado sem depender de
 * nada.
 */

const AETHER = "https://aether-data-steel.vercel.app";

export type DadosProcedencia = {
  /** A capacidade que esta peça prova, na mesma frase que o manifesto usa. */
  capacidade: string;
  /** Rota da vertente no hub: "/sites" ou "/automacoes". */
  vertente: string;
  /** Repositório desta peça, se público. */
  repo?: string;
  /**
   * O nome do negócio fictício desta peça — "A Meridiano Contabilidade".
   *
   * **Opcional, e a ausência significa alguma coisa:** a S4 (indicadores) é a
   * única das quatro sem cliente inventado. Os números dela são reais, do BCB e
   * do IBGE. Com `ficticio` obrigatório, o bloco dela dizia "o negócio, os
   * dados e os contatos são inventados" — falso, e sobre a única peça cujo
   * argumento inteiro é que o dado não foi digitado por ninguém. Pego num print
   * em 14/08, não por teste.
   */
  ficticio?: string;
};

/**
 * A tarja é curta de propósito, e **não** repete a capacidade.
 *
 * A primeira versão trazia a frase inteira do manifesto aqui em cima. No print
 * de 1440px ela quebrava em duas linhas e o link ficava boiando ao lado do
 * bloco de texto, sem alinhamento com nada — e em 360px seria pior. Tarja é
 * tarja: tem um segundo para dizer "isto é portfólio de alguém, o caminho de
 * volta é aqui". A tradução por extenso é conteúdo, e conteúdo mora no
 * `BlocoProcedencia`, que tem espaço para ela.
 */
export function FaixaProcedencia({ vertente, ficticio }: DadosProcedencia) {
  return (
    <div className="w-full border-b border-black/10 bg-black/[0.04] px-4 py-2 text-xs leading-snug opacity-90 sm:text-sm">
      <p className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
        <span>
          <strong className="font-semibold">Peça de portfólio</strong> da AEther Data
          {ficticio && <> — a empresa desta página é fictícia</>}
        </span>
        <a
          href={`${AETHER}${vertente}`}
          className="whitespace-nowrap font-semibold underline underline-offset-2"
        >
          Ver quem fez, e as outras sete →
        </a>
      </p>
    </div>
  );
}

export function BlocoProcedencia({ capacidade, vertente, repo, ficticio }: DadosProcedencia) {
  return (
    <div className="border-t border-black/10">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-sm leading-relaxed opacity-90 sm:px-6">
        <p>
          <strong className="font-semibold">Esta é uma peça de portfólio da AEther Data.</strong>{" "}
          {ficticio ? (
            <>
              {ficticio} não existe — o negócio, os dados e os contatos são inventados. O que não é
              inventado é o que está funcionando aqui: {capacidade.toLowerCase()}.
            </>
          ) : (
            <>O que ela existe para provar: {capacidade.toLowerCase()}.</>
          )}
        </p>
        <p>
          São oito peças no ar, agrupadas pela competência que carregam e não pelo ramo do cliente
          — porque a competência se repete entre compradores diferentes e o ramo não.
        </p>
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          <a href={AETHER} className="font-semibold underline underline-offset-2">
            AEther Data
          </a>
          <a href={`${AETHER}${vertente}`} className="underline underline-offset-2">
            Ver as outras peças
          </a>
          {repo && (
            <a
              href={repo}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Código desta peça no GitHub
            </a>
          )}
        </p>
      </div>
    </div>
  );
}
