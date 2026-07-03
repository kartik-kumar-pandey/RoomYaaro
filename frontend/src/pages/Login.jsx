import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import PublicLayout from '../layouts/PublicLayout';

/* Decorative left panel stats */
const panelStats = [
  { value: '2,847+', label: 'Active Listings' },
  { value: '94%',    label: 'Match Accuracy' },
  { value: '312',    label: 'Chats Today' },
];

const Login = () => {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const { login }  = useAuth();
  const toast      = useToast();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      const redirect = { OWNER: '/owner/dashboard', TENANT: '/tenant/dashboard', ADMIN: '/admin/dashboard' }[user.role];
      toast.success('Welcome back!');
      navigate(redirect);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-4rem)] flex">

        {/* ── Left decorative panel ── */}
        <div className="hidden lg:flex flex-col justify-between w-[42%] relative overflow-hidden p-12 keep-dark"
          style={{ background: 'linear-gradient(145deg, #0a0e1f 0%, #0f172a 40%, #0d1526 100%)' }}>
          {/* Grid bg */}
          <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />
          {/* Glow orbs */}
          <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,.18) 0%, transparent 70%)' }} />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,.12) 0%, transparent 70%)' }} />

          {/* Logo */}
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
                <img src="/logo.png" alt="RoomYaaro Logo" className="w-full h-full object-cover rounded-xl" />
              </div>
              <span className="font-bold text-xl text-white">Room<span className="text-primary-400">Yaaro</span></span>
            </Link>
          </div>

          {/* Headline */}
          <div className="relative z-10 space-y-6">
            <div>
              <h2 className="text-4xl font-black text-white leading-tight mb-3">
                Your next home<br />
                <span className="gradient-text">starts here.</span>
              </h2>
              <p className="text-slate-400 leading-relaxed">
                AI-powered compatibility matching connects you with rooms and flatmates that truly fit.
              </p>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              {panelStats.map((s, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-2xl font-black text-white tabular-nums">{s.value}</span>
                  <span className="text-sm text-slate-500">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom quote */}
          <p className="relative z-10 text-xs text-slate-700 italic">
            "Found my perfect flatmate in 3 days — the AI score was spot on."
          </p>
        </div>

        {/* ── Right form panel ── */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md" style={{ animation: 'fadeUp .6s ease both' }}>
            <div className="mb-8">
              <h1 className="text-3xl font-black text-white">Sign In</h1>
              <p className="text-slate-400 mt-1 text-sm">Welcome back — pick up where you left off.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPw
                      ? <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                      : <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    }
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-3.5 text-base"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in…
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              No account?{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Login;
