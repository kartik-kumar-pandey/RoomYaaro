import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import PublicLayout from '../layouts/PublicLayout';

const VerifyEmail = () => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const toast = useToast();
  const navigate = useNavigate();
  const calledRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setStatus('error');
      setErrorMessage('Verification token is missing from the URL.');
      return;
    }

    if (calledRef.current) return;
    calledRef.current = true;

    const verify = async () => {
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        toast.success('Email verified successfully! You can now log in.');
      } catch (err) {
        setStatus('error');
        setErrorMessage(err.response?.data?.message || 'Verification token is invalid or has expired.');
        toast.error(err.response?.data?.message || 'Verification failed.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token, toast]);

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md card p-8 text-center" style={{ animation: 'fadeUp .5s ease both' }}>
          {loading && (
            <div className="space-y-6">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-primary-500/10 border-t-primary-500 animate-spin" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Verifying your email</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                  Please hold on while we secure and verify your credentials...
                </p>
              </div>
            </div>
          )}

          {!loading && status === 'success' && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20 animate-scale-in">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Email Verified!</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm leading-relaxed">
                  Thank you! Your email address has been successfully verified. You can now access your RoomYaaro account.
                </p>
              </div>
              <Link to="/login" className="btn-primary w-full py-3 block text-sm font-semibold">
                Sign In to Your Account
              </Link>
            </div>
          )}

          {!loading && status === 'error' && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20 animate-scale-in">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Verification Failed</h1>
                <p className="text-rose-500 dark:text-rose-400 mt-2 text-sm font-medium">
                  {errorMessage}
                </p>
                <p className="text-slate-600 dark:text-slate-400 mt-2.5 text-xs leading-relaxed">
                  If the verification link is expired, you can request a new verification email by trying to log in, or contact support if the issue persists.
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <Link to="/login" className="btn-primary w-full py-3 block text-sm font-semibold">
                  Back to Sign In
                </Link>
                <Link to="/" className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium block py-2 transition-colors">
                  Go to Homepage
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default VerifyEmail;
