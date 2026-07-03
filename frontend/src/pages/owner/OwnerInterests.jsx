import { useState, useEffect } from 'react';
import { interestAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loader from '../../components/Loader';

/* Compact score ring */
const MiniRing = ({ score }) => {
  const size = 48; const r = 18; const circ = 2 * Math.PI * r;
  const offset = circ - circ * (score / 100);
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#6366f1';
  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="4"/>
        <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.34,1.56,.64,1)' }}/>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-black text-white tabular-nums">{score}</span>
      </div>
    </div>
  );
};

const statusBadge = (s) => {
  if (s === 'PENDING')  return 'badge badge-warning';
  if (s === 'ACCEPTED') return 'badge badge-success';
  return 'badge badge-danger';
};

const OwnerInterests = () => {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('ALL');
  const toast = useToast();

  const fetchData = () => {
    interestAPI.getOwner()
      .then(({ data }) => setInterests(data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (id, action) => {
    try {
      await interestAPI[action](id);
      toast.success(`Interest ${action === 'accept' ? 'accepted' : 'rejected'}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const tabs = ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'];
  const filtered = filter === 'ALL' ? interests : interests.filter(i => i.status === filter);

  return (
    <DashboardLayout>
      <div className="mb-8" style={{ animation: 'fadeUp .4s ease both' }}>
        <p className="section-label mb-1">Owner</p>
        <h1 className="text-3xl font-black text-white">Interested Tenants</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap" style={{ animation: 'fadeUp .4s .1s ease both', opacity:0, animationFillMode:'forwards' }}>
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              filter === t
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'glass text-slate-500 border border-white/8 hover:text-slate-300'
            }`}
          >
            {t} {t === 'ALL' ? `(${interests.length})` : `(${interests.filter(i => i.status === t).length})`}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-600">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <p className="text-slate-400 font-medium">No interest requests</p>
          <p className="text-slate-600 text-sm mt-1">Tenants who express interest in your listings will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4 stagger-enter">
          {filtered.map((interest) => (
            <div key={interest.id} className="card p-5 hover:border-white/12 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                {/* Avatar + info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-sm font-bold text-primary-400 flex-shrink-0">
                    {interest.tenant?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-white">{interest.tenant?.name}</h3>
                      <span className={statusBadge(interest.status)}>{interest.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-1">{interest.tenant?.email} · {interest.tenant?.phone}</p>
                    <p className="text-sm text-slate-400">
                      For: <span className="text-slate-200 font-medium">{interest.listing?.title}</span>
                      <span className="text-slate-600 mx-1">·</span>
                      <span className="text-slate-500">{interest.listing?.location}</span>
                    </p>
                  </div>
                </div>

                {/* Score ring + actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {interest.compatibility && (
                    <div className="text-center">
                      <MiniRing score={interest.compatibility.score} />
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Match</p>
                    </div>
                  )}

                  {interest.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(interest.id, 'accept')} className="btn-success text-sm py-2 px-4">
                        Accept
                      </button>
                      <button onClick={() => handleAction(interest.id, 'reject')} className="btn-danger text-sm py-2 px-4">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Compatibility explanation */}
              {interest.compatibility?.explanation && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    <span className="text-primary-400 font-bold uppercase tracking-wider text-[10px]">RoomYaaro Match™: </span>
                    {interest.compatibility.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default OwnerInterests;
