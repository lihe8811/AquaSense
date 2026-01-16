import React, { useState } from 'react';

interface AuthViewProps {
  mode: 'login' | 'signup';
  onSubmit: (payload: { name?: string; email: string; password: string }) => Promise<void>;
  onToggleMode: () => void;
  onBack: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ mode, onSubmit, onToggleMode, onBack }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === 'signup';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit({ name: isSignup ? name.trim() : undefined, email: email.trim(), password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-10 -left-10 w-72 h-72 rounded-full bg-teal-200/30 blur-3xl"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-80 h-80 rounded-full bg-amber-200/20 blur-3xl"></div>
      </div>

      <main className="relative flex-1 flex flex-col px-8 pt-14 pb-10 z-10">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-300 text-sm font-semibold mb-8"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back
        </button>

        <div className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-2xl">water_drop</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-teal-500 font-semibold">HydraScan</p>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignup && (
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Full Name</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                type="text"
                placeholder="Alex Carter"
                className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/60"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="you@hydrascan.io"
              className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/60"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/60"
              minLength={6}
              required
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-teal-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : isSignup ? 'Create Account' : 'Log In'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={onToggleMode} className="text-primary font-semibold hover:underline">
            {isSignup ? 'Log In' : 'Sign Up'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default AuthView;
