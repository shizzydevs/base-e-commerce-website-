import { useState } from 'react';
import { Sparkles, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Auth({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onLogin({
        name: isSignUp ? formData.fullName : formData.email.split('@')[0],
        email: formData.email,
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans flex items-center justify-center p-4 relative overflow-hidden">
  
      <div className="absolute top-0 -left-20 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-md w-full bg-stone-800/50 backdrop-blur-xl rounded-3xl border border-stone-700/60 shadow-2xl overflow-hidden p-8 space-y-6">

        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-600 text-white p-3 rounded-2xl shadow-lg shadow-emerald-600/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Local<span className="text-emerald-400">Harvest</span>Hub
          </h1>
          <p className="text-stone-400 text-sm">
            {isSignUp ? 'Create an account to support local farms' : 'Welcome back! Sign in to your account'}
          </p>
        </div>

        <div className="flex bg-stone-900/80 p-1 rounded-2xl border border-stone-700/50">
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              !isSignUp ? 'bg-emerald-500 text-stone-950 shadow-md' : 'text-stone-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              isSignUp ? 'bg-emerald-500 text-stone-950 shadow-md' : 'text-stone-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Full Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-stone-500" />
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Jane Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-stone-900/60 border border-stone-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-400 transition-all placeholder:text-stone-600"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-stone-500" />
              <input
                type="email"
                name="email"
                required
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-stone-900/60 border border-stone-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-400 transition-all placeholder:text-stone-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-stone-500" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-stone-900/60 border border-stone-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-400 transition-all placeholder:text-stone-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-stone-950 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-stone-700/50 flex justify-between text-xs text-stone-400 font-medium">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Direct Farm Goods
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Secure Checkout
          </span>
        </div>
      </div>
    </div>
  );
}