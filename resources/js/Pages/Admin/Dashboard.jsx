import { usePage } from '@inertiajs/react';
import AdminLayout from '../../Components/AdminLayout';

function StatCard({ stat }) {
    return (
        <div className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
            <p className="text-[#666] text-xs tracking-wider mb-2">{stat.label.toUpperCase()}</p>
            <p className="text-white font-black text-2xl mb-1">{stat.value}</p>
            <p className="text-xs font-semibold" style={{ color: stat.color }}>{stat.delta}</p>
        </div>
    );
}

export default function AdminDashboard() {
    const { stats, recentLitiges, recentUsers } = usePage().props;

    return (
        <AdminLayout title="Dashboard">

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {stats.map(s => <StatCard key={s.label} stat={s} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Litiges urgents */}
                <div className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-white font-bold text-sm">⚠️ Litiges en attente</h2>
                        <a href="/admin/litiges" className="text-[#FF3B30] text-xs font-semibold">Voir tout →</a>
                    </div>
                    {recentLitiges.length === 0 ? (
                        <p className="text-[#555] text-sm text-center py-4">Aucun litige en attente</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {recentLitiges.map(l => (
                                <div key={l.id} className="flex items-center justify-between rounded-xl px-3 py-3"
                                    style={{ background: '#0D0D0D' }}>
                                    <div>
                                        <p className="text-white text-sm font-semibold">{l.players}</p>
                                        <p className="text-[#666] text-xs">{l.date} · {l.bet}</p>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg"
                                        style={l.urgency === 'haute'
                                            ? { background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }
                                            : { background: 'rgba(255,149,0,0.15)', color: '#FF9500' }}>
                                        {l.urgency === 'haute' ? 'URGENT' : 'NORMAL'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Derniers inscrits */}
                <div className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-white font-bold text-sm">👥 Derniers inscrits</h2>
                        <a href="/admin/users" className="text-[#FF3B30] text-xs font-semibold">Voir tout →</a>
                    </div>
                    <div className="flex flex-col gap-2">
                        {recentUsers.map(u => (
                            <div key={u.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                                style={{ background: '#0D0D0D' }}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs"
                                    style={{ background: '#FF3B30' }}>
                                    {u.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-semibold truncate">{u.name}</p>
                                    <p className="text-[#666] text-xs truncate">{u.email}</p>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0"
                                    style={u.status === 'banni'
                                        ? { background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }
                                        : { background: 'rgba(76,217,100,0.15)', color: '#4CD964' }}>
                                    {u.status.toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
