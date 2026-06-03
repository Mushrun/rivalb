import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '../../Components/AdminLayout';

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)' }} onClick={onClose}>
            <div className="w-full max-w-lg rounded-2xl p-5 max-h-[90vh] overflow-y-auto"
                style={{ background: '#1A1A1A' }} onClick={e => e.stopPropagation()}>
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

export default function AdminLitiges() {
    const { disputes = [] } = usePage().props;
    const [filter,   setFilter]   = useState('OUVERTS');
    const [selected, setSelected] = useState(null);
    const [note,     setNote]     = useState('');
    const [loading,  setLoading]  = useState(false);

    const filtered = filter === 'TOUS'    ? disputes
        : filter === 'OUVERTS' ? disputes.filter(d => d.status === 'ouvert')
        : disputes.filter(d => d.status !== 'ouvert');

    const decide = (winnerId) => {
        setLoading(true);
        router.post(`/admin/litiges/${selected.id}/resolve`, { winner_id: winnerId, note }, {
            onFinish: () => { setLoading(false); setSelected(null); },
        });
    };

    const cancelMatch = () => {
        setLoading(true);
        router.post(`/admin/litiges/${selected.id}/resolve`, { cancel: true, note }, {
            onFinish: () => { setLoading(false); setSelected(null); },
        });
    };

    const openCount   = disputes.filter(d => d.status === 'ouvert').length;
    const resolvedCount = disputes.filter(d => d.status === 'resolu').length;
    const videoCount  = disputes.filter(d => d.has_video).length;

    return (
        <AdminLayout title="Litiges">

            {/* Stats */}
            <div className="flex gap-3 mb-5">
                {[
                    { label: 'Ouverts',  value: openCount,    color: '#FF3B30' },
                    { label: 'Vidéos',   value: videoCount,   color: '#FF9500' },
                    { label: 'Résolus',  value: resolvedCount, color: '#4CD964' },
                    { label: 'Total',    value: disputes.length, color: '#FFF' },
                ].map(s => (
                    <div key={s.label} className="flex-1 rounded-xl px-3 py-3 text-center" style={{ background: '#1A1A1A' }}>
                        <p className="font-black text-xl" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-[#666] text-[10px] mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4">
                {['TOUS', 'OUVERTS', 'RÉSOLUS'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold"
                        style={{ background: filter === f ? '#FF3B30' : '#1A1A1A', color: filter === f ? '#FFF' : '#888' }}>
                        {f}
                    </button>
                ))}
            </div>

            {/* Liste */}
            <div className="flex flex-col gap-3">
                {filtered.length === 0 ? (
                    <div className="rounded-2xl p-8 text-center" style={{ background: '#1A1A1A' }}>
                        <p className="text-[#555] text-sm">Aucun litige dans cette catégorie.</p>
                    </div>
                ) : filtered.map(d => (
                    <div key={d.id} className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-bold px-2 py-1 rounded-lg"
                                    style={d.status === 'ouvert'
                                        ? { background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }
                                        : d.status === 'resolu'
                                        ? { background: 'rgba(76,217,100,0.15)', color: '#4CD964' }
                                        : { background: 'rgba(136,136,136,0.15)', color: '#888' }}>
                                    {d.status.toUpperCase()}
                                </span>
                                {d.has_video && (
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg"
                                        style={{ background: 'rgba(255,149,0,0.15)', color: '#FF9500' }}>
                                        📹 VIDÉO
                                    </span>
                                )}
                                <span className="text-[#555] text-xs">{d.created_at}</span>
                            </div>
                            <span className="text-[#FFAA88] font-black text-base">{d.bet_amount} RB</span>
                        </div>

                        {/* Players */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex-1 rounded-xl p-3" style={{ background: '#0D0D0D' }}>
                                <p className="text-white font-bold text-sm mb-1">{d.player1.username}</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded"
                                        style={d.player1.result === 'win'
                                            ? { background: 'rgba(76,217,100,0.15)', color: '#4CD964' }
                                            : { background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}>
                                        {d.player1.result === 'win' ? 'Dit GAGNÉ' : d.player1.result === 'loss' ? 'Dit PERDU' : 'N/A'}
                                    </span>
                                    {d.player1.has_screenshot
                                        ? <span className="text-[#4CD964] text-[10px]">📸</span>
                                        : <span className="text-[#FF3B30] text-[10px]">⚠</span>}
                                </div>
                            </div>
                            <span className="text-[#FF3B30] font-black">VS</span>
                            <div className="flex-1 rounded-xl p-3" style={{ background: '#0D0D0D' }}>
                                <p className="text-white font-bold text-sm mb-1">{d.player2.username}</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded"
                                        style={d.player2.result === 'win'
                                            ? { background: 'rgba(76,217,100,0.15)', color: '#4CD964' }
                                            : { background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}>
                                        {d.player2.result === 'win' ? 'Dit GAGNÉ' : d.player2.result === 'loss' ? 'Dit PERDU' : 'N/A'}
                                    </span>
                                    {d.player2.has_screenshot
                                        ? <span className="text-[#4CD964] text-[10px]">📸</span>
                                        : <span className="text-[#FF3B30] text-[10px]">⚠</span>}
                                </div>
                            </div>
                        </div>

                        {d.status !== 'ouvert' ? (
                            <div className="rounded-xl px-3 py-2 flex items-center gap-2"
                                style={{ background: d.status === 'resolu' ? 'rgba(76,217,100,0.08)' : 'rgba(136,136,136,0.08)', border: `1px solid ${d.status === 'resolu' ? 'rgba(76,217,100,0.2)' : '#333'}` }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={d.status === 'resolu' ? '#4CD964' : '#888'} strokeWidth="2.5" strokeLinecap="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                <p className="text-xs font-semibold" style={{ color: d.status === 'resolu' ? '#4CD964' : '#888' }}>
                                    {d.status === 'resolu'
                                        ? `Vainqueur : ${d.winner_id === d.player1.id ? d.player1.username : d.player2.username}`
                                        : 'Match annulé — les deux joueurs remboursés'}
                                </p>
                            </div>
                        ) : (
                            <button onClick={() => { setSelected(d); setNote(''); }}
                                className="w-full rounded-xl py-2.5 font-bold text-sm"
                                style={{ background: '#FF3B30', color: '#FFF' }}>
                                TRANCHER CE LITIGE
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal décision */}
            {selected && (
                <Modal title={`Trancher — Litige #${selected.id}`} onClose={() => setSelected(null)}>
                    <p className="text-[#888] text-xs mb-4">
                        <span className="text-white font-semibold">{selected.player1.username}</span>
                        {' vs '}
                        <span className="text-white font-semibold">{selected.player2.username}</span>
                        {' · Mise : '}
                        <span className="text-[#FFAA88] font-bold">{selected.bet_amount} RB</span>
                    </p>

                    {/* Screenshots */}
                    {(selected.player1.screenshot_url || selected.player2.screenshot_url) && (
                        <div className="mb-4">
                            <p className="text-[#888] text-[10px] tracking-widest font-semibold mb-2">CAPTURES D'ÉCRAN</p>
                            <div className="flex gap-2">
                                {[selected.player1, selected.player2].map(p => (
                                    <div key={p.id} className="flex-1">
                                        <p className="text-[#666] text-[10px] mb-1">{p.username}</p>
                                        {p.screenshot_url ? (
                                            <a href={p.screenshot_url} target="_blank" rel="noreferrer"
                                                className="block rounded-xl overflow-hidden"
                                                style={{ aspectRatio: '16/9', background: '#0D0D0D' }}>
                                                <img src={p.screenshot_url} alt={`capture ${p.username}`}
                                                    className="w-full h-full object-cover" />
                                            </a>
                                        ) : (
                                            <div className="rounded-xl flex items-center justify-center"
                                                style={{ aspectRatio: '16/9', background: '#0D0D0D', border: '1px dashed #2A2A2A' }}>
                                                <span className="text-[#444] text-xs">Aucune capture</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <p className="text-[#888] text-[10px] tracking-widest font-semibold mb-2">DÉCLARER VAINQUEUR</p>
                    <div className="flex gap-3 mb-4">
                        {[
                            { id: selected.player1.id, name: selected.player1.username },
                            { id: selected.player2.id, name: selected.player2.username },
                        ].map(p => (
                            <button key={p.id}
                                onClick={() => decide(p.id)}
                                disabled={loading}
                                className="flex-1 rounded-xl py-3 font-bold text-sm"
                                style={{ background: '#0D0D0D', border: '1px solid #2A2A2A', color: '#FFF', opacity: loading ? 0.6 : 1 }}>
                                🏆 {p.name}
                            </button>
                        ))}
                    </div>

                    <p className="text-[#888] text-[10px] tracking-widest font-semibold mb-2">NOTE INTERNE (optionnel)</p>
                    <textarea value={note} onChange={e => setNote(e.target.value)}
                        placeholder="Raison de la décision..." rows={3}
                        className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none resize-none mb-4"
                        style={{ background: '#0D0D0D', border: '1px solid #2A2A2A' }} />

                    <button onClick={cancelMatch} disabled={loading}
                        className="w-full rounded-xl py-2.5 font-bold text-sm"
                        style={{ background: '#2A2A2A', color: '#FF9500', opacity: loading ? 0.6 : 1 }}>
                        ANNULER LE MATCH (remboursement des deux)
                    </button>
                </Modal>
            )}
        </AdminLayout>
    );
}
