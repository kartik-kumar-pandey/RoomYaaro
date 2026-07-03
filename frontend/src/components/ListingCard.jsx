/* ─── Score Ring SVG ─── */
const ScoreRing = ({ score, size = 64 }) => {
  const r    = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const offset = circ - circ * (score / 100);
  const color  = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#6366f1';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle className="score-ring-track" cx={size/2} cy={size/2} r={r} strokeWidth="5" />
      <circle
        className="score-ring-fill"
        cx={size/2} cy={size/2} r={r}
        stroke={color} strokeWidth="5"
        strokeDasharray={circ}
        strokeDashoffset={offset}
      />
    </svg>
  );
};

const ListingCard = ({ listing, compatibility, onClick, showInterest }) => {
  const photo = listing.photos?.[0]?.url;
  const score = compatibility?.score ?? listing.compatibility?.score;
  const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-slate-400';
  const scoreBg    = score >= 80 ? 'bg-emerald-500/15 border-emerald-500/25' : score >= 60 ? 'bg-amber-500/15 border-amber-500/25' : 'bg-white/5 border-white/10';

  return (
    <div
      onClick={onClick}
      className="card group cursor-pointer hover:-translate-y-2 hover:shadow-glow-lg transition-all duration-300"
    >
      {/* Photo */}
      <div className="relative h-48 overflow-hidden bg-slate-800/60">
        {photo ? (
          <img
            src={photo}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <span className="text-xs">No photo</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />

        {/* Score badge */}
        {score != null && (
          <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${scoreBg} backdrop-blur-sm`}>
            <ScoreRing score={score} size={22} />
            <span className={`text-xs font-bold ${scoreColor}`}>{score}%</span>
          </div>
        )}

        {/* Filled badge */}
        {listing.status === 'FILLED' && (
          <span className="absolute top-3 left-3 badge badge-danger">Filled</span>
        )}

        {/* Room type pill */}
        <span className="absolute bottom-3 left-3 badge badge-muted capitalize">
          {listing.roomType?.replace('_', ' ').toLowerCase()}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-white truncate mb-1 group-hover:text-primary-300 transition-colors">{listing.title}</h3>

        <div className="flex items-center gap-1 text-slate-500 text-sm mb-4">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span className="truncate">{listing.location}</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-black text-white">
            ₹{listing.rent?.toLocaleString()}
            <span className="text-sm text-slate-500 font-normal">/mo</span>
          </span>
          {listing.furnishingStatus && (
            <span className="text-xs text-slate-500 capitalize">
              {listing.furnishingStatus.replace('_', ' ').toLowerCase()}
            </span>
          )}
        </div>

        {compatibility?.explanation && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed border-t border-white/5 pt-3 mb-3">
            {compatibility.explanation}
          </p>
        )}

        {showInterest && (
          <button
            onClick={(e) => { e.stopPropagation(); showInterest(listing.id); }}
            className="btn-primary w-full text-sm py-2.5"
          >
            Express Interest
          </button>
        )}
      </div>
    </div>
  );
};

export default ListingCard;
