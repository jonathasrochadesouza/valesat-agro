import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ValeSat Agro | Monitoramento Satelital no Vale do Itajaí (SC)",
  description: "Plataforma de alta precisão com Sentinel-2 (10m) e CBERS-4A (2m/8m INPE) para pastagens, arroz irrigado e lavouras no Vale do Itajaí.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased select-none">
        {children}
      </body>
    </html>
  );
}
