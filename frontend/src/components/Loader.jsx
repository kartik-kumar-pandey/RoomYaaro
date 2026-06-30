const Loader = ({ fullScreen = false, size = 'md' }) => {
  const sizes = { sm: 48, md: 64, lg: 80 };
  const s = sizes[size] || 64;
  const r = (s / 2) - 6;
  const circ = 2 * Math.PI * r;

  const ring = (
    <div className="flex flex-col items-center gap-3">
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className="animate-spin-slow">
        <circle
          cx={s / 2} cy={s / 2} r={r}
          fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth="5"
        />
        <circle
          cx={s / 2} cy={s / 2} r={r}
          fill="none"
          stroke="url(#loader-grad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * 0.25}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
        <defs>
          <linearGradient id="loader-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1"/>
            <stop offset="100%" stopColor="#34d399"/>
          </linearGradient>
        </defs>
      </svg>
      <p className="text-xs text-slate-500 tracking-wide animate-pulse">Loading…</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        {ring}
      </div>
    );
  }
  return <div className="flex justify-center py-12">{ring}</div>;
};

export default Loader;
