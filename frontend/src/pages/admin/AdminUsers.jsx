import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loader from '../../components/Loader';

const roleBadge = {
  OWNER:  'badge-primary',
  TENANT: 'badge-success',
  ADMIN:  'badge-warning',
};

const AdminUsers = () => {
  const [users, setUsers]   = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('ALL');
  const toast = useToast();

  const fetchUsers = (q = '') => {
    setLoading(true);
    adminAPI.getUsers({ search: q })
      .then(({ data }) => setUsers(data.data.users))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      fetchUsers(search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleToggle = async (id, current) => {
    try {
      await adminAPI.toggleUser(id);
      toast.success(current ? 'User disabled' : 'User enabled');
      fetchUsers(search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const filtered = filter === 'ALL'
    ? users
    : filter === 'ACTIVE'
      ? users.filter(u => u.isActive)
      : users.filter(u => !u.isActive);

  const roles = ['OWNER', 'TENANT', 'ADMIN'];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4" style={{ animation: 'fadeUp .4s ease both' }}>
        <div>
          <p className="section-label mb-1">Admin</p>
          <h1 className="text-3xl font-black text-white">Manage Users</h1>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); fetchUsers(search); }} className="flex gap-2">
          <input
            className="input-field w-56"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-primary text-sm px-4">Search</button>
        </form>
      </div>

      {/* Stats */}
      {users.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6" style={{ animation: 'fadeUp .4s .05s ease both', opacity: 0, animationFillMode: 'forwards' }}>
          {[
            { label: 'Total', value: users.length, color: 'text-white' },
            ...roles.map(r => ({
              label: r.charAt(0) + r.slice(1).toLowerCase() + 's',
              value: users.filter(u => u.role === r).length,
              color: r === 'OWNER' ? 'text-primary-400' : r === 'TENANT' ? 'text-emerald-400' : 'text-amber-400',
            })),
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6" style={{ animation: 'fadeUp .4s .1s ease both', opacity: 0, animationFillMode: 'forwards' }}>
        {['ALL', 'ACTIVE', 'DISABLED'].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              filter === t
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'glass text-slate-500 border border-white/8 hover:text-slate-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : (
        <div className="card overflow-hidden" style={{ animation: 'fadeUp .4s .15s ease both', opacity: 0, animationFillMode: 'forwards' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-slate-500">User</th>
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Joined</th>
                  <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                    style={{ animation: `fadeUp .4s ${i * 30}ms ease both`, opacity: 0, animationFillMode: 'forwards' }}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-sm font-bold text-primary-400 flex-shrink-0">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`badge ${roleBadge[user.role] || 'badge-muted'}`}>
                        {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {user.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4">
                      {user.role !== 'ADMIN' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleToggle(user.id, user.isActive)}
                            className={`text-xs py-1.5 px-3 rounded-lg border font-medium transition-colors ${
                              user.isActive
                                ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                                : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                            }`}
                          >
                            {user.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-xs py-1.5 px-3 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-500">No users found</div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminUsers;
