import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '../../Components/AdminLayout';
import { resolveMediaUrl } from '../../utils/media';

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={onClose}>
            <div className="w-full max-w-md rounded-2xl p-5" style={{ background: '#1A1A1A' }} onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-base">{title}</h3>
                    <button onClick={onClose}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                </div>
                {children}
            </div>
        </div>
    );
}

export default function AdminUsers() {
    const { users, filters } = usePage().props;

    const [search, setSearch]     = useState(filters?.search ?? '');
    const [filter, setFilter]     = useState(filters?.status ?? 'all');
    const [selected, setSelected] = useState(null);

    const statusColor = { actif: '#4CD964', banni: '#FF3B30', suspendu: '#FF9500' };
    const statusBg    = { actif: 'rgba(76,217,100,0.12)', banni: 'rgba(255,59,48,0.12)', suspendu: 'rgba(255,149,0,0.12)' };

    const applyFilter = (status) => {
        setFilter(status);
        router.get('/admin/users', { search, status }, { preserveState: true, replace: true });
    };

    const applySearch = (value) => {
        setSearch(value);
        router.get('/admin/users', { search: value, status: filter }, { preserveState: true, replace: true });
    };

    const updateStatus = (id, status) => {
        router.post(`/admin/users/${id}/status`, { status }, { preserveScroll: true });
        setSelected(null);
    };

    const list = users?.data ?? [];

    return (
        <AdminLayout title="Utilisateurs">

            {/* Search + filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input value={search} onChange={e => applySearch(e.target.value)}
                        placeholder="Rechercher un utilisateur..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-white text-sm outline-none"
                        style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }} />
                </div>
                <div className="flex gap-2">
                    {[['all','TOUS'],['actif','ACTIFS'],['banni','BANNIS'],['suspendu','SUSPENDUS']].map(([val, label]) => (
                        <button key={val} onClick={() => applyFilter(val)}
                            className="px-3 py-2 rounded-xl text-xs font-semibold"
                            style={{ background: filter === val ? '#FF3B30' : '#1A1A1A', color: filter === val ? '#FFF' : '#888' }}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats rapides */}
            <div className="flex gap-3 mb-5">
                {[
                    { label: 'Total',     value: users?.total ?? 0,                                              color: '#FFF' },
                    { label: 'Actifs',    value: list.filter(u => u.status === 'actif').length,     color: '#4CD964' },
                    { label: 'Bannis',    value: list.filter(u => u.status === 'banni').length,     color: '#FF3B30' },
                    { label: 'Suspendus', value: list.filter(u => u.status === 'suspendu').length,  color: '#FF9500' },
                ].map(s => (
                    <div key={s.label} className="flex-1 rounded-xl px-3 py-2 text-center" style={{ background: '#1A1A1A' }}>
                        <p className="font-black text-lg" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-[#666] text-[10px]">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#1A1A1A' }}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                                {['Joueur', 'Solde', 'Matchs', 'Fiabilité', 'Statut', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-widest text-[#555]">{h.toUpperCase()}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((u, i) => (
                                <tr key={u.id} style={{ borderBottom: i < list.length - 1 ? '1px solid #1E1E1E' : 'none' }}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
                                                style={{ background: '#FF3B30' }}>
                                                {u.avatar_path
                                                    ? <img src={resolveMediaUrl(u.avatar_path)} className="w-8 h-8 rounded-lg object-cover" alt="" />
                                                    : (u.name ?? u.username ?? '?')[0].toUpperCase()
                                                }
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-semibold">{u.username ?? u.name}</p>
                                                <p className="text-[#555] text-xs">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-[#FFAA88] font-bold text-sm">{u.balance_rb} RB</span>
                                    </td>
                                    <td className="px-4 py-3 text-[#888] text-sm">{u.matches_count}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 rounded-full" style={{ background: '#2A2A2A' }}>
                                                <div className="h-full rounded-full" style={{
                                                    width: `${u.reliability_score ?? 100}%`,
                                                    background: (u.reliability_score ?? 100) >= 70 ? '#4CD964' : (u.reliability_score ?? 100) >= 50 ? '#FF9500' : '#FF3B30',
                                                }} />
                                            </div>
                                            <span className="text-[#888] text-xs">{u.reliability_score ?? 100}%</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-bold px-2 py-1 rounded-lg"
                                            style={{ background: statusBg[u.status] ?? statusBg.actif, color: statusColor[u.status] ?? statusColor.actif }}>
                                            {(u.status ?? 'actif').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setSelected(u)}
                                                className="px-2 py-1 rounded-lg text-[10px] font-semibold"
                                                style={{ background: '#2A2A2A', color: '#CCC' }}>
                                                Voir
                                            </button>
                                            {(u.status === 'actif' || !u.status) && (
                                                <>
                                                    <button onClick={() => updateStatus(u.id, 'suspendu')}
                                                        className="px-2 py-1 rounded-lg text-[10px] font-semibold"
                                                        style={{ background: 'rgba(255,149,0,0.15)', color: '#FF9500' }}>
                                                        Suspendre
                                                    </button>
                                                    <button onClick={() => updateStatus(u.id, 'banni')}
                                                        className="px-2 py-1 rounded-lg text-[10px] font-semibold"
                                                        style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}>
                                                        Bannir
                                                    </button>
                                                </>
                                            )}
                                            {u.status && u.status !== 'actif' && (
                                                <button onClick={() => updateStatus(u.id, 'actif')}
                                                    className="px-2 py-1 rounded-lg text-[10px] font-semibold"
                                                    style={{ background: 'rgba(76,217,100,0.15)', color: '#4CD964' }}>
                                                    Réactiver
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {list.length === 0 && (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-[#555] text-sm">Aucun utilisateur trouvé.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users?.last_page > 1 && (
                    <div className="flex justify-center gap-2 p-4" style={{ borderTop: '1px solid #2A2A2A' }}>
                        {users.links?.filter(l => l.url).map((l, i) => (
                            <button key={i} onClick={() => router.visit(l.url)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                                style={{ background: l.active ? '#FF3B30' : '#2A2A2A', color: l.active ? '#FFF' : '#888' }}
                                dangerouslySetInnerHTML={{ __html: l.label }} />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal détail */}
            {selected && (
                <Modal title={`Profil — ${selected.username ?? selected.name}`} onClose={() => setSelected(null)}>
                    <div className="flex flex-col gap-3">
                        {[
                            { label: 'Email',      value: selected.email },
                            { label: 'Inscrit le', value: selected.created_at },
                            { label: 'Solde',      value: `${selected.balance_rb} RB` },
                            { label: 'Matchs',     value: selected.matches_count },
                            { label: 'Fiabilité',  value: `${selected.reliability_score ?? 100}%` },
                            { label: 'Statut',     value: selected.status ?? 'actif' },
                        ].map(r => (
                            <div key={r.label} className="flex justify-between py-2" style={{ borderBottom: '1px solid #2A2A2A' }}>
                                <span className="text-[#666] text-sm">{r.label}</span>
                                <span className="text-white font-semibold text-sm">{r.value}</span>
                            </div>
                        ))}
                        <div className="flex gap-2 mt-2">
                            {(selected.status === 'actif' || !selected.status) ? (
                                <>
                                    <button onClick={() => updateStatus(selected.id, 'suspendu')}
                                        className="flex-1 py-2 rounded-xl font-bold text-xs"
                                        style={{ background: 'rgba(255,149,0,0.15)', color: '#FF9500' }}>
                                        SUSPENDRE
                                    </button>
                                    <button onClick={() => updateStatus(selected.id, 'banni')}
                                        className="flex-1 py-2 rounded-xl font-bold text-xs"
                                        style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}>
                                        BANNIR
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => updateStatus(selected.id, 'actif')}
                                    className="flex-1 py-2 rounded-xl font-bold text-xs"
                                    style={{ background: 'rgba(76,217,100,0.15)', color: '#4CD964' }}>
                                    RÉACTIVER
                                </button>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </AdminLayout>
    );
}
