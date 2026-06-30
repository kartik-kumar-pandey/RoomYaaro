import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenantAPI, interestAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import ListingCard from '../../components/ListingCard';
import Loader from '../../components/Loader';

const TenantRecommendations = () => {
  const [listings, setListings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(null);
  const navigate = useNavigate();
  const toast    = useToast();

  useEffect(() => {
    tenantAPI.getRecommendations(20)
      .then(({ data }) => setListings(data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleInterest = async (listingId) => {
    setSending(listingId);
    try {
      await interestAPI.create(listingId);
      toast.success('Interest request sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send interest');
    } finally {
      setSending(null);
    }
  };

  const avgScore = listings.length
    ? Math.round(listings.reduce((a, l) => a + (l.compatibility?.score || 0), 0) / listings.length)
    : 0;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4" style={{ animation: 'fadeUp .4s ease both' }}>
        <div>
          <p className="section-label mb-1">AI-Powered</p>
          <h1 className="text-3xl font-black text-white">Recommended Rooms</h1>
        </div>
        {listings.length > 0 && (
          <div className="card px-5 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="text-center">
              <p className="text-xs text-slate-500">Avg Score</p>
              <p className={`text-xl font-black ${avgScore >= 80 ? 'text-emerald-400' : avgScore >= 60 ? 'text-amber-400' : 'text-primary-400'}`}>
                {avgScore}%
              </p>
            </div>
            <div className="w-px h-8 bg-white/8" />
            <div className="text-center">
              <p className="text-xs text-slate-500">Matches</p>
              <p className="text-xl font-black text-white">{listings.length}</p>
            </div>
          </div>
        )}
      </div>

      {loading ? <Loader /> : listings.length === 0 ? (
        <div className="card p-14 text-center">
          <div className="w-16 h-16 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" className="text-primary-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <p className="text-white font-semibold text-lg mb-1">No recommendations yet</p>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">Complete your profile with location and budget preferences so our AI can rank the best rooms for you.</p>
          <button onClick={() => navigate('/tenant/profile')} className="btn-primary mt-5 text-sm">Update Profile</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 stagger-enter">
          {listings.map(listing => (
            <ListingCard
              key={listing.id}
              listing={listing}
              compatibility={listing.compatibility}
              onClick={() => navigate(`/listings/${listing.id}`)}
              showInterest={sending === null ? handleInterest : null}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default TenantRecommendations;
