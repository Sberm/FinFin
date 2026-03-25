import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinFin",
  description: "AI-powered personal finance tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-950 text-white">
        <nav className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex gap-6 items-center">
          <Link href="/" className="text-emerald-400 font-bold text-xl">FinFin</Link>
          <Link href="/upload" className="text-gray-300 hover:text-white text-sm transition">Upload</Link>
          <Link href="/transactions" className="text-gray-300 hover:text-white text-sm transition">Transactions</Link>
          <Link href="/advice" className="text-gray-300 hover:text-white text-sm transition">Advice</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
