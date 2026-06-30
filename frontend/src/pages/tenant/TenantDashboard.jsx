import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tenantAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import ListingCard from '../../components/ListingCard';
import Loader from '../../components/Loader';

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

const TenantDashboard = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    tenantAPI.getDashboard()
      .then(({ data }) => setData(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

  const stats = [
    {
      label: 'Pending Requests',
      value: data?.pendingRequests?.length || 0,
      linkTo: '/tenant/interests',
      color: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
      icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fbbf24" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    },
    {
      label: 'Accepted',
      value: data?.acceptedRequests?.length || 0,
      linkTo: '/tenant/chat',
      color: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
      icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#34d399" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    },
    {
      label: 'Recommendations',
      value: data?.recommendations?.length || 0,
      linkTo: '/tenant/recommendations',
      color: { bg: 'bg-primary-500/15', text: 'text-primary-400' },
      icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#818cf8" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>,
    },
  ];

  return (
    <DashboardLayout>
      {/* Welcome banner */}
      <div className="card p-6 mb-8 relative overflow-hidden"
        style={{ animation: 'fadeUp .4s ease both', background: 'linear-gradient(135deg, rgba(99,102,241,.12) 0%, rgba(16,185,129,.06) 100%)' }}>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <svg width="120" height="120" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth=".5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
        </div>
        <div className="relative z-10">
          <p className="section-label mb-2">Welcome back</p>
          <h1 className="text-2xl font-black text-white mb-1">{user?.name?.split(' ')[0] || 'Tenant'}</h1>
          <p className="text-slate-400 text-sm">Your AI-powered room search dashboard.</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8" style={{ animation: 'fadeUp .4s .1s ease both', opacity:0, animationFillMode:'forwards' }}>
        <Link to="/tenant/listings" className="btn-primary text-sm">Browse Rooms</Link>
        <Link to="/tenant/profile" className="btn-secondary text-sm">Edit Profile</Link>
        <Link to="/tenant/recommendations" className="btn-secondary text-sm">View Recommendations</Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 80} />)}
      </div>

      {/* Recommendations */}
      <section className="mb-10" style={{ animation: 'fadeUp .5s .3s ease both', opacity:0, animationFillMode:'forwards' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Recommended For You</h2>
          <Link to="/tenant/recommendations" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
            View all
          </Link>
        </div>
        {data?.recommendations?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-enter">
            {data.recommendations.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                compatibility={listing.compatibility}
                onClick={() => navigate(`/listings/${listing.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#818cf8" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <p className="text-slate-400 font-medium">Complete your profile to get recommendations</p>
            <Link to="/tenant/profile" className="btn-primary text-sm mt-4 inline-flex">Set up Profile</Link>
          </div>
        )}
      </section>

      {/* Latest listings */}
      {data?.latestListings?.length > 0 && (
        <section style={{ animation: 'fadeUp .5s .5s ease both', opacity:0, animationFillMode:'forwards' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white">Latest Listings</h2>
            <Link to="/tenant/listings" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">Browse all</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-enter">
            {data.latestListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onClick={() => navigate(`/listings/${listing.id}`)}
              />
            ))}
          </div>
        </section>
      )}
    </DashboardLayout>
  );
};

export default TenantDashboard;
