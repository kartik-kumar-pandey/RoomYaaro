import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import PublicLayout from '../layouts/PublicLayout';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Reset token is missing from the URL.');
      return;
    }

    if (password.length < 8 || !/\d/.test(password)) {
      toast.error('Password must be at least 8 characters long and contain a number.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Password reset successful! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md card p-8" style={{ animation: 'fadeUp .5s ease both' }}>
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black text-white">Choose New Password</h1>
            <p className="text-slate-400 mt-1.5 text-sm">
              Please enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                New Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Minimum 8 characters with a number"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3 text-sm font-semibold"
              disabled={loading}
            >
              {loading ? 'Updating password...' : 'Update Password'}
            </button>
          </form>

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

export default ResetPassword;
