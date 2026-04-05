import { useState, useEffect, useMemo } from 'react';
import { Shield, Search, Users, Ban, Snowflake, CheckCircle, MoreHorizontal, X } from 'lucide-react';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';

// ─── Types ───────────────────────────────────────────────────
type UserStatus = 'ACTIVE' | 'BANNED' | 'FROZEN';

interface ManagedUser {
  athleteId: string;
  name: string;
  email: string;
  sport: string;
  status: UserStatus;
  joinedAt: string;
  department: string;
  year: number;
  totalRegistrations: number;
  approvedRegistrations: number;
  bannedAt: string | null;
  banReason: string | null;
  frozenAt: string | null;
  frozenReason: string | null;
}

type ActionType = 'ban' | 'freeze' | 'unban' | 'unfreeze' | 'delete' | null;

interface ActionModal {
  user: ManagedUser;
  action: ActionType;
}

const API = 'http://localhost:5000/api/admin/users';

// ─── Reason Modal ─────────────────────────────────────────────
function ReasonModal({
  modal,
  onClose,
  onConfirm,
}: {
  modal: ActionModal;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const needsReason = modal.action === 'ban' || modal.action === 'freeze';
  const isDelete = modal.action === 'delete';

  const label = {
    ban: '🚫 Ban Account',
    freeze: '🧊 Freeze Account',
    unban: '✅ Unban Account',
    unfreeze: '✅ Unfreeze Account',
    delete: '🗑️ Remove Account',
  }[modal.action!];

  const handleConfirm = async () => {
    if (needsReason && !reason.trim()) {
      toast.error('Please provide a reason.');
      return;
    }
    setLoading(true);
    await onConfirm(needsReason ? reason : undefined);
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm bg-[#111a28] border border-[#1e2e40] rounded-2xl shadow-2xl p-6 space-y-5"
        style={{ animation: 'slideUp 0.18s ease both' }}>
        <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

        <div className="flex items-center justify-between">
          <h3 className="text-white font-black text-lg">{label}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <p className="text-sm text-gray-400">
          {isDelete
            ? `Are you sure you want to permanently remove ${modal.user.name}? This cannot be undone.`
            : `Action target: ${modal.user.name}`}
        </p>

        {needsReason && (
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Reason *</label>
            <textarea
              className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-lime-400/40 resize-none min-h-[80px]"
              placeholder={`Reason for ${modal.action}...`}
              value={reason}
              onChange={e => setReason(e.target.value)}
              autoFocus
            />
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 font-bold text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${isDelete
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : modal.action === 'ban'
                ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
                : modal.action === 'freeze'
                  ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30'
                  : 'bg-lime-400 text-[#0d1520] hover:bg-lime-500'
              }`}
          >
            {loading ? <Spinner className="w-4 h-4" /> : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Actions Dropdown ─────────────────────────────────────────
function ActionsDropdown({ user, onAction }: { user: ManagedUser; onAction: (u: ManagedUser, a: ActionType) => void }) {
  const [open, setOpen] = useState(false);

  const actions: { label: string; action: ActionType; color?: string }[] =
    user.status === 'ACTIVE'
      ? [
        { label: '🧊 Freeze Account', action: 'freeze', color: '#60a5fa' },
        { label: '🚫 Ban Account', action: 'ban', color: '#f87171' },
        { label: '🗑️ Remove Account', action: 'delete', color: '#f87171' },
      ]
      : user.status === 'BANNED'
        ? [
          { label: '✅ Unban Account', action: 'unban', color: '#86efac' },
          { label: '🗑️ Remove Account', action: 'delete', color: '#f87171' },
        ]
        : [
          { label: '✅ Unfreeze Account', action: 'unfreeze', color: '#86efac' },
          { label: '🚫 Ban Account', action: 'ban', color: '#f87171' },
          { label: '🗑️ Remove Account', action: 'delete', color: '#f87171' },
        ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 bg-[#111a28] border border-[#1e2e40] rounded-xl shadow-2xl overflow-hidden min-w-[160px]">
            {actions.map(a => (
              <button
                key={a.action}
                onClick={() => { setOpen(false); onAction(user, a.action); }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-white/5 transition-colors"
                style={{ color: a.color || '#c0d4e8' }}
              >
                {a.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function UserManagementPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | UserStatus>('ALL');
  const [modal, setModal] = useState<ActionModal | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(API);
      const data = await res.json();
      setUsers(data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = useMemo(() => {
    let result = users;
    if (filterStatus !== 'ALL') result = result.filter(u => u.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.sport.toLowerCase().includes(q)
      );
    }
    return result;
  }, [users, filterStatus, search]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    banned: users.filter(u => u.status === 'BANNED').length,
    frozen: users.filter(u => u.status === 'FROZEN').length,
  }), [users]);

  const handleAction = (user: ManagedUser, action: ActionType) => {
    setModal({ user, action });
  };

  const executeAction = async (reason?: string) => {
    if (!modal) return;
    const { user, action } = modal;

    try {
      if (action === 'delete') {
        await fetch(`${API}/${user.athleteId}`, { method: 'DELETE' });
        toast.success(`${user.name} removed.`);
      } else {
        await fetch(`${API}/${user.athleteId}/${action}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        });
        const messages: Record<string, string> = {
          ban: `✅ ${user.name} has been banned.`,
          freeze: `✅ ${user.name} has been frozen.`,
          unban: `✅ ${user.name} has been unbanned.`,
          unfreeze: `✅ ${user.name} has been unfrozen.`,
        };
        toast.success(messages[action!] || 'Action applied.');
      }
      setModal(null);
      fetchUsers();
    } catch {
      toast.error('Action failed. Please try again.');
    }
  };

  const StatusBadge = ({ status }: { status: UserStatus }) => {
    const cfg = {
      ACTIVE: { bg: 'rgba(132,204,22,0.1)', text: '#86efac', border: 'rgba(132,204,22,0.2)', label: 'ACTIVE' },
      BANNED: { bg: 'rgba(239,68,68,0.1)', text: '#f87171', border: 'rgba(239,68,68,0.2)', label: 'BANNED' },
      FROZEN: { bg: 'rgba(96,165,250,0.1)', text: '#93c5fd', border: 'rgba(96,165,250,0.2)', label: 'FROZEN' },
    }[status];
    return (
      <span style={{
        background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
        borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 800,
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 pt-24 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-lime-400 mb-2">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-black tracking-[0.2em] uppercase">Admin</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">User Management</h1>
          <p className="text-gray-400">Manage athlete accounts and access permissions.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Athletes', value: stats.total, icon: <Users size={20} className="text-blue-400" />, color: 'border-blue-400/20' },
            { label: 'Active', value: stats.active, icon: <CheckCircle size={20} className="text-lime-400" />, color: 'border-lime-400/20' },
            { label: 'Banned', value: stats.banned, icon: <Ban size={20} className="text-red-400" />, color: 'border-red-400/20' },
            { label: 'Frozen', value: stats.frozen, icon: <Snowflake size={20} className="text-blue-300" />, color: 'border-blue-300/20' },
          ].map(s => (
            <div key={s.label} className={`bg-[#1e293b] border ${s.color} rounded-2xl p-5 flex items-center gap-4`}>
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">{s.icon}</div>
              <div>
                <div className="text-3xl font-black text-white">{s.value}</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, email, or sport..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#1e293b] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400/40 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {(['ALL', 'ACTIVE', 'BANNED', 'FROZEN'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${filterStatus === s
                  ? 'bg-lime-400 text-[#0d1520]'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#1e293b] rounded-3xl border border-white/10 shadow-2xl">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3">
              <Spinner className="w-8 h-8 text-lime-400" />
              <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">Loading users...</span>
            </div>
          ) : (
            <div className="w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/20 border-b border-white/5">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Athlete</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Sport</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Joined</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Registrations</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic font-medium">
                        No users found matching your search.
                      </td>
                    </tr>
                  ) : filtered.map(user => (
                    <tr key={user.athleteId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-base font-black text-gray-400">
                            {user.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm leading-none mb-1">{user.name}</p>
                            <p className="text-[11px] text-gray-500 max-w-[180px] truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-300 font-medium">{user.sport}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500 font-medium">
                          {new Date(user.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-white font-mono">
                          {user.totalRegistrations}
                          <span className="text-gray-500">/{user.approvedRegistrations}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={user.status} />
                        {user.status === 'BANNED' && user.banReason && (
                          <p className="text-[10px] text-red-400/70 mt-1 max-w-[120px] mx-auto truncate" title={user.banReason}>
                            {user.banReason}
                          </p>
                        )}
                        {user.status === 'FROZEN' && user.frozenReason && (
                          <p className="text-[10px] text-blue-400/70 mt-1 max-w-[120px] mx-auto truncate" title={user.frozenReason}>
                            {user.frozenReason}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ActionsDropdown user={user} onAction={handleAction} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {modal && (
        <ReasonModal
          modal={modal}
          onClose={() => setModal(null)}
          onConfirm={executeAction}
        />
      )}
    </div>
  );
}
