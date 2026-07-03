import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const DashboardLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
    <Navbar />
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 min-h-[calc(100vh-4rem)] overflow-x-hidden">
        <div className="max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  </div>
);

export default DashboardLayout;
