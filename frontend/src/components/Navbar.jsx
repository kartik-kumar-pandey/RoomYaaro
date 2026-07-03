import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

/* ── SVG Icon components ── */
const HomeIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
  </svg>
);
const ChatIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
  </svg>
);
const XIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
  </svg>
);
const SunIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
  </svg>
);
const MoonIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  const dashboardLink = user && {
    OWNER: '/owner/dashboard',
    TENANT: '/tenant/dashboard',
    ADMIN: '/admin/dashboard',
  }[user.role];

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/10 shadow-card'
          : 'bg-slate-950/40 backdrop-blur-md border-b border-white/5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-white/5 border border-white/10 group-hover:border-primary-500/30 transition-all duration-300">
                <img src="/logo.png" alt="RoomYaaro Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-lg text-slate-800 dark:text-white tracking-tight">
                Room<span className="text-primary-500 dark:text-primary-400">Yaaro</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/listings"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                <SearchIcon />
                Browse
              </Link>

              {user && (
                <>
                  <Link
                    to={dashboardLink}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                  >
                    Dashboard
                  </Link>
                  {(user.role === 'TENANT' || user.role === 'OWNER') && (
                    <Link
                      to={`/${user.role.toLowerCase()}/chat`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                    >
                      <ChatIcon />
                      Chat
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>

              {user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/8">
                    <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-xs font-bold text-white">
                      {initials}
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{user.name?.split(' ')[0]}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-600 capitalize">{user.role.toLowerCase()}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
                  >
                    <LogoutIcon />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all duration-200">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-primary py-2 px-4 text-sm">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {mobileOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-white/8 bg-slate-100 dark:bg-slate-950 backdrop-blur-xl animate-fade-in">
            <div className="px-4 py-4 space-y-1">
              <Link to="/listings" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors">
                <SearchIcon /> Browse Listings
              </Link>
              {user ? (
                <>
                  <Link to={dashboardLink} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors">
                    Dashboard
                  </Link>
                  {(user.role === 'TENANT' || user.role === 'OWNER') && (
                    <Link to={`/${user.role.toLowerCase()}/chat`} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors">
                      <ChatIcon /> Chat
                    </Link>
                  )}
                  <div className="pt-2 border-t border-slate-200 dark:border-white/5 mt-2">
                    <button onClick={toggleTheme} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors">
                      {theme === 'dark' ? <SunIcon /> : <MoonIcon />} Toggle Theme ({theme})
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-500/5 transition-colors mt-1">
                      <LogoutIcon /> Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="pt-2 border-t border-slate-200 dark:border-white/5 mt-2 space-y-2">
                  <button onClick={toggleTheme} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors">
                    {theme === 'dark' ? <SunIcon /> : <MoonIcon />} Toggle Theme ({theme})
                  </button>
                  <div className="flex gap-2">
                    <Link to="/login" className="flex-1 btn-secondary py-2.5 text-sm text-center">Sign In</Link>
                    <Link to="/register" className="flex-1 btn-primary py-2.5 text-sm text-center">Get Started</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
