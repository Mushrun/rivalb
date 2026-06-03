import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '../../Components/AdminLayout';

const statusColor = { en_attente: '#888', en_cours: '#FF9500', termine: '#4CD964', litige: '#FF3B30', annule: '#555' };
const statusBg    = { en_attente: 'rgba(136,136,136,0.12)', en_cours: 'rgba(255,149,0,0.12)', termine: 'rgba(76,217,100,0.12)', litige: 'rgba(255,59,48,0.12)', annule: 'rgba(85,85,85,0.12)' };
const statusLabel = { en_attente: 'EN ATTENTE', en_cours: 'EN COURS', termine: 'TERMINÉ', litige: 'LITIGE', annule: 'ANNULÉ' };

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={onClose}>
            <div className="w-full max-w-md rounded-2xl p-5 max-h-[90vh] overflow-y-auto" style={{ background: '#1A1A1A' }} onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-base">{title}</h3>
                    <button onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export default function AdminMatchs() {
    const { matches, filters } = usePage().props;

    const [filter, setFilter]     = useState(filters?.status ?? 'all');
    const [selected, setSelected] = useState(null);

    const list = matches?.data ?? [];

    const applyFilter = (status) => {
        setFilter(status);
        router.get('/admin/matchs', { status }, { preserveState: true, replace: true });
    };

    const cancel = (id) => {
        router.post(`/admin/matchs/${id}/cancel`, {}, { preserveScroll: true });
        setSelected(null);
    };

    const stats = [
        { label: 'En attente', key: 'en_attente', color: '#888' },
        { label: 'En cours',   key: 'en_cours',   color: '#FF9500' },
        { label: 'Terminés',   key: 'termine',    color: '#4CD964' },
        { label: 'Litiges',    key: 'litige',     color: '#FF3B30' },
    ];

    return (
        <AdminLayout title="Matchs">

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {stats.map(s => (
                    <div key={s.label} className="rounded-xl px-3 py-3 text-center" style={{ background: '#1A1A1A' }}>
                        <p className="font-black text-xl" style={{ color: s.color }}>
                            {list.filter(m => m.status === s.key).length}
                        </p>
                        <p className="text-[#666] text-[10px] mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {[['all','TOUS'],['en_attente','EN ATTENTE'],['en_cours','EN COURS'],['termine','TERMINÉS'],['litige','LITIGES'],['annule','ANNULÉS']].map(([val, label]) => (
                    <button key={val} onClick={() => applyFilter(val)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold"
                        style={{ background: filter === val ? '#FF3B30' : '#1A1A1A', color: filter === val ? '#FFF' : '#888' }}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#1A1A1A' }}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                                {['ID', 'Joueurs', 'Mise', 'Statut', 'Date', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-widest text-[#555]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((m, i) => (
                                <tr key={m.id} style={{ borderBottom: i < list.length - 1 ? '1px solid #1E1E1E' : 'none' }}>
                                    <td className="px-4 py-3 text-[#555] text-sm">#{m.id}</td>
                                    <td className="px-4 py-3">
                                        <p className="text-white text-sm font-semibold">{m.player1?.username ?? '—'}</p>
                                        <p className="text-[#555] text-xs">vs {m.player2?.username ?? '—'}</p>
                                    </td>
                                    <td className="px-4 py-3 text-[#FFAA88] font-bold text-sm">{m.bet_amount} RB</td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-bold px-2 py-1 rounded-lg"
                                            style={{ background: statusBg[m.status] ?? statusBg.en_attente, color: statusColor[m.status] ?? statusColor.en_attente }}>
                                            {statusLabel[m.status] ?? m.status?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-[#666] text-xs">{m.created_at}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setSelected(m)}
                                                className="px-2 py-1 rounded-lg text-[10px] font-semibold"
                                                style={{ background: '#2A2A2A', color: '#CCC' }}>
                                                Voir
                                            </button>
                                            {m.status === 'litige' && (
                                                <a href="/admin/litiges"
                                                    className="px-2 py-1 rounded-lg text-[10px] font-semibold"
                                                    style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}>
                                                    Litige
                                                </a>
                                            )}
                                            {(m.status === 'en_attente' || m.status === 'en_cours') && (
                                                <button onClick={() => cancel(m.id)}
                                                    className="px-2 py-1 rounded-lg text-[10px] font-semibold"
                                                    style={{ background: 'rgba(255,59,48,0.1)', color: '#FF3B30' }}>
                                                    Annuler
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {list.length === 0 && (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-[#555] text-sm">Aucun match trouvé.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {matches?.last_page > 1 && (
                    <div className="flex justify-center gap-2 p-4" style={{ borderTop: '1px solid #2A2A2A' }}>
                        {matches.links?.filter(l => l.url).map((l, i) => (
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
                <Modal title={`Match #${selected.id}`} onClose={() => setSelected(null)}>
                    <div className="flex flex-col gap-3">
                        {[
                            { label: 'Joueur 1',  value: selected.player1?.username ?? '—' },
                            { label: 'Joueur 2',  value: selected.player2?.username ?? '—' },
                            { label: 'Jeu',       value: selected.game ?? '—' },
                            { label: 'Mise',      value: `${selected.bet_amount} RB` },
                            { label: 'Statut',    value: statusLabel[selected.status] ?? selected.status },
                            { label: 'Démarré',   value: selected.started_at ?? '—' },
                            { label: 'Terminé',   value: selected.ended_at ?? '—' },
                        ].map(r => (
                            <div key={r.label} className="flex justify-between py-2" style={{ borderBottom: '1px solid #2A2A2A' }}>
                                <span className="text-[#666] text-sm">{r.label}</span>
                                <span className="text-white font-semibold text-sm">{r.value}</span>
                            </div>
                        ))}

                        {selected.status === 'litige' && (
                            <a href="/admin/litiges"
                                className="w-full rounded-xl py-2.5 font-bold text-sm text-center block mt-1"
                                style={{ background: '#FF3B30', color: '#FFF' }}>
                                VOIR LE LITIGE
                            </a>
                        )}
                        {(selected.status === 'en_attente' || selected.status === 'en_cours') && (
                            <button onClick={() => cancel(selected.id)}
                                className="w-full rounded-xl py-2.5 font-bold text-sm mt-1"
                                style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}>
                                ANNULER CE MATCH
                            </button>
                        )}
                    </div>
                </Modal>
            )}
        </AdminLayout>
    );
}
