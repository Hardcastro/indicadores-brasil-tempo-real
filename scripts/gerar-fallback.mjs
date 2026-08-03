// Gera lib/series/fallback/*.json chamando as APIs de verdade. Não inventa
// número: o instantâneo é o que a página mostra no pior dia (fonte fora do
// ar), e número inventado num painel público é o pior erro possível.
//
// Uso: npm run gerar-fallback

import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const DESTINO = path.join(DIR, "..", "lib", "series", "fallback");

const ANOS_HISTORICO = 2;

function formatarDataBr(d) {
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${d.getFullYear()}`;
}

function dataBrParaIso(dataBr) {
  const [dia, mes, ano] = dataBr.split("/");
  return `${ano}-${mes}-${dia}`;
}

function periodoParaIso(periodo) {
  const ano = periodo.slice(0, 4);
  const mes = periodo.slice(4, 6);
  return `${ano}-${mes}-01`;
}

// O WAF do BCB devolve ocasionalmente uma página HTML de "Requisição
// inválida!" com HTTP 200 sob rajada de chamadas — nada a ver com a
// armadilha 1, é rate-limit. Repete algumas vezes antes de desistir.
async function comRetentativas(fn, tentativas = 4) {
  let ultimoErro;
  for (let i = 0; i < tentativas; i++) {
    try {
      return await fn();
    } catch (err) {
      ultimoErro = err;
      if (i < tentativas - 1) await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw ultimoErro;
}

async function buscarBcb(serieId) {
  return comRetentativas(async () => {
    const hoje = new Date();
    const inicio = new Date(hoje);
    inicio.setFullYear(inicio.getFullYear() - ANOS_HISTORICO);
    const params = new URLSearchParams({
      formato: "json",
      dataInicial: formatarDataBr(inicio),
      dataFinal: formatarDataBr(hoje),
    });
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serieId}/dados?${params.toString()}`;
    const res = await fetch(url);
    const json = await res.json().catch(() => null);
    if (!Array.isArray(json)) {
      throw new Error(`BCB serie ${serieId}: resposta não é array — ${JSON.stringify(json).slice(0, 200)}`);
    }
    return json.map((p) => ({ data: dataBrParaIso(p.data), valor: Number(p.valor) }));
  });
}

async function buscarIbge(agregado, variavel) {
  return comRetentativas(async () => {
    const params = new URLSearchParams({ localidades: "N1[all]" });
    const url = `https://servicodados.ibge.gov.br/api/v3/agregados/${agregado}/periodos/all/variaveis/${variavel}?${params.toString()}`;
    const res = await fetch(url);
    const json = await res.json().catch(() => null);
    const serie = json?.[0]?.resultados?.[0]?.series?.[0]?.serie;
    if (!serie) {
      throw new Error(`IBGE agregado ${agregado}/${variavel}: forma inesperada — ${JSON.stringify(json).slice(0, 200)}`);
    }
    return Object.entries(serie)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([periodo, valorBruto]) => {
        const valor = Number(valorBruto);
        return { data: periodoParaIso(periodo), valor: Number.isFinite(valor) ? valor : null };
      });
  });
}

const SERIES = [
  { id: "selic", buscar: () => buscarBcb(432) },
  { id: "cambio-usd", buscar: () => buscarBcb(1) },
  { id: "ipca-mensal", buscar: () => buscarIbge(1737, 63) },
  { id: "ipca-12m", buscar: () => buscarIbge(1737, 2265) },
  { id: "desocupacao", buscar: () => buscarIbge(6381, 4099) },
];

async function main() {
  await mkdir(DESTINO, { recursive: true });
  const agora = new Date().toISOString();

  for (const { id, buscar } of SERIES) {
    process.stdout.write(`${id}... `);
    const pontos = await buscar();
    const conteudo = { atualizadoEm: agora, pontos };
    await writeFile(path.join(DESTINO, `${id}.json`), JSON.stringify(conteudo, null, 2) + "\n", "utf8");
    console.log(`${pontos.length} pontos`);
  }

  console.log(`\nFallback gerado em ${DESTINO}`);
}

main().catch((err) => {
  console.error("Falha ao gerar fallback:", err);
  process.exitCode = 1;
});
