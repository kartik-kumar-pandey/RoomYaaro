import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingAPI } from '../services/api';
import PublicLayout from '../layouts/PublicLayout';
import ListingCard from '../components/ListingCard';
import Loader from '../components/Loader';

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

const BrowseListings = () => {
  const [listings, setListings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: '', minRent: '', maxRent: '', roomType: '', furnishing: '', keyword: '', sort: 'newest',
  });
  const [pagination, setPagination] = useState({});
  const navigate = useNavigate();

  const fetchListings = async (page = 1) => {
    setLoading(true);
    try {
      const params = { ...filters, page };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await listingAPI.getAll(params);
      setListings(data.data.listings);
      setPagination(data.data.pagination);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchListings(); };
  const set = (key) => (e) => setFilters(f => ({ ...f, [key]: e.target.value }));

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-end justify-between mb-8" style={{ animation: 'fadeUp .5s ease both' }}>
          <div>
            <p className="section-label mb-2">All Properties</p>
            <h1 className="text-4xl font-black text-white">Browse Rooms</h1>
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

        {/* Filter bar */}
        <form
          onSubmit={handleSearch}
          className={`overflow-hidden transition-all duration-400 ease-in-out ${showFilters ? 'max-h-96 opacity-100 mb-8' : 'max-h-0 opacity-0'}`}
        >
          <div className="card p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  </svg>
                </span>
                <input className="input-field pl-8" placeholder="Location" value={filters.location} onChange={set('location')} />
              </div>
              <input className="input-field" placeholder="Min Rent (₹)" type="number" value={filters.minRent} onChange={set('minRent')} />
              <input className="input-field" placeholder="Max Rent (₹)" type="number" value={filters.maxRent} onChange={set('maxRent')} />
              <select className="input-field" value={filters.roomType} onChange={set('roomType')}>
                <option value="">All Room Types</option>
                {['SINGLE', 'DOUBLE', 'SHARED', 'STUDIO', 'ENTIRE_FLAT'].map((t) => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
              <select className="input-field" value={filters.sort} onChange={set('sort')}>
                <option value="newest">Newest First</option>
                <option value="rent-low">Rent: Low to High</option>
                <option value="rent-high">Rent: High to Low</option>
              </select>
              <button type="submit" className="btn-primary flex items-center justify-center gap-2">
                <SearchIcon />
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Quick search (always visible) */}
        {!showFilters && (
          <form onSubmit={handleSearch} className="flex gap-3 mb-8" style={{ animation: 'fadeUp .5s .1s ease both', opacity:0, animationFillMode:'forwards' }}>
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><SearchIcon /></span>
              <input
                className="input-field pl-10"
                placeholder="Search by location..."
                value={filters.location}
                onChange={set('location')}
              />
            </div>
            <select className="input-field w-40" value={filters.sort} onChange={set('sort')}>
              <option value="newest">Newest</option>
              <option value="rent-low">Rent Low</option>
              <option value="rent-high">Rent High</option>
            </select>
            <button type="submit" className="btn-primary px-5">Search</button>
          </form>
        )}

        {/* Results */}
        {loading ? (
          <Loader />
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-slate-600">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <p className="text-slate-400 font-medium">No listings found</p>
            <p className="text-slate-600 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-5" style={{ animation: 'fadeIn .4s ease both' }}>
              {listings.length} listing{listings.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-enter">
              {listings.map((listing) => (
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
