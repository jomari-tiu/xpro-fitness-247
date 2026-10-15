import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "XPRO Fitness 24/7 · General Trias",
    template: "%s · XPRO Fitness 24/7",
  },
  description:
    "XPRO Fitness 24/7 is always open. Free weights, plate-loaded machines and cable stations in Brookside Lane, San Francisco, General Trias.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${archivo.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster theme="dark" richColors position="top-right" />
      </body>
    </html>
  );
}
