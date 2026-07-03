import Navbar from '../components/Navbar';

const PublicLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
    <Navbar />
    <main>{children}</main>
    <footer className="border-t border-white/5 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary-400">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-semibold text-slate-300">RoomYaaro</span>
        </div>
        <p className="text-sm text-slate-600">© {new Date().getFullYear()} RoomYaaro · Find Your Room. Find Your Yaar.</p>
      </div>
    </footer>
  </div>
);

export default PublicLayout;
