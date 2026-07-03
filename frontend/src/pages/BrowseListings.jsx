import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingAPI, tenantAPI } from '../services/api';
import PublicLayout from '../layouts/PublicLayout';
import ListingCard from '../components/ListingCard';
import { useAuth } from '../contexts/AuthContext';

/* ─── Icons ─── */
const FilterIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>
);
const LocationIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
);

/* ─── Skeleton card ─── */
const SkeletonCard = () => (
  <div className="card overflow-hidden animate-pulse">
    <div className="h-48 skeleton rounded-none" />
    <div className="p-4 space-y-3">
      <div className="h-4 skeleton rounded-lg w-3/4" />
      <div className="h-3 skeleton rounded-lg w-1/2" />
      <div className="h-3 skeleton rounded-lg w-2/3" />
      <div className="flex gap-2 pt-1">
        <div className="h-6 skeleton rounded-full w-20" />
        <div className="h-6 skeleton rounded-full w-24" />
      </div>
      <div className="h-9 skeleton rounded-xl w-full mt-2" />
    </div>
  </div>
);

/* ─── Cold-start banner ─── */
const SlowLoadBanner = ({ show }) => {
  if (!show) return null;
  return (
    <div className="mb-6 px-4 py-3 rounded-xl border border-amber-500/20 bg-amber-500/8 flex items-start gap-3"
      style={{ animation: 'fadeUp .4s ease both' }}>
      <svg className="text-amber-400 flex-shrink-0 mt-0.5" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      </svg>
      <div>
        <p className="text-amber-400 text-sm font-semibold">Backend is waking up…</p>
        <p className="text-amber-400/70 text-xs mt-0.5">
          The server was idle. First load may take 20–40 seconds on the free tier. Hang tight!
        </p>
      </div>
    </div>
  );
};

/* ─── Location pre-fill badge ─── */
const LocationBadge = ({ location, onClear }) => (
  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary-500/30 bg-primary-500/10 text-primary-400 text-xs font-medium mb-4"
    style={{ animation: 'fadeUp .3s ease both' }}>
    <LocationIcon />
    Showing rooms near <strong>{location}</strong> — your saved preference
    <button onClick={onClear} className="ml-1 hover:text-white transition-colors" title="Clear location filter">
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  </div>
);

/* ─── Main component ─── */
const BrowseListings = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [listings, setListings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [slowLoad, setSlowLoad]         = useState(false);
  const [showFilters, setShowFilters]   = useState(false);
  const [prefLocation, setPrefLocation] = useState('');  // tenant's saved preference
  const [filters, setFilters] = useState({
    location: '', minRent: '', maxRent: '', roomType: '', furnishing: '', sort: 'newest',
  });
  const [pagination, setPagination] = useState({});

  /* ── 1. If logged-in tenant, fetch their preferredLocation and pre-fill filter ── */
  useEffect(() => {
    if (user?.role === 'TENANT') {
      tenantAPI.getProfile()
        .then(({ data }) => {
          const loc = data.data?.tenantProfile?.preferredLocation || '';
          if (loc) {
            setPrefLocation(loc);
            setFilters(f => ({ ...f, location: loc }));
          }
        })
        .catch(() => {}); // silently ignore — guest/owner doesn't need this
    }
  }, [user]);

  /* ── 2. Fetch listings (re-runs whenever filters change via search) ── */
  const fetchListings = useCallback(async (page = 1, overrideFilters = null) => {
    setLoading(true);

    // Show cold-start warning after 5 seconds of loading
    const slowTimer = setTimeout(() => setSlowLoad(true), 5000);

    try {
      const params = { ...(overrideFilters ?? filters), page };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await listingAPI.getAll(params);
      setListings(data.data.listings);
      setPagination(data.data.pagination);
    } catch {
      setListings([]);
    } finally {
      clearTimeout(slowTimer);
      setSlowLoad(false);
      setLoading(false);
    }
  }, [filters]);

  /* ── 3. Initial load — wait for profile fetch to complete first ── */
  useEffect(() => {
    // Small delay so profile-location pre-fill can run first (for tenants)
    const t = setTimeout(() => fetchListings(), user?.role === 'TENANT' ? 300 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchListings(); };
  const set = (key) => (e) => setFilters(f => ({ ...f, [key]: e.target.value }));

  const clearLocationPref = () => {
    setPrefLocation('');
    const updated = { ...filters, location: '' };
    setFilters(updated);
    fetchListings(1, updated);
  };

  const isUsingPref = prefLocation && filters.location === prefLocation;

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Header */}
        <div className="flex items-end justify-between mb-6 sm:mb-8" style={{ animation: 'fadeUp .5s ease both' }}>
          <div>
            <p className="section-label mb-2">All Properties</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white">Browse Rooms</h1>
            {isUsingPref && (
              <p className="text-slate-500 text-sm mt-1">
                Filtered to match your location preference
              </p>
            )}
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border
              ${showFilters
                ? 'bg-primary-500/15 text-primary-400 border-primary-500/30'
                : 'glass text-slate-400 border-white/10 hover:text-white hover:border-white/20'
              }`}
          >
            <FilterIcon />
            Filters
          </button>
        </div>

        {/* Location preference badge */}
        {isUsingPref && !showFilters && (
          <LocationBadge location={prefLocation} onClear={clearLocationPref} />
        )}

        {/* Cold-start warning */}
        <SlowLoadBanner show={slowLoad} />

        {/* Expanded filter bar */}
        <form
          onSubmit={handleSearch}
          className={`overflow-hidden transition-all duration-400 ease-in-out ${showFilters ? 'max-h-[400px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}
        >
          <div className="card p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><LocationIcon /></span>
                <input className="input-field pl-8" placeholder="Location or city" value={filters.location} onChange={set('location')} />
              </div>
              <input className="input-field" placeholder="Min Rent (₹)" type="number" value={filters.minRent} onChange={set('minRent')} />
              <input className="input-field" placeholder="Max Rent (₹)" type="number" value={filters.maxRent} onChange={set('maxRent')} />
              <select className="input-field" value={filters.roomType} onChange={set('roomType')}>
                <option value="">All Room Types</option>
                {['SINGLE', 'DOUBLE', 'SHARED', 'STUDIO', 'ENTIRE_FLAT'].map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
              <select className="input-field" value={filters.sort} onChange={set('sort')}>
                <option value="newest">Newest First</option>
                <option value="rent-low">Rent: Low → High</option>
                <option value="rent-high">Rent: High → Low</option>
              </select>
              <button type="submit" className="btn-primary flex items-center justify-center gap-2">
                <SearchIcon /> Search
              </button>
            </div>
          </div>
        </form>

        {/* Quick search bar (shown when filter panel is hidden) */}
        {!showFilters && (
          <form onSubmit={handleSearch} className="flex gap-3 mb-6 sm:mb-8"
            style={{ animation: 'fadeUp .5s .1s ease both', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><SearchIcon /></span>
              <input
                className="input-field pl-10"
                placeholder="Search by location or city…"
                value={filters.location}
                onChange={set('location')}
              />
            </div>
            <select className="input-field w-36 sm:w-40" value={filters.sort} onChange={set('sort')}>
              <option value="newest">Newest</option>
              <option value="rent-low">Rent Low</option>
              <option value="rent-high">Rent High</option>
            </select>
            <button type="submit" className="btn-primary px-4 sm:px-5">Search</button>
          </form>
        )}

        {/* Results */}
        {loading ? (
          <div>
            <div className="h-4 skeleton rounded-lg w-32 mb-5" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-slate-600">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <p className="text-slate-400 font-medium">No listings found</p>
            <p className="text-slate-600 text-sm mt-1">
              {isUsingPref
                ? `No rooms near "${prefLocation}" yet. `
                : 'Try adjusting your filters.'}
            </p>
            {isUsingPref && (
              <button
                onClick={clearLocationPref}
                className="mt-4 btn-secondary text-sm"
              >
                Show all rooms nationwide
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-5" style={{ animation: 'fadeIn .4s ease both' }}>
              {listings.length} listing{listings.length !== 1 ? 's' : ''} found
              {isUsingPref && <span className="text-primary-400/70"> · near {prefLocation}</span>}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 stagger-enter">
              {listings.map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onClick={() => navigate(`/listings/${listing.id}`)}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: pagination.pages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => fetchListings(i + 1)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-all duration-200 ${
                      pagination.page === i + 1
                        ? 'bg-primary-500 text-white shadow-glow'
                        : 'glass text-slate-400 hover:text-white hover:bg-white/8'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
};

export default BrowseListings;
