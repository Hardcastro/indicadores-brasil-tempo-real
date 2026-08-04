/**
 * Template, não layout — o Next remonta isto a cada navegação de segmento
 * (layout sobrevive entre rotas, template não), e é isso que reinicia a
 * animação de .page-transition a cada troca de página sem listener de rota
 * nenhum. Importante para esta peça especificamente: troca de searchParams
 * na MESMA rota (?serie=, ?de=, o seletor de série e o filtro de ano da
 * tabela) não remonta o template — só troca de segmento remonta (/  →
 * /fontes). Confirmado antes de aplicar: senão a transição dispararia a
 * cada clique de filtro, que seria regressão, não efeito. Keyframes em
 * globals.css.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-transition">{children}</div>;
}
