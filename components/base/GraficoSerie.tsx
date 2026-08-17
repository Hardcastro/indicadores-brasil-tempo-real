"use client";

import { useMemo, useRef, useState } from "react";
import type { Ponto } from "@/lib/series";
import { formatDataCurta, formatMesAno, formatNumeroPT } from "@/lib/format";

const VB_W = 960;
const VB_H = 360;
const MARGEM = { topo: 16, direita: 16, baixo: 32, esquerda: 56 };

type Props = {
  pontos: Ponto[];
  nome: string;
  unidade: "%" | "R$";
  periodicidadeDiaria: boolean;
  /**
   * Teto de exibição para séries com outlier extremo (ex.: IPCA em meses de
   * hiperinflação). Pontos acima do teto ficam com marcador truncado no
   * topo do gráfico em vez de estourar a escala — o valor real continua
   * disponível no hover/teclado e na tabela completa.
   */
  tetoExibicao?: number;
};

function formatValor(valor: number, unidade: "%" | "R$"): string {
  return unidade === "%" ? `${formatNumeroPT(valor)}%` : `R$ ${formatNumeroPT(valor, 4)}`;
}

/**
 * Casas decimais que o PASSO exige, não a magnitude dele. Derivar de log10
 * quebra no passo 2,5: a magnitude diz zero casas e a marca 7,5 sai rotulada
 * "8". Como toda marca é múltiplo do passo, o número de casas que representa
 * o passo exatamente representa todas as marcas.
 */
function casasDoPasso(passo: number): number {
  for (let c = 0; c <= 6; c++) {
    if (Math.abs(Number(passo.toFixed(c)) - passo) < 1e-9) return c;
  }
  return 6;
}

/**
 * Eixo Y com marcas em valores redondos.
 *
 * O que havia antes: cinco marcas igualmente espaçadas entre o mínimo e o
 * máximo com 12% de folga, e o rótulo era esse valor arredondado para
 * inteiro. Ou seja, **a linha e o rótulo dela eram números diferentes**. Na
 * Selic as cinco linhas caíam em 9,96 / 11,36 / 12,75 / 14,14 / 15,54 e
 * saíam rotuladas 10 / 11 / 13 / 14 / 16 — quem encostasse um ponto na
 * linha "14" lia 14 numa linha que valia 14,14, e o pior caso dava 0,46
 * ponto de erro. No câmbio três rótulos vinham repetidos ("5, 5, 6, 6, 6").
 * Numa peça que existe para dizer que nenhum destes números foi digitado
 * por alguém, o eixo não pode ser o lugar onde o número é inventado.
 *
 * Agora o passo é escolhido entre valores redondos (1, 2, 2,5, 5 × 10^k) e
 * as marcas caem em múltiplos exatos dele, então o rótulo É a linha. O
 * passo é escolhido pelo número de marcas que produz, não por uma tabela de
 * limiares — a tabela erra perto das fronteiras (amplitude 9,8 escolhia
 * passo 5 e sobravam três marcas num gráfico de 360px de altura).
 *
 * Conferido em `testes-s4/eixo.mts`, fora do repo: 104 conferências sobre
 * as cinco séries reais e seis casos de borda.
 */
function eixoBonito(min: number, max: number, alvoDeMarcas = 5) {
  if (max - min < 1e-12) {
    const meia = Math.abs(max) * 0.05 || 1;
    min -= meia;
    max += meia;
  }
  const amplitude = max - min;
  const magnitude = Math.pow(10, Math.floor(Math.log10(amplitude)));

  const candidatos: number[] = [];
  for (const m of [magnitude / 10, magnitude, magnitude * 10]) {
    for (const f of [1, 2, 2.5, 5]) candidatos.push(Number((f * m).toPrecision(12)));
  }

  let passo = candidatos[0];
  let melhorCusto = Infinity;
  for (const candidato of candidatos) {
    const de = Math.floor(min / candidato) * candidato;
    const ate = Math.ceil(max / candidato) * candidato;
    const quantas = Math.round((ate - de) / candidato) + 1;
    if (quantas < 3 || quantas > 8) continue;
    const custo = Math.abs(quantas - alvoDeMarcas) + (quantas > alvoDeMarcas ? 0.1 : 0);
    if (custo < melhorCusto) {
      melhorCusto = custo;
      passo = candidato;
    }
  }

  const yMin = Number((Math.floor(min / passo) * passo).toPrecision(12));
  const yMax = Number((Math.ceil(max / passo) * passo).toPrecision(12));
  const casas = casasDoPasso(passo);
  const marcas: number[] = [];
  // acumula por índice, não somando o passo — soma repetida de float acumula erro
  const quantas = Math.round((yMax - yMin) / passo);
  for (let i = 0; i <= quantas; i++) marcas.push(Number((yMin + i * passo).toPrecision(12)));
  return { yMin, yMax, casas, marcas };
}

export function GraficoSerie({ pontos, nome, unidade, periodicidadeDiaria, tetoExibicao }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [indiceAtivo, setIndiceAtivo] = useState<number | null>(null);

  const dados = useMemo(() => {
    const validos = pontos.filter((p) => p.valor !== null) as Array<{ data: string; valor: number }>;
    const clipado = (v: number) => (tetoExibicao !== undefined ? Math.min(v, tetoExibicao) : v);

    const valoresExibidos = validos.map((p) => clipado(p.valor));
    const { yMin, yMax, casas: casasEixo, marcas: ticksY } = eixoBonito(
      Math.min(...valoresExibidos),
      Math.max(...valoresExibidos)
    );

    const innerW = VB_W - MARGEM.esquerda - MARGEM.direita;
    const innerH = VB_H - MARGEM.topo - MARGEM.baixo;
    const n = pontos.length;

    const xDe = (i: number) => MARGEM.esquerda + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
    const yDe = (v: number) => MARGEM.topo + innerH - ((v - yMin) / (yMax - yMin)) * innerH;

    const pontosXY = pontos.map((p, i) => ({
      i,
      data: p.data,
      valorReal: p.valor,
      x: xDe(i),
      y: p.valor === null ? null : yDe(clipado(p.valor)),
      truncado: tetoExibicao !== undefined && p.valor !== null && p.valor > tetoExibicao,
    }));

    // Um path por trecho contínuo — null interrompe e o próximo trecho
    // começa um path novo, nunca liga os dois lados do buraco.
    const segmentos: string[] = [];
    let atual: string[] = [];
    for (const p of pontosXY) {
      if (p.y === null) {
        if (atual.length > 1) segmentos.push(atual.join(" "));
        atual = [];
        continue;
      }
      atual.push(`${atual.length === 0 ? "M" : "L"} ${p.x.toFixed(2)},${p.y.toFixed(2)}`);
    }
    if (atual.length > 1) segmentos.push(atual.join(" "));

    // Ticks do eixo X — um por ano, mas nunca mais que ~7 rótulos.
    const anos: Array<{ i: number; ano: string }> = [];
    let ultimoAno = "";
    pontos.forEach((p, i) => {
      const ano = p.data.slice(0, 4);
      if (ano !== ultimoAno) {
        anos.push({ i, ano });
        ultimoAno = ano;
      }
    });
    const passo = Math.max(1, Math.ceil(anos.length / 7));
    const ticksX = anos.filter((_, idx) => idx % passo === 0 || idx === anos.length - 1);

    return { pontosXY, segmentos, ticksY, ticksX, casasEixo, yDe, xDe, innerW, innerH };
  }, [pontos, tetoExibicao]);

  const primeiro = pontos.find((p) => p.valor !== null);
  const ultimo = [...pontos].reverse().find((p) => p.valor !== null);
  const resumo =
    primeiro && ultimo
      ? `${nome}, de ${periodicidadeDiaria ? formatDataCurta(primeiro.data) : formatMesAno(primeiro.data)} a ${
          periodicidadeDiaria ? formatDataCurta(ultimo.data) : formatMesAno(ultimo.data)
        }. Começou em ${formatValor(primeiro.valor as number, unidade)}, terminou em ${formatValor(
          ultimo.valor as number,
          unidade
        )}.`
      : `${nome}, sem dado disponível.`;

  function moverPara(indice: number) {
    setIndiceAtivo(Math.max(0, Math.min(pontos.length - 1, indice)));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const base = indiceAtivo ?? 0;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      moverPara(base + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      moverPara(base - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      moverPara(0);
    } else if (e.key === "End") {
      e.preventDefault();
      moverPara(pontos.length - 1);
    }
  }

  function onMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = ((e.clientX - rect.left) / rect.width) * VB_W;
    const idx = Math.round(((relX - MARGEM.esquerda) / dados.innerW) * (pontos.length - 1));
    moverPara(idx);
  }

  const ativo = indiceAtivo !== null ? dados.pontosXY[indiceAtivo] : null;
  const anuncio =
    ativo && ativo.valorReal !== null
      ? `${periodicidadeDiaria ? formatDataCurta(ativo.data) : formatMesAno(ativo.data)}: ${formatValor(
          ativo.valorReal,
          unidade
        )}${ativo.truncado ? " — fora da escala do gráfico, veja a tabela para o valor exato" : ""}`
      : ativo
        ? `${periodicidadeDiaria ? formatDataCurta(ativo.data) : formatMesAno(ativo.data)}: sem dado`
        : "";

  return (
    <div className="flex flex-col gap-2">
      <div
        className="relative"
        tabIndex={0}
        role="group"
        aria-roledescription="gráfico interativo"
        aria-label={`${resumo} Use as setas do teclado para percorrer os pontos.`}
        onKeyDown={onKeyDown}
        onMouseLeave={() => setIndiceAtivo(null)}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="block w-full"
          role="img"
          aria-label={resumo}
          onMouseMove={onMouseMove}
        >
          {/* Grade e eixo Y */}
          {dados.ticksY.map((valor, i) => {
            const y = dados.yDe(valor);
            return (
              <g key={i}>
                <line
                  x1={MARGEM.esquerda}
                  x2={VB_W - MARGEM.direita}
                  y1={y}
                  y2={y}
                  stroke="var(--glass-solid-border)"
                  strokeWidth={1}
                />
                <text x={MARGEM.esquerda - 8} y={y} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="var(--text-muted)">
                  {formatNumeroPT(valor, dados.casasEixo)}
                </text>
              </g>
            );
          })}

          {/* Linha de teto truncado, quando existe */}
          {tetoExibicao !== undefined && (
            <line
              x1={MARGEM.esquerda}
              x2={VB_W - MARGEM.direita}
              y1={dados.yDe(tetoExibicao)}
              y2={dados.yDe(tetoExibicao)}
              stroke="#b45309"
              strokeWidth={1}
              strokeDasharray="4 3"
            />
          )}

          {/* Eixo X */}
          {dados.ticksX.map(({ i, ano }) => (
            <text
              key={i}
              x={dados.xDe(i)}
              y={VB_H - MARGEM.baixo + 20}
              textAnchor="middle"
              fontSize={11}
              fill="var(--text-muted)"
            >
              {ano}
            </text>
          ))}

          {/* Traço da série — um path por trecho contínuo */}
          {dados.segmentos.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="var(--clay-primary)" strokeWidth={2} className="traco-serie" />
          ))}

          {/* Marcadores de ponto truncado */}
          {dados.pontosXY
            .filter((p) => p.truncado)
            .map((p) => (
              <path
                key={p.i}
                d={`M ${p.x - 4},${(p.y ?? 0) + 6} L ${p.x + 4},${(p.y ?? 0) + 6} L ${p.x},${(p.y ?? 0) - 2} Z`}
                fill="#b45309"
              />
            ))}

          {/* Ponto ativo (hover ou teclado) */}
          {ativo && ativo.y !== null && (
            <>
              <line
                x1={ativo.x}
                x2={ativo.x}
                y1={MARGEM.topo}
                y2={VB_H - MARGEM.baixo}
                stroke="var(--text-muted)"
                strokeWidth={1}
                strokeDasharray="2 3"
              />
              <circle cx={ativo.x} cy={ativo.y} r={4.5} fill="var(--bg-emerald)" stroke="#fff" strokeWidth={1.5} />
            </>
          )}
        </svg>

        {ativo && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-control border border-glass-solid-border bg-glass-solid-bg px-3 py-1.5 text-body-sm text-text-primary shadow-surface"
            style={{
              left: `${(ativo.x / VB_W) * 100}%`,
              top: `${Math.max(0, ((ativo.y ?? dados.yDe(tetoExibicao ?? 0)) / VB_H) * 100 - 2)}%`,
            }}
          >
            {anuncio}
          </div>
        )}

        <span aria-live="polite" className="sr-only">
          {anuncio}
        </span>
      </div>

      {tetoExibicao !== undefined && dados.pontosXY.some((p) => p.truncado) && (
        <p className="text-body-sm text-text-muted">
          Eixo limitado a {formatNumeroPT(tetoExibicao, 0)}
          {unidade} para manter os dados recentes legíveis — os picos acima da linha tracejada são meses de
          hiperinflação truncados visualmente. O valor exato de cada ponto está na tabela abaixo.
        </p>
      )}
    </div>
  );
}
