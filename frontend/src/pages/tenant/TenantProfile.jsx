import { useState, useEffect } from 'react';
import { tenantAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loader from '../../components/Loader';

const InputField = ({ label, hint, children }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-300 mb-1">{label}</label>
    {hint && <p className="text-xs text-slate-500 mb-2">{hint}</p>}
    {children}
  </div>
);

const TenantProfile = () => {
  const [form, setForm] = useState({
    preferredLocation: '', minBudget: '', maxBudget: '', moveInDate: '',
  });
  const [loading, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    tenantAPI.getProfile()
      .then(({ data }) => {
        const p = data.data;
        setForm({
          preferredLocation: p?.preferredLocation || '',
          minBudget: p?.minBudget || '',
          maxBudget: p?.maxBudget || '',
          moveInDate: p?.moveInDate ? p.moveInDate.split('T')[0] : '',
        });
      })
      .finally(() => setFetching(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await tenantAPI.updateProfile(form);
      toast.success('Profile saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  if (fetching) return <DashboardLayout><Loader /></DashboardLayout>;

  const isProfileComplete = form.preferredLocation && form.minBudget && form.maxBudget && form.moveInDate;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8" style={{ animation: 'fadeUp .4s ease both' }}>
        <p className="section-label mb-1">Account</p>
        <h1 className="text-3xl font-black text-white">My Profile</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Identity card */}
        <div className="card p-6 flex flex-col items-center text-center" style={{ animation: 'fadeUp .4s .05s ease both', opacity: 0, animationFillMode: 'forwards' }}>
          <div className="w-20 h-20 rounded-full bg-primary-500/20 border-2 border-primary-500/40 flex items-center justify-center text-3xl font-black text-primary-400 mb-4">
            {user?.name?.charAt(0)?.toUpperCase() || 'T'}
          </div>
          <h2 className="text-lg font-bold text-white">{user?.name}</h2>
          <p className="text-sm text-slate-500 mb-4">{user?.email}</p>
          <span className="badge badge-primary">Tenant</span>

          {/* Profile completeness */}
          <div className="mt-6 w-full">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Profile Completeness</span>
              <span className="text-slate-300">{isProfileComplete ? '100%' : '50%'}</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 transition-all duration-700"
                style={{ width: isProfileComplete ? '100%' : '50%' }}
              />
            </div>
            {!isProfileComplete && (
              <p className="text-xs text-slate-500 mt-2">Fill all fields to improve your AI match score</p>
            )}
          </div>
        </div>

        {/* Preferences form */}
        <div className="lg:col-span-2 card p-6" style={{ animation: 'fadeUp .4s .1s ease both', opacity: 0, animationFillMode: 'forwards' }}>
          <h2 className="text-lg font-bold text-white mb-6">Room Preferences</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField label="Preferred Location" hint="City or neighbourhood you want to stay in">
              <input
                className="input-field"
                placeholder="e.g. Indiranagar, Bengaluru"
                value={form.preferredLocation}
                onChange={set('preferredLocation')}
              />
            </InputField>

            <div className="grid grid-cols-2 gap-4">
              <InputField label="Min Budget (₹)" hint="Minimum rent you can afford">
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  placeholder="e.g. 8000"
                  value={form.minBudget}
                  onChange={set('minBudget')}
                />
              </InputField>
              <InputField label="Max Budget (₹)" hint="Maximum rent per month">
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  placeholder="e.g. 15000"
                  value={form.maxBudget}
                  onChange={set('maxBudget')}
                />
              </InputField>
            </div>

            <InputField label="Move-in Date" hint="When are you looking to move in?">
              <input
                type="date"
                className="input-field"
                value={form.moveInDate}
                onChange={set('moveInDate')}
              />
            </InputField>

            <div className="pt-2">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Saving...</>
                ) : 'Save Preferences'}
              </button>
            </div>
          </form>
        </div>

        {/* AI tip card */}
        <div className="lg:col-span-3 card p-5" style={{ animation: 'fadeUp .4s .2s ease both', opacity: 0, animationFillMode: 'forwards' }}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0 text-emerald-400">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-400 mb-1">AI Compatibility Tip</p>
              <p className="text-sm text-slate-400 leading-relaxed">
                The more accurate your preferences, the higher your AI compatibility scores will be. A complete profile helps our Gemini-powered engine find listings that are a near-perfect match for your lifestyle and budget.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TenantProfile;
