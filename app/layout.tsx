import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/base/Header";
import { Footer } from "@/components/base/Footer";
import { FaixaProcedencia, BlocoProcedencia } from "@/components/base/Procedencia";
import { site } from "@/site.config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.descricao,
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    title: site.tagline,
    description: site.descricao,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: site.tagline,
    description: site.descricao,
  },
};

/**
 * A procedência desta peça, num lugar só. A `capacidade` é a MESMA frase do
 * `lib/manifesto.ts` da AEther Data — se as duas divergirem, a vitrine e a peça
 * passam a prometer coisas diferentes, e ninguém percebe.
 */
const PROCEDENCIA = {
  capacidade: "Duas fontes públicas, de formatos incompatíveis, atrás de uma interface só — e a página fica em pé quando uma cai",
  vertente: "/sites",
  // Sem `repo`: o rodape proprio desta peca ja linka o GitHub, e repetir o
  // mesmo link dois blocos abaixo e ruido.
  // Sem `ficticio`: esta e a unica das quatro sem cliente inventado.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="relative flex min-h-full flex-col font-sans">
        <a
          href="#conteudo"
          className="skip-link rounded-control bg-clay-primary px-4 py-2 text-body-sm font-medium text-clay-primary-ink shadow-clay"
        >
          Pular para o conteúdo
        </a>
        <FaixaProcedencia {...PROCEDENCIA} />
        <Header />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <Footer />
        <BlocoProcedencia {...PROCEDENCIA} />
      </body>
    </html>
  );
}
