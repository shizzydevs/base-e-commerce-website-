import { Sparkles, ArrowRight, Store, ShieldCheck, MapPin, Leaf } from 'lucide-react';

export default function Welcome({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans flex flex-col justify-between relative overflow-hidden">
        
      <div className="absolute top-0 -left-20 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <nav className="relative z-10 max-w-7xl w-full mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 text-white p-2 rounded-xl shadow-lg shadow-emerald-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Local<span className="text-emerald-400">Harvest</span>Hub
          </span>
        </div>
        <button
          onClick={onGetStarted}
          className="text-xs font-bold text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-800 border border-stone-700/60 px-4 py-2 rounded-xl transition-all"
        >
          Sign In
        </button>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 text-center my-auto space-y-8 py-12">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md">
          <Leaf className="w-3.5 h-3.5" />
          <span>Connecting Neighborhoods to Nearby Farms</span>
        </div>

        <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-none text-white">
          Taste the Freshness of <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
            Your Local Community.
          </span>
        </h1>

        <p className="text-stone-400 text-base md:text-xl max-w-2xl mx-auto leading-relaxed">
          Skip the long supply chain. Order artisanal bread, organic produce, and farm-fresh dairy straight from local producers within miles of your home.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-stone-950 font-extrabold px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all text-base"
          >
            <span>Explore Local Marketplace</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left border-t border-stone-800/80 max-w-3xl mx-auto">
          <div className="bg-stone-800/40 border border-stone-800 p-4 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <MapPin className="w-4 h-4" />
              <span>Hyper-Local</span>
            </div>
            <p className="text-xs text-stone-400">Sourced exclusively within a 5-mile radius from you.</p>
          </div>

          <div className="bg-stone-800/40 border border-stone-800 p-4 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Store className="w-4 h-4" />
              <span>Independent Bakers</span>
            </div>
            <p className="text-xs text-stone-400">Support family-owned micro-farms & artisanal bakeries.</p>
          </div>

          <div className="bg-stone-800/40 border border-stone-800 p-4 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Quality Guaranteed</span>
            </div>
            <p className="text-xs text-stone-400">Harvested same-day or made fresh to order.</p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-stone-800/60 py-6 text-center text-xs text-stone-500">
        Local Harvest Hub &copy; {new Date().getFullYear()} — Built for local growth.
      </footer>
    </div>
  );
}