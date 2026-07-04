import Navbar from '../components/Navbar';

const PublicLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 md:pb-0">
    <Navbar />
    <main>{children}</main>
    <footer className="relative border-t border-slate-200 dark:border-white/5 bg-slate-100/60 dark:bg-slate-950/40 backdrop-blur-md pt-16 pb-8 mt-24 overflow-hidden">
      {/* Decorative radial gradients inside footer */}
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-80 h-80 rounded-full bg-primary-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200 dark:border-white/5">
          {/* Brand column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary-500 dark:text-primary-400">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">RoomYaaro</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              Matching rooms and flatmates in seconds using advanced AI. Find the perfect place to live and the perfect companion to share it with.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="#twitter" 
                className="w-8 h-8 rounded-lg glass border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300"
                title="Twitter (X)"
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a 
                href="#google" 
                className="w-8 h-8 rounded-lg glass border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300"
                title="Google"
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.746-.08-1.32-.176-1.886H12.24z"/>
                </svg>
              </a>
              <a 
                href="#instagram" 
                className="w-8 h-8 rounded-lg glass border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300"
                title="Instagram"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a 
                href="#linkedin" 
                className="w-8 h-8 rounded-lg glass border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300"
                title="LinkedIn"
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Discover Column */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Discover</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/listings" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Browse Rooms</a></li>
              <li><a href="/register" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Create Profile</a></li>
              <li><a href="/login" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Sign In</a></li>
            </ul>
          </div>

          {/* Features Column */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Features</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="text-slate-600 dark:text-slate-400">AI Compatibility™</span></li>
              <li><span className="text-slate-600 dark:text-slate-400">Real-Time Chat</span></li>
              <li><span className="text-slate-600 dark:text-slate-400">Smart Fallbacks</span></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#privacy" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#cookies" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <p>© {new Date().getFullYear()} RoomYaaro. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <span className="text-red-500">❤️</span> for flatmates everywhere.
          </p>
        </div>
      </div>
    </footer>
  </div>
);

export default PublicLayout;
