/**
 * Formatação pt-BR só na borda da renderização — number (ponto decimal)
 * nunca circula formatado (vírgula) pelo meio do caminho (armadilha 5).
 */
export function formatNumeroPT(valor: number, casas: number = 2): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(valor);
}

export function formatPercentualPT(valor: number, casas: number = 2): string {
  return `${formatNumeroPT(valor, casas)}%`;
}

export function formatMoedaPT(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

/** aaaa-mm-dd -> "3 ago 2026" (dia só quando faz sentido — série diária). */
export function formatDataCurta(iso: string): string {
  const [ano, mes, dia] = iso.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    data
  );
}

/** aaaa-mm-dd -> "agosto de 2026" (série mensal, dia não importa). */
export function formatMesAno(iso: string): string {
  const [ano, mes] = iso.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, 1));
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(data);
}

export function formatDataHoraPT(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));
}
