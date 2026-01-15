export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-16">
      <div className="max-w-4xl w-full grid gap-10 md:grid-cols-2 items-center">
        <div className="space-y-6">
          <p className="uppercase tracking-[0.35em] text-xs text-gray-400">Reel App</p>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">A familiar feed, rebuilt.</h1>
          <p className="text-gray-400 text-lg">
            Jump into the experience, browse your feed, and try the interactions. This is a working clone, not a mockup.
          </p>
          <div className="flex gap-3">
            <a
              href="/home"
              className="px-5 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition"
            >
              Open the app
            </a>
            <a
              href="/login"
              className="px-5 py-3 rounded-xl border border-gray-700 text-white font-semibold hover:bg-gray-900 transition"
            >
              Sign in
            </a>
          </div>
        </div>
        <div className="hidden md:flex justify-end">
          <div className="aspect-[4/5] w-80 rounded-[32px] bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-800 shadow-2xl flex items-center justify-center text-gray-500">
            Live preview →
          </div>
        </div>
      </div>
    </main>
  );
}
