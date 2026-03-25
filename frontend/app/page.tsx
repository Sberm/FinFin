import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-emerald-400 mb-2">FinFin</h1>
        <p className="text-gray-400 text-lg">AI-powered personal finance tracker</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        <Link href="/upload" className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 text-center transition">
          <div className="text-3xl mb-2">📁</div>
          <h2 className="font-semibold text-lg">Upload Statement</h2>
          <p className="text-gray-400 text-sm mt-1">CSV or PDF bank file</p>
        </Link>

        <Link href="/transactions" className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 text-center transition">
          <div className="text-3xl mb-2">💳</div>
          <h2 className="font-semibold text-lg">Transactions</h2>
          <p className="text-gray-400 text-sm mt-1">Review & categorize</p>
        </Link>

        <Link href="/advice" className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 text-center transition">
          <div className="text-3xl mb-2">💡</div>
          <h2 className="font-semibold text-lg">Savings Advice</h2>
          <p className="text-gray-400 text-sm mt-1">AI-generated tips</p>
        </Link>
      </div>
    </main>
  );
}
