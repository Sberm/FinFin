import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import "@/components/ui/8bit/styles/retro.css";
import Link from "next/link";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinFin",
  description: "AI-powered personal finance tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <nav className="bg-card border-b-4 border-foreground px-8 py-5 flex gap-8 items-center">
          <Link href="/" className="retro text-primary font-bold text-xs tracking-wide">FinFin</Link>
          <Link href="/upload" className="retro text-muted-foreground hover:text-foreground text-[10px] transition">Upload</Link>
          <Link href="/transactions" className="retro text-muted-foreground hover:text-foreground text-[10px] transition">Transactions</Link>
          <Link href="/advice" className="retro text-muted-foreground hover:text-foreground text-[10px] transition">Advice</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
