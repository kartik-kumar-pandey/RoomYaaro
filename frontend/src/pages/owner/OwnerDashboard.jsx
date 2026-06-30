import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { listingAPI } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loader from '../../components/Loader';

/* Stat card */
const StatCard = ({ label, value, color, icon, linkTo, delay = 0 }) => (
  <Link
    to={linkTo || '#'}
    className="card p-6 group hover:-translate-y-1 transition-all duration-300 block"
    style={{ animation: `fadeUp .5s ${delay}ms ease both`, opacity: 0, animationFillMode: 'forwards' }}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.bg}`}>
        {icon}
      </div>
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
        className="text-slate-700 group-hover:text-slate-400 transition-colors">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
      </svg>
    </div>
    <p className={`text-3xl font-black ${color.text} tabular-nums mb-1`}>{value ?? 0}</p>
    <p className="text-sm text-slate-500">{label}</p>
  </Link>
);

const OwnerDashboard = () => {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listingAPI.getOwnerDashboard()
      .then(({ data }) => setStats(data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

  const cards = [
    {
      label: 'Total Listings',
      value: stats?.totalListings,
      linkTo: '/owner/listings',
      color: { bg: 'bg-primary-500/15', text: 'text-primary-400' },
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#818cf8" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
      ),
    },
    {
      label: 'Available Rooms',
      value: stats?.availableRooms,
      linkTo: '/owner/listings',
      color: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#34d399" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
    },
    {
      label: 'Filled Rooms',
      value: stats?.filledRooms,
      linkTo: '/owner/listings',
      color: { bg: 'bg-slate-500/15', text: 'text-slate-400' },
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
      ),
    },
    {
      label: 'Pending Interests',
      value: stats?.pendingInterests,
      linkTo: '/owner/interests',
      color: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fbbf24" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
    },
    {
      label: 'Accepted Requests',
      value: stats?.acceptedRequests,
      linkTo: '/owner/chat',
      color: { bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#67e8f9" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
      ),
    },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8" style={{ animation: 'fadeUp .4s ease both' }}>
        <p className="section-label mb-1">Owner</p>
        <h1 className="text-3xl font-black text-white">Dashboard</h1>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8" style={{ animation: 'fadeUp .4s .1s ease both', opacity:0, animationFillMode:'forwards' }}>
        <Link to="/owner/create-listing" className="btn-primary text-sm">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          New Listing
        </Link>
        <Link to="/owner/interests" className="btn-secondary text-sm">Review Interests</Link>
        <Link to="/owner/chat" className="btn-secondary text-sm">Open Chat</Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((c, i) => (
          <StatCard key={c.label} {...c} delay={i * 60} />
        ))}
      </div>

      {/* Tip banner */}
      <div className="mt-8 card p-5 flex items-center gap-4"
        style={{ animation: 'fadeUp .5s .4s ease both', opacity:0, animationFillMode:'forwards' }}>
        <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
          <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#fbbf24" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Tenants with score &gt; 80 trigger an email notification</p>
          <p className="text-xs text-slate-500 mt-0.5">High-quality matches are highlighted automatically in your Interests tab.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
