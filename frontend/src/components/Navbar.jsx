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

  const isTabActive = (tabName) => {
    const path = location.pathname;
    if (tabName === 'matches') {
      return path === '/tenant/recommendations';
    }
    if (tabName === 'browse') {
      return path === '/listings' || path.startsWith('/listings/') || path === '/tenant/listings';
    }
    if (tabName === 'interests') {
      return path === '/tenant/interests' || path === '/owner/interests';
    }
    if (tabName === 'chat') {
      return path.includes('/chat');
    }
    if (tabName === 'me') {
      return (
        path === '/tenant/dashboard' ||
        path === '/owner/dashboard' ||
        path === '/admin/dashboard' ||
        path === '/tenant/profile' ||
        path.startsWith('/owner/listings') ||
        path.startsWith('/owner/create-listing')
      );
    }
    return false;
  };

  const getTabClass = (tabName) => {
    const active = isTabActive(tabName);
    return `flex flex-col items-center justify-center w-12 h-12 transition-all duration-200 relative ${
      active 
        ? 'text-primary-500 dark:text-primary-400 font-extrabold scale-110' 
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
    }`;
  };

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
              {user ? (
                <div className="space-y-1">
                  <button onClick={toggleTheme} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors">
                    {theme === 'dark' ? <SunIcon /> : <MoonIcon />} Toggle Theme ({theme})
                  </button>
                  <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-500/5 transition-colors mt-1">
                    <LogoutIcon /> Sign Out
                  </button>
                </div>
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

      {/* Bottom Nav Bar for Mobile (Instagram-style) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/85 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 md:hidden flex items-center justify-around h-16 pb-safe">
        {user?.role === 'TENANT' ? (
          <Link to="/tenant/recommendations" className={getTabClass('matches')}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.246.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.52 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.178 0l-3.97 2.883c-.783.57-1.838-.197-1.539-1.118l1.52-4.674a1 1 0 00-.364-1.118L2.05 10.1c-.773-.564-.373-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.554-4.673z" />
            </svg>
            <span className="text-[9px] font-semibold mt-0.5">Matches</span>
            {isTabActive('matches') && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-500 dark:bg-primary-400" />}
          </Link>
        ) : !user ? (
          <Link to="/login" className={getTabClass('matches')}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.246.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.52 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.178 0l-3.97 2.883c-.783.57-1.838-.197-1.539-1.118l1.52-4.674a1 1 0 00-.364-1.118L2.05 10.1c-.773-.564-.373-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.554-4.673z" />
            </svg>
            <span className="text-[9px] font-semibold mt-0.5">Matches</span>
            {isTabActive('matches') && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-500 dark:bg-primary-400" />}
          </Link>
        ) : (
          <Link to={dashboardLink} className={getTabClass('me')}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="text-[9px] font-semibold mt-0.5">Dashboard</span>
            {isTabActive('me') && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-500 dark:bg-primary-400" />}
          </Link>
        )}

        <Link to="/listings" className={getTabClass('browse')}>
          <SearchIcon />
          <span className="text-[9px] font-semibold mt-0.5">Browse</span>
          {isTabActive('browse') && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-500 dark:bg-primary-400" />}
        </Link>

        {/* Interests Tab */}
        {user?.role === 'TENANT' ? (
          <Link to="/tenant/interests" className={getTabClass('interests')}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-[9px] font-semibold mt-0.5">Interests</span>
            {isTabActive('interests') && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-500 dark:bg-primary-400" />}
          </Link>
        ) : user?.role === 'OWNER' ? (
          <Link to="/owner/interests" className={getTabClass('interests')}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-[9px] font-semibold mt-0.5">Interests</span>
            {isTabActive('interests') && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-500 dark:bg-primary-400" />}
          </Link>
        ) : !user ? (
          <Link to="/login" className={getTabClass('interests')}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-[9px] font-semibold mt-0.5">Interests</span>
            {isTabActive('interests') && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-500 dark:bg-primary-400" />}
          </Link>
        ) : null}

        {user?.role === 'OWNER' && (
          <Link to="/owner/my-listings" className={getTabClass('me')}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[9px] font-semibold mt-0.5">Post</span>
            {isTabActive('me') && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-500 dark:bg-primary-400" />}
          </Link>
        )}

        <Link to={user ? `/${user.role.toLowerCase()}/chat` : '/login'} className={getTabClass('chat')}>
          <ChatIcon />
          <span className="text-[9px] font-semibold mt-0.5">Chat</span>
          {isTabActive('chat') && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-500 dark:bg-primary-400" />}
        </Link>

        <Link to={user ? dashboardLink : '/login'} className={getTabClass('me')}>
          {user ? (
            <div className={`w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center text-[9px] font-bold text-white border transition-all duration-200 ${
              isTabActive('me') ? 'border-primary-500 dark:border-primary-400 scale-110' : 'border-slate-200 dark:border-white/20'
            }`}>
              {initials}
            </div>
          ) : (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
          <span className="text-[9px] font-semibold mt-0.5">{user ? 'Me' : 'Sign In'}</span>
          {isTabActive('me') && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-500 dark:bg-primary-400" />}
        </Link>
      </div>
    </>
  );
};

export default Navbar;
