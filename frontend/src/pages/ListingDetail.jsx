import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingAPI, compatibilityAPI, interestAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import PublicLayout from '../layouts/PublicLayout';
import Loader from '../components/Loader';

/* ─── Animated compatibility ring ─── */
const CompatibilityRing = ({ score, explanation }) => {
  const r    = 44;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);
  const color  = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#6366f1';
  const label  = score >= 80 ? 'Strong Match' : score >= 60 ? 'Decent Match' : 'Weak Match';
  const badgeCls = score >= 80 ? 'badge-success' : score >= 60 ? 'badge-warning' : 'badge-primary';

  useEffect(() => {
    const t = setTimeout(() => setOffset(circ - circ * (score / 100)), 150);
    return () => clearTimeout(t);
  }, [score, circ]);

  return (
    <div className="card p-6 flex flex-col sm:flex-row items-center gap-6">
      {/* Ring */}
      <div className="relative flex-shrink-0">
        <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="7" />
          <circle
            cx="55" cy="55" r={r}
            fill="none" stroke={color} strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset .9s cubic-bezier(.34,1.56,.64,1)' }}
          />
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-white tabular-nums">{score}</span>
          <span className="text-xs text-slate-500">/ 100</span>
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 text-center sm:text-left">
        <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
          <span className={`badge ${badgeCls}`}>{label}</span>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">{explanation}</p>
      </div>
    </div>
  );
};

const detailItems = (listing) => [
  { label: 'Room Type',      value: listing.roomType?.replace(/_/g, ' ') },
  { label: 'Furnishing',     value: listing.furnishingStatus?.replace(/_/g, ' ') },
  { label: 'Available From', value: new Date(listing.availableFrom).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) },
  { label: 'Status',         value: listing.status },
];

const ListingDetail = () => {
  const { id } = useParams();
  const [listing, setListing]           = useState(null);
  const [compatibility, setCompatibility] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [interestLoading, setInterestLoading] = useState(false);
  const [activePhoto, setActivePhoto]   = useState(0);
  const { user } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await listingAPI.getById(id);
        setListing(data.data);
        if (user?.role === 'TENANT') {
          try {
            const scoreRes = await compatibilityAPI.getScore(id);
            setCompatibility(scoreRes.data.data);
          } catch { /* profile may be incomplete */ }
        }
      } catch {
        toast.error('Listing not found');
        navigate('/listings');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, user]);

  const handleInterest = async () => {
    setInterestLoading(true);
    try {
      await interestAPI.create(id);
      toast.success('Interest submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit interest');
    } finally {
      setInterestLoading(false);
    }
  };

  if (loading) return <PublicLayout><Loader fullScreen /></PublicLayout>;
  if (!listing) return null;

  const photos = listing.photos || [];

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-200 transition-colors mb-6 group"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back to listings
        </button>

        {/* Photo gallery */}
        <div className="rounded-2xl overflow-hidden mb-8" style={{ animation: 'fadeUp .5s ease both' }}>
          {photos.length > 0 ? (
            <div className="space-y-2">
              {/* Main photo */}
              <div className="relative h-80 sm:h-96 overflow-hidden bg-slate-800 rounded-2xl">
                <img
                  src={photos[activePhoto]?.url}
                  alt={listing.title}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
              </div>
              {/* Thumbnail strip */}
              {photos.length > 1 && (
                <div className="flex gap-2">
                  {photos.map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => setActivePhoto(i)}
                      className={`flex-1 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        i === activePhoto ? 'border-primary-500' : 'border-transparent opacity-50 hover:opacity-80'
                      }`}
                    >
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-72 rounded-2xl bg-slate-800/60 flex flex-col items-center justify-center text-slate-600 gap-3">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p>No photos available</p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & location */}
            <div style={{ animation: 'fadeUp .5s .1s ease both', opacity:0, animationFillMode:'forwards' }}>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-3xl font-black text-white">{listing.title}</h1>
                  <div className="flex items-center gap-1.5 text-slate-400 text-sm mt-1">
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    </svg>
                    {listing.location}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-white">₹{listing.rent?.toLocaleString()}</p>
                  <p className="text-sm text-slate-500">per month</p>
                </div>
              </div>
            </div>

            {/* Compatibility ring */}
            {compatibility && (
              <div style={{ animation: 'fadeUp .5s .2s ease both', opacity:0, animationFillMode:'forwards' }}>
                <CompatibilityRing score={compatibility.score} explanation={compatibility.explanation} />
              </div>
            )}

            {/* Detail grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ animation: 'fadeUp .5s .3s ease both', opacity:0, animationFillMode:'forwards' }}>
              {detailItems(listing).map((item) => (
                <div key={item.label} className="card p-4 text-center">
                  <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                  <p className="font-semibold text-white capitalize text-sm">{item.value?.toLowerCase()}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {listing.description && (
              <div className="card p-6" style={{ animation: 'fadeUp .5s .4s ease both', opacity:0, animationFillMode:'forwards' }}>
                <h3 className="font-bold text-white mb-3">About this room</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{listing.description}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4" style={{ animation: 'fadeUp .5s .2s ease both', opacity:0, animationFillMode:'forwards' }}>
            {/* Owner card */}
            <div className="card p-5">
              <p className="section-label mb-3">Listed by</p>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-sm font-bold text-primary-400">
                  {listing.owner?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white">{listing.owner?.name}</p>
                  <p className="text-xs text-slate-500">Property Owner</p>
                </div>
              </div>

              {user?.role === 'TENANT' && listing.status === 'AVAILABLE' ? (
                <button
                  onClick={handleInterest}
                  className="btn-primary w-full"
                  disabled={interestLoading}
                >
                  {interestLoading ? 'Submitting…' : 'Express Interest'}
                </button>
              ) : listing.status === 'FILLED' ? (
                <div className="text-center py-3 badge-danger w-full rounded-xl border border-red-500/20 bg-red-500/10">
                  <p className="text-sm font-semibold text-red-400">This room is filled</p>
                </div>
              ) : !user ? (
                <a href="/login" className="btn-secondary w-full text-center block">
                  Sign in to express interest
                </a>
              ) : null}
            </div>

            {/* Status card */}
            <div className="card p-5">
              <p className="section-label mb-3">Listing Info</p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className={`font-medium ${listing.status === 'AVAILABLE' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {listing.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Available From</span>
                  <span className="text-white font-medium">
                    {new Date(listing.availableFrom).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                  </span>
                </div>
                {listing.furnishingStatus && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Furnishing</span>
                    <span className="text-white font-medium capitalize">{listing.furnishingStatus.replace('_',' ').toLowerCase()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ListingDetail;
