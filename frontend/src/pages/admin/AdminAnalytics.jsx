import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loader from '../../components/Loader';

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(({ data }) => setStats(data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

  // User distribution percentage calculations
  const totalUsers = stats?.totalUsers || 1;
  const ownerPct = Math.round(((stats?.owners || 0) / totalUsers) * 100);
  const tenantPct = Math.round(((stats?.tenants || 0) / totalUsers) * 100);

  // Listing occupancy percentage calculations
  const totalListings = stats?.totalListings || 1;
  const filledPct = Math.round(((stats?.filledListings || 0) / totalListings) * 100);
  const availablePct = 100 - filledPct;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8" style={{ animation: 'fadeUp .4s ease both' }}>
        <p className="section-label mb-1">Metrics</p>
        <h1 className="text-3xl font-black text-white">Platform Analytics</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-enter">
        {/* User Distribution Chart */}
        <div className="card p-6">
          <h3 className="font-bold text-white text-lg mb-6">User Distribution</h3>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* SVG Donut Chart */}
            <div className="relative w-40 h-40">
              <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
                <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
                {/* Owners (Indigo) */}
                <circle
                  cx="80" cy="80" r="60" fill="none" stroke="#6366f1" strokeWidth="16"
                  strokeDasharray={`${(ownerPct * 377) / 100} 377`}
                />
                {/* Tenants (Emerald) */}
                <circle
                  cx="80" cy="80" r="60" fill="none" stroke="#10b981" strokeWidth="16"
                  strokeDasharray={`${(tenantPct * 377) / 100} 377`}
                  strokeDashoffset={`-${(ownerPct * 377) / 100}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">{totalUsers}</span>
                <span className="text-xs text-slate-500">Users</span>
              </div>
            </div>

            {/* Labels and legends */}
            <div className="flex-1 space-y-4 w-full">
              <div>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="w-3 h-3 rounded bg-primary-500" />
                    Property Owners
                  </span>
                  <span className="text-white">{stats?.owners || 0} ({ownerPct}%)</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary-500 h-full transition-all duration-1000" style={{ width: `${ownerPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="w-3 h-3 rounded bg-emerald-500" />
                    Tenants
                  </span>
                  <span className="text-white">{stats?.tenants || 0} ({tenantPct}%)</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${tenantPct}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Listing Occupancy Chart */}
        <div className="card p-6">
          <h3 className="font-bold text-white text-lg mb-6">Listing Occupancy</h3>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* SVG Donut Chart */}
            <div className="relative w-40 h-40">
              <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
                <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
                {/* Filled (Red) */}
                <circle
                  cx="80" cy="80" r="60" fill="none" stroke="#ef4444" strokeWidth="16"
                  strokeDasharray={`${(filledPct * 377) / 100} 377`}
                />
                {/* Available (Cyan) */}
                <circle
                  cx="80" cy="80" r="60" fill="none" stroke="#06b6d4" strokeWidth="16"
                  strokeDasharray={`${(availablePct * 377) / 100} 377`}
                  strokeDashoffset={`-${(filledPct * 377) / 100}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">{totalListings}</span>
                <span className="text-xs text-slate-500">Rooms</span>
              </div>
            </div>

            {/* Labels and legends */}
            <div className="flex-1 space-y-4 w-full">
              <div>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="w-3 h-3 rounded bg-red-500" />
                    Rooms Filled
                  </span>
                  <span className="text-white">{stats?.filledListings || 0} ({filledPct}%)</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${filledPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="w-3 h-3 rounded bg-cyan-500" />
                    Available Rooms
                  </span>
                  <span className="text-white">{((stats?.totalListings || 0) - (stats?.filledListings || 0))} ({availablePct}%)</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full transition-all duration-1000" style={{ width: `${availablePct}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity & Performance Metrics */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-bold text-white text-lg mb-6">Activity & Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white/3 border border-white/5 text-center">
              <span className="text-sm text-slate-500 block mb-2">Total WebSocket Messages</span>
              <span className="text-3xl font-black text-white">{stats?.totalMessages || 0}</span>
            </div>
            <div className="p-5 rounded-2xl bg-white/3 border border-white/5 text-center">
              <span className="text-sm text-slate-500 block mb-2">Average Match Score</span>
              <span className="text-3xl font-black text-emerald-400">{stats?.averageScore || 0}%</span>
            </div>
            <div className="p-5 rounded-2xl bg-white/3 border border-white/5 text-center">
              <span className="text-sm text-slate-500 block mb-2">Total Interest Requests</span>
              <span className="text-3xl font-black text-white">{stats?.totalRequests || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
