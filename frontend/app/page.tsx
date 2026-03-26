import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { Button } from "@/components/ui/8bit/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-12 p-8">
      <div className="text-center space-y-4">
        <h1 className="retro text-4xl font-bold text-primary">FinFin</h1>
        <p className="retro text-muted-foreground text-xs">AI-powered personal finance tracker</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-2xl">
        <Link href="/upload">
          <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="text-3xl mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50" fill="#FFFFFF"><path d="M22 6V5h-9V4h-1V3h-1V2H2v1H1v18h1v1h20v-1h1V6zm-1 14H3V4h7v1h1v1h1v1h9z" /></svg>
              </div>
              <CardTitle className="text-sm">Upload Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>CSV or PDF bank file</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/transactions">
          <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="text-3xl mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50" fill="#FFFFF"><path d="M22 5V4H2v1H1v14h1v1h20v-1h1V5zm-1 13H3v-7h18zm0-10H3V6h18z" /><path d="M4 15h4v1H4zm6 0h6v1h-6z" /></svg>
              </div>
              <CardTitle className="text-sm">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Review &amp; categorize</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/advice">
          <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="text-3xl mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50" fill="#FFFFFF"><path  d="M22 8V7h-1V6h-2V4h-1V3h-1V2h-1V1h-5v1h-1v1H9V2H6v1H4v1H3v2H2v5H1v5h1v1h1v1h2v2h1v1h1v1h1v1h5v-1h1v-1h1v1h3v-1h2v-1h1v-2h1v-5h1V8ZM9 6h1V4h1V3h5v1h1v1h-5v1h-1v1h-1v2H9v2H8V8h1ZM5 17v-1H4v-1H3v-4h1v2h1v2h8v1h-1v1Zm10 1h-1v2h-1v1H8v-1H7v-1h5v-1h1v-1h1v-2h1v-2h1v3h-1Zm5 0h-1v1h-1v1h-2v-2h1v-2h1v-2h-1v-2h-1v-1h-1v1h-1v2h-4v-1H9v1H7v-1H6v-1H5v-2H4V6h1V5h1V4h2v2H7v2H6v2h1v2h1v1h1v-1h1v-2h4v1h1v-1h2v1h1v1h1v2h1Zm1-5h-1v-2h-1V9h-8V8h1V7h7v1h1v1h1Z"/></svg>

              </div>
              <CardTitle className="text-sm">Savings Advice</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>AI-generated tips</CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="flex gap-4">
        <Link href="/upload">
          <Button>Get Started</Button>
        </Link>
        <Link href="/transactions">
          <Button variant="outline">View Transactions</Button>
        </Link>
      </div>
    </main>
  );
}
