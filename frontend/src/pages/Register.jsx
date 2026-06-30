import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import PublicLayout from '../layouts/PublicLayout';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'TENANT' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const { register } = useAuth();
  const toast   = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account created!');
      navigate(user.role === 'OWNER' ? '/owner/dashboard' : '/tenant/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const roles = [
    {
      id: 'TENANT',
      label: 'Tenant',
      desc: 'Looking for a room',
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      ),
    },
    {
      id: 'OWNER',
      label: 'Owner',
      desc: 'Listing a room',
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
      ),
    },
  ];

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-4rem)] flex">

        {/* Left decorative panel */}
        <div className="hidden lg:flex flex-col justify-between w-[42%] relative overflow-hidden p-12"
          style={{ background: 'linear-gradient(145deg, #0a0e1f 0%, #0f172a 40%, #0d1526 100%)' }}>
          <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-100 pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,.15) 0%, transparent 70%)' }} />
          <div className="absolute bottom-1/4 left-1/4 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,.1) 0%, transparent 70%)' }} />

          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
              </div>
              <span className="font-bold text-xl text-white">Rent<span className="text-primary-400">Finder</span></span>
            </Link>
          </div>

          <div className="relative z-10 space-y-5">
            <div>
              <h2 className="text-4xl font-black text-white leading-tight mb-3">
                Join thousands<br />
                <span className="gradient-text">finding home.</span>
              </h2>
              <p className="text-slate-400 leading-relaxed text-sm">
                Create your account in seconds. Our AI engine starts matching you immediately after sign-up.
              </p>
            </div>

            {/* Feature list */}
            {[
              'AI compatibility score on every listing',
              'Real-time WebSocket chat',
              'Instant email notifications',
              'Role-based dashboard',
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#34d399" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <span className="text-sm text-slate-400">{f}</span>
              </div>
            ))}
          </div>

          <p className="relative z-10 text-xs text-slate-700 italic">Free to join. No credit card required.</p>
        </div>

        {/* Right form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
          <div className="w-full max-w-md" style={{ animation: 'fadeUp .6s ease both' }}>
            <div className="mb-8">
              <h1 className="text-3xl font-black text-white">Create Account</h1>
              <p className="text-slate-400 mt-1 text-sm">Set up your profile and start matching.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Role selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  I am a…
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, role: role.id }))}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                        form.role === role.id
                          ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                          : 'border-white/8 bg-white/3 text-slate-400 hover:border-white/20 hover:text-slate-200'
                      }`}
                    >
                      {role.icon}
                      <div className="text-center">
                        <p className="font-semibold text-sm">{role.label}</p>
                        <p className="text-xs opacity-60">{role.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <input className="input-field" placeholder="Jane Doe" value={form.name} onChange={set('name')} required />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone (optional)</label>
                <input type="tel" className="input-field" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input-field pr-12"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={set('password')}
                    required minLength={6}
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

              <button type="submit" className="btn-primary w-full py-3.5 text-base" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Creating account…
                  </span>
                ) : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Register;
