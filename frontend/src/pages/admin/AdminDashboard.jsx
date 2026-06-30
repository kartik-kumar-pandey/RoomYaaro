import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loader from '../../components/Loader';

const DashboardIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(({ data }) => setStats(data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers, color: { bg: 'bg-primary-500/15', text: 'text-primary-400' } },
    { label: 'Owners', value: stats?.owners, color: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' } },
    { label: 'Tenants', value: stats?.tenants, color: { bg: 'bg-cyan-500/15', text: 'text-cyan-400' } },
    { label: 'Total Listings', value: stats?.totalListings, color: { bg: 'bg-indigo-500/15', text: 'text-indigo-400' } },
    { label: 'Filled Listings', value: stats?.filledListings, color: { bg: 'bg-red-500/15', text: 'text-red-400' } },
    { label: 'Messages', value: stats?.totalMessages, color: { bg: 'bg-amber-500/15', text: 'text-amber-400' } },
    { label: 'Requests', value: stats?.totalRequests, color: { bg: 'bg-purple-500/15', text: 'text-purple-400' } },
    { label: 'Avg Match Score', value: `${stats?.averageScore || 0}%`, color: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' } },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8" style={{ animation: 'fadeUp .4s ease both' }}>
        <p className="section-label mb-1">Overview</p>
        <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div
            key={c.label}
            className="card p-6 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300"
            style={{ animation: `fadeUp .5s ${i * 40}ms ease both`, opacity: 0, animationFillMode: 'forwards' }}
          >
            <span className="text-sm text-slate-500 font-medium mb-2">{c.label}</span>
            <span className={`text-3xl font-black ${c.color.text}`}>{c.value ?? 0}</span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
