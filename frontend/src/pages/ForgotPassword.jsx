import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import PublicLayout from '../layouts/PublicLayout';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('If the account exists, a reset link has been emailed.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md card p-8" style={{ animation: 'fadeUp .5s ease both' }}>
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black text-white">Reset Password</h1>
            <p className="text-slate-400 mt-1.5 text-sm">
              {!submitted 
                ? "Enter your email address and we'll send you a link to choose a new password."
                : "Check your email for instructions to reset your password."
              }
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-3 text-sm font-semibold"
                disabled={loading}
              >
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="text-center mt-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mb-4">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
                </svg>
              </div>
              <p className="text-sm text-slate-300 mb-6">
                A password reset link has been sent to <strong>{email}</strong>. Please check your inbox and spam folder.
              </p>
            </div>
          )}

          <div className="text-center mt-6 border-t border-white/5 pt-4">
            <Link to="/login" className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ForgotPassword;
