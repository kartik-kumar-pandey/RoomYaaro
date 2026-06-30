import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loader from '../../components/Loader';

const OwnerListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('ALL');
  const toast    = useToast();
  const navigate = useNavigate();

  const fetchListings = () => {
    setLoading(true);
    listingAPI.getOwnerListings()
      .then(({ data }) => setListings(data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchListings(); }, []);

  const handleFill = async (id) => {
    try {
      await listingAPI.markFilled(id);
      toast.success('Listing marked as filled');
      fetchListings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing? This action cannot be undone.')) return;
    try {
      await listingAPI.delete(id);
      toast.success('Listing deleted');
      fetchListings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const tabs = ['ALL', 'AVAILABLE', 'FILLED'];
  const filtered = filter === 'ALL' ? listings : listings.filter(l => l.status === filter);

  const availableCount = listings.filter(l => l.status === 'AVAILABLE').length;
  const filledCount    = listings.filter(l => l.status === 'FILLED').length;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4" style={{ animation: 'fadeUp .4s ease both' }}>
        <div>
          <p className="section-label mb-1">Owner</p>
          <h1 className="text-3xl font-black text-white">My Listings</h1>
        </div>
        <button
          onClick={() => navigate('/owner/create-listing')}
          className="btn-primary"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          New Listing
        </button>
      </div>

      {/* Stats Row */}
      {listings.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6" style={{ animation: 'fadeUp .4s .05s ease both', opacity: 0, animationFillMode: 'forwards' }}>
          {[
            { label: 'Total', value: listings.length, color: 'text-white' },
            { label: 'Available', value: availableCount, color: 'text-emerald-400' },
            { label: 'Filled',    value: filledCount,    color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

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
            {t} ({t === 'ALL' ? listings.length : listings.filter(l => l.status === t).length})
          </button>
        ))}
      </div>

      {loading ? <Loader /> : filtered.length === 0 ? (
        <div className="card p-14 text-center">
          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-600">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
            </svg>
          </div>
          <p className="text-slate-400 font-medium">No listings here</p>
          <button onClick={() => navigate('/owner/create-listing')} className="btn-primary mt-5 text-sm">Create Your First Listing</button>
        </div>
      ) : (
        <div className="space-y-4 stagger-enter">
          {filtered.map(listing => {
            const photo = listing.photos?.[0]?.url;
            const isAvailable = listing.status === 'AVAILABLE';
            const interestCount = listing._count?.interestRequests ?? 0;
            return (
              <div key={listing.id} className="card p-5 hover:border-white/12 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-24 h-20 rounded-xl overflow-hidden bg-white/5 border border-white/8 flex-shrink-0">
                    {photo
                      ? <img src={photo} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                          </svg>
                        </div>
                    }
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-white truncate">{listing.title}</h3>
                      <span className={`badge ${isAvailable ? 'badge-success' : 'badge-muted'}`}>
                        {listing.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-1">
                      {listing.location}
                      <span className="text-slate-600 mx-2">·</span>
                      <span className="text-primary-400 font-semibold">₹{listing.rent?.toLocaleString()}/mo</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {interestCount} interested tenant{interestCount !== 1 ? 's' : ''}
                      <span className="text-slate-600 mx-2">·</span>
                      {listing.roomType?.replace('_', ' ')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isAvailable && (
                      <button onClick={() => handleFill(listing.id)} className="btn-secondary text-xs py-2 px-3">
                        Mark Filled
                      </button>
                    )}
                    <button onClick={() => navigate(`/owner/interests`)} className="btn-secondary text-xs py-2 px-3">
                      Interests
                    </button>
                    <button onClick={() => handleDelete(listing.id)} className="btn-danger text-xs py-2 px-3">
                      Delete
                    </button>
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

export default OwnerListings;
