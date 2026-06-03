import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '../../Components/AdminLayout';

const statusColor = { valide: '#4CD964', en_attente: '#FF9500', refuse: '#FF3B30' };
const statusBg    = { valide: 'rgba(76,217,100,0.12)', en_attente: 'rgba(255,149,0,0.12)', refuse: 'rgba(255,59,48,0.12)' };
const statusLabel = { valide: 'VALIDÉ', en_attente: 'EN ATTENTE', refuse: 'REFUSÉ' };

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)' }} onClick={onClose}>
            <div className="w-full max-w-md rounded-2xl p-5" style={{ background: '#1A1A1A' }} onClick={e => e.stopPropagation()}>
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

export default function AdminTransactions() {
    const { transactions = [], flash } = usePage().props;

    const [filter,   setFilter]   = useState('TOUS');
    const [selected, setSelected] = useState(null);
    const [acting,   setActing]   = useState(false);

    const filtered = filter === 'TOUS'        ? transactions
        : filter === 'DÉPÔTS'     ? transactions.filter(t => t.type === 'depot')
        : filter === 'RETRAITS'   ? transactions.filter(t => t.type === 'retrait')
        : filter === 'EN ATTENTE' ? transactions.filter(t => t.status === 'en_attente')
        : transactions.filter(t => t.status === 'refuse');

    const approve = (id) => {
        setActing(true);
        router.post(`/admin/transactions/${id}/approve`, {}, {
            onFinish: () => { setActing(false); setSelected(null); },
        });
    };

    const reject = (id) => {
        setActing(true);
        router.post(`/admin/transactions/${id}/reject`, {}, {
            onFinish: () => { setActing(false); setSelected(null); },
        });
    };

    const totalDeposits  = transactions.filter(t => t.type === 'depot'   && t.status === 'valide').reduce((s, t) => s + t.amount_rb, 0);
    const totalWithdraws = transactions.filter(t => t.type === 'retrait'  && t.status === 'valide').reduce((s, t) => s + t.amount_rb, 0);
    const pending        = transactions.filter(t => t.status === 'en_attente').length;

    return (
        <AdminLayout title="Transactions">

            {/* Flash */}
            {flash?.success && (
                <div className="rounded-xl px-4 py-3 flex items-center gap-2 mb-4"
                    style={{ background: 'rgba(76,217,100,0.12)', border: '1px solid rgba(76,217,100,0.25)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4CD964" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span className="text-[#4CD964] text-sm">{flash.success}</span>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                    { label: 'Total dépôts',  value: `+${totalDeposits.toLocaleString()} RB`,  color: '#4CD964' },
                    { label: 'Total retraits', value: `-${totalWithdraws.toLocaleString()} RB`, color: '#FF3B30' },
                    { label: 'En attente',     value: pending,                                   color: '#FF9500' },
                    { label: 'Transactions',   value: transactions.length,                       color: '#FFF' },
                ].map(s => (
                    <div key={s.label} className="rounded-xl px-3 py-3 text-center" style={{ background: '#1A1A1A' }}>
                        <p className="font-black text-lg" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-[#666] text-[10px] mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {['TOUS', 'DÉPÔTS', 'RETRAITS', 'EN ATTENTE', 'REFUSÉS'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold"
                        style={{ background: filter === f ? '#FF3B30' : '#1A1A1A', color: filter === f ? '#FFF' : '#888' }}>
                        {f}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#1A1A1A' }}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                                {['ID', 'Utilisateur', 'Type', 'Montant', 'Hash / Wallet', 'Statut', 'Date', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-widest text-[#555]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-[#444] text-sm">Aucune transaction</td>
                                </tr>
                            ) : filtered.map((t, i) => (
                                <tr key={t.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #1E1E1E' : 'none' }}>
                                    <td className="px-4 py-3 text-[#555] text-sm">#{t.id}</td>
                                    <td className="px-4 py-3">
                                        <p className="text-white text-sm font-semibold">{t.user}</p>
                                        <p className="text-[#555] text-xs">{t.email}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-bold px-2 py-1 rounded"
                                            style={t.type === 'depot'
                                                ? { background: 'rgba(76,217,100,0.1)', color: '#4CD964' }
                                                : { background: 'rgba(255,59,48,0.1)', color: '#FF3B30' }}>
                                            {t.type === 'depot' ? 'DÉPÔT' : 'RETRAIT'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-bold text-sm"
                                            style={{ color: t.type === 'depot' ? '#4CD964' : '#FF3B30' }}>
                                            {t.type === 'depot' ? '+' : '-'}{t.amount_rb.toLocaleString()} RB
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-[#666] text-xs font-mono truncate max-w-[120px]">
                                            {t.tx_hash ?? t.wallet_address ?? '—'}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-bold px-2 py-1 rounded-lg"
                                            style={{ background: statusBg[t.status], color: statusColor[t.status] }}>
                                            {statusLabel[t.status] ?? t.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-[#666] text-xs">{t.created_at}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <button onClick={() => setSelected(t)}
                                                className="px-2 py-1 rounded-lg text-[10px] font-semibold"
                                                style={{ background: '#2A2A2A', color: '#CCC' }}>
                                                Voir
                                            </button>
                                            {t.status === 'en_attente' && (
                                                <>
                                                    <button onClick={() => approve(t.id)} disabled={acting}
                                                        className="px-2 py-1 rounded-lg text-[10px] font-semibold"
                                                        style={{ background: 'rgba(76,217,100,0.15)', color: '#4CD964' }}>
                                                        ✓
                                                    </button>
                                                    <button onClick={() => reject(t.id)} disabled={acting}
                                                        className="px-2 py-1 rounded-lg text-[10px] font-semibold"
                                                        style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}>
                                                        ✕
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal détail */}
            {selected && (
                <Modal title={`Transaction #${selected.id}`} onClose={() => setSelected(null)}>
                    <div className="flex flex-col gap-3">
                        {[
                            { label: 'Utilisateur', value: selected.user },
                            { label: 'Email',        value: selected.email },
                            { label: 'Type',         value: selected.type === 'depot' ? 'Dépôt' : 'Retrait' },
                            { label: 'Montant',      value: `${selected.type === 'depot' ? '+' : '-'}${selected.amount_rb.toLocaleString()} RB` },
                            { label: 'Hash TX',      value: selected.tx_hash ?? '—' },
                            { label: 'Wallet',       value: selected.wallet_address ?? '—' },
                            { label: 'Statut',       value: statusLabel[selected.status] ?? selected.status },
                            { label: 'Date',         value: selected.created_at },
                        ].map(r => (
                            <div key={r.label} className="flex justify-between py-2" style={{ borderBottom: '1px solid #2A2A2A' }}>
                                <span className="text-[#666] text-sm">{r.label}</span>
                                <span className="text-white font-semibold text-sm font-mono truncate max-w-[200px] text-right">{r.value}</span>
                            </div>
                        ))}

                        {selected.status === 'en_attente' && (
                            <div className="flex gap-3 mt-2">
                                <button onClick={() => approve(selected.id)} disabled={acting}
                                    className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                                    style={{ background: 'rgba(76,217,100,0.15)', color: '#4CD964' }}>
                                    VALIDER
                                </button>
                                <button onClick={() => reject(selected.id)} disabled={acting}
                                    className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                                    style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}>
                                    REFUSER
                                </button>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </AdminLayout>
    );
}
