import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Mail, Sparkles, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-close modal if an active session is detected
  useEffect(() => {
    if (!isOpen) return;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        onClose();
      }
    };
    checkSession();

    // Listen for auth state changes (e.g. Magic Link click completion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        onClose();
      }
    });

    return () => subscription.unsubscribe();
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSendMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setEmailSent(true);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setEmailSent(false);
    setEmail('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
        {/* Close Button */}
        <button 
          onClick={handleReset}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {emailSent ? (
          /* Confirmation State */
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Check your email</h3>
            <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
              We sent a login link to <span className="text-emerald-400 font-medium">{email}</span>. Click the link in your inbox to sign in.
            </p>
            <button
              onClick={() => setEmailSent(false)}
              className="mt-6 text-xs text-zinc-500 hover:text-zinc-300 underline"
            >
              Didn't get the email? Try again
            </button>
          </div>
        ) : (
          /* Input State */
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Mail className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Sign In to LocalHarvest</h3>
            </div>
            <p className="text-zinc-400 text-sm mb-6">
              Enter your email address to receive a secure login link. No password required.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" /> Sending Link...
                  </>
                ) : (
                  'Send Magic Link'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}