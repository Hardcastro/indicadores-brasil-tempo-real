import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/base/Header";
import { Footer } from "@/components/base/Footer";
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
        <Header />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
