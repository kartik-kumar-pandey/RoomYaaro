import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interestAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loader from '../../components/Loader';

const statusConfig = {
  PENDING:  { cls: 'badge-warning',  label: 'Pending' },
  ACCEPTED: { cls: 'badge-success',  label: 'Accepted' },
  REJECTED: { cls: 'badge-danger',   label: 'Rejected' },
};

const TenantInterests = () => {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('ALL');
  const toast    = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    interestAPI.getTenant()
      .then(({ data }) => setInterests(data.data))
      .catch(() => toast.error('Failed to load interests'))
      .finally(() => setLoading(false));
  }, []);

  const tabs = ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'];
  const filtered = filter === 'ALL' ? interests : interests.filter(i => i.status === filter);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8" style={{ animation: 'fadeUp .4s ease both' }}>
        <p className="section-label mb-1">Tenant</p>
        <h1 className="text-3xl font-black text-white">My Interest Requests</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap" style={{ animation: 'fadeUp .4s .1s ease both', opacity: 0, animationFillMode: 'forwards' }}>
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              filter === t
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'glass text-slate-500 border border-white/8 hover:text-slate-300'
            }`}
          >
            {t} ({t === 'ALL' ? interests.length : interests.filter(i => i.status === t).length})
          </button>
        ))}
      </div>

      {loading ? <Loader /> : filtered.length === 0 ? (
        <div className="card p-14 text-center">
          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-600">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"/>
            </svg>
          </div>
          <p className="text-slate-400 font-medium">No requests found</p>
          <p className="text-slate-600 text-sm mt-1">Browse listings and express your interest to see them here.</p>
          <button onClick={() => navigate('/listings')} className="btn-primary mt-5 text-sm">Browse Listings</button>
        </div>
      ) : (
        <div className="space-y-4 stagger-enter">
          {filtered.map(interest => {
            const { cls, label } = statusConfig[interest.status] || {};
            const photo = interest.listing?.photos?.[0]?.url;
            return (
              <div key={interest.id} className="card p-5 hover:border-white/12 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 border border-white/8 flex-shrink-0">
                    {photo
                      ? <img src={photo} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                          </svg>
                        </div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-white truncate">{interest.listing?.title}</h3>
                      <span className={`badge ${cls}`}>{label}</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-0.5">
                      {interest.listing?.location}
                      <span className="text-slate-600 mx-2">·</span>
                      <span className="text-primary-400 font-semibold">₹{interest.listing?.rent?.toLocaleString()}/mo</span>
                    </p>
                    <p className="text-xs text-slate-500">Owner: <span className="text-slate-400">{interest.listing?.owner?.name}</span></p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {interest.status === 'ACCEPTED' && interest.chatRoom && (
                      <button
                        onClick={() => navigate('/tenant/chat')}
                        className="btn-success text-sm py-2 px-4"
                      >
                        Open Chat
                      </button>
                    )}
                    {interest.status === 'ACCEPTED' && !interest.chatRoom && (
                      <span className="text-xs text-emerald-400 font-medium">Chat incoming</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default TenantInterests;
