import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (resending || !user?.email) return;
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email: user.email });
      toast.success('Verification email resent successfully! Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 md:pb-0">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 min-h-[calc(100vh-4rem)] overflow-x-hidden">
          <div className="max-w-6xl">
            {user && !user.isEmailVerified && (
              <div 
                className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in"
                style={{ animationDelay: '200ms' }}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mt-0.5 sm:mt-0 flex-shrink-0">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-tight">Verify Your Email Address</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                      Your email is unverified. Please verify your email to unlock all features such as messaging and expressing interest.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500/15 hover:bg-amber-500/25 active:bg-amber-500/35 border border-amber-500/20 hover:border-amber-500/30 text-amber-700 dark:text-amber-300 transition-all duration-200 flex-shrink-0 text-center"
                >
                  {resending ? 'Sending...' : 'Resend Verification'}
                </button>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
