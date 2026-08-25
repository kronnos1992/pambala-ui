import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Pambala - Marketplace de Angola",
  description:
    "O maior marketplace de Angola. Compre e venda de forma simples, segura e rapida. Encontre os melhores produtos e lojas em todo o pais.",
  openGraph: {
    title: "Pambala - Marketplace de Angola",
    description:
      "O maior marketplace de Angola. Compre e venda de forma simples, segura e rapida.",
    locale: "pt_AO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-AO" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ToastProvider />
      </body>
    </html>
  );
}
