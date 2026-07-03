import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/* ── SVG Icons ── */
const DashIcon = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="14" y="3" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="3" y="14" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="14" y="14" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
  </svg>
);
const BuildingIcon = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
  </svg>
);
const ChatIcon = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
  </svg>
);
const UserIcon = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>
);
const StarIcon = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
  </svg>
);
const HeartIcon = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
  </svg>
);
const ChartIcon = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
  </svg>
);

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const ownerLinks = [
    { to: '/owner/dashboard',      label: 'Dashboard',         icon: <DashIcon /> },
    { to: '/owner/create-listing', label: 'Create Listing',    icon: <PlusIcon /> },
    { to: '/owner/listings',       label: 'My Listings',       icon: <BuildingIcon /> },
    { to: '/owner/interests',      label: 'Interested Tenants', icon: <UsersIcon /> },
    { to: '/owner/chat',           label: 'Chat',              icon: <ChatIcon /> },
  ];

  const tenantLinks = [
    { to: '/tenant/dashboard',       label: 'Dashboard',       icon: <DashIcon /> },
    { to: '/tenant/profile',         label: 'My Profile',      icon: <UserIcon /> },
    { to: '/tenant/listings',        label: 'Browse Rooms',    icon: <SearchIcon /> },
    { to: '/tenant/recommendations', label: 'Recommended',     icon: <StarIcon /> },
    { to: '/tenant/interests',       label: 'My Interests',    icon: <HeartIcon /> },
    { to: '/tenant/chat',            label: 'Chat',            icon: <ChatIcon /> },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <DashIcon /> },
    { to: '/admin/users',     label: 'Users',     icon: <UsersIcon /> },
    { to: '/admin/listings',  label: 'Listings',  icon: <BuildingIcon /> },
    { to: '/admin/analytics', label: 'Analytics', icon: <ChartIcon /> },
  ];

  const links = { OWNER: ownerLinks, TENANT: tenantLinks, ADMIN: adminLinks }[user?.role] || [];

  const roleLabels = { OWNER: 'Owner Portal', TENANT: 'Tenant Portal', ADMIN: 'Admin Panel' };

  return (
    <aside className="w-64 min-h-[calc(100vh-4rem)] hidden lg:flex flex-col border-r border-slate-200 dark:border-white/6 bg-slate-100/60 dark:bg-slate-950/60 backdrop-blur-xl">
      {/* Role badge */}
      <div className="px-5 pt-6 pb-3">
        <p className="section-label">{roleLabels[user?.role] || 'Menu'}</p>
      </div>

      <nav className="flex-1 px-3 pb-6 space-y-0.5">
        {links.map((link, i) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              style={{ animationDelay: `${i * 40}ms` }}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 animate-slide-in opacity-0 [animation-fill-mode:forwards]
                ${isActive
                  ? 'sidebar-link-active'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }
              `}
            >
              <span className={isActive ? 'text-primary-400' : 'text-slate-500'}>{link.icon}</span>
              {link.label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info at bottom */}
      {user && (
        <div className="p-4 border-t border-white/6">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-xs font-bold text-primary-400">
              {user.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
