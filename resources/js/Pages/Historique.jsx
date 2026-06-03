import { useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../Components/AppLayout';
import TopBar from '../Components/TopBar';

function AvisModal({ opponent, onClose }) {
    const [sentiment, setSentiment] = useState(null);
    const [comment, setComment]     = useState('');
    const [sent, setSent]           = useState(false);

    if (sent) return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.75)' }} onClick={onClose}>
            <div className="w-full max-w-[390px] rounded-2xl p-6 flex flex-col items-center gap-3"
                style={{ background: '#1A1A1A' }} onClick={e => e.stopPropagation()}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(76,217,100,0.15)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4CD964" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </div>
                <p className="text-white font-bold">Avis envoyé !</p>
                <p className="text-[#888] text-xs text-center">Ton avis sur <span className="text-white font-semibold">{opponent}</span> a été publié.</p>
                <button onClick={onClose} className="w-full rounded-xl py-3 font-bold text-sm mt-1"
                    style={{ background: '#FF3B30', color: '#FFF' }}>FERMER</button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.75)' }} onClick={onClose}>
            <div className="w-full max-w-[390px] rounded-2xl p-5"
                style={{ background: '#1A1A1A' }} onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-base">Avis sur {opponent}</h3>
                    <button onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div className="flex gap-3 mb-4">
                    {[
                        { key: 'positive', label: '👍 Positif', active: '#4CD964', bg: 'rgba(76,217,100,0.12)' },
                        { key: 'negative', label: '👎 Négatif', active: '#FF3B30', bg: 'rgba(255,59,48,0.1)' },
                    ].map(t => (
                        <button key={t.key} onClick={() => setSentiment(t.key)}
                            className="flex-1 rounded-xl py-3 font-bold text-sm transition-all"
                            style={{
                                background: sentiment === t.key ? t.bg : '#0D0D0D',
                                border: sentiment === t.key ? `2px solid ${t.active}` : '2px solid #2A2A2A',
                                color: sentiment === t.key ? t.active : '#666',
                            }}>
                            {t.label}
                        </button>
                    ))}
                </div>
                <textarea value={comment} onChange={e => setComment(e.target.value)}
                    placeholder="Commentaire (optionnel)..." rows={3}
                    className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none resize-none mb-4"
                    style={{ background: '#0D0D0D', border: '1px solid #2A2A2A' }} />
                <button onClick={() => sentiment && setSent(true)} disabled={!sentiment}
                    className="w-full rounded-xl py-3 font-bold text-sm transition-opacity"
                    style={{ background: '#FF3B30', color: '#FFF', opacity: sentiment ? 1 : 0.35 }}>
                    PUBLIER
                </button>
            </div>
        </div>
    );
}

function CombatsTab({ combats, stats }) {
    const [filter, setFilter]     = useState('TOUT');
    const [avisModal, setAvisModal] = useState(null);
    const [avisGiven, setAvisGiven] = useState(
        new Set(combats.filter(c => c.avis_given).map(c => c.id))
    );

    const filtered = filter === 'TOUT'   ? combats
        : filter === 'GAGNÉS'            ? combats.filter(c => c.won)
        : combats.filter(c => !c.won);

    const bilanColor = stats.total_rb >= 0 ? '#4CD964' : '#FF3B30';
    const bilanLabel = (stats.total_rb > 0 ? '+' : '') + stats.total_rb + ' RB';

    return (
        <div>
            {/* Mini stats */}
            <div className="flex gap-2 px-4 mb-4">
                {[
                    { label: 'Victoires', value: stats.wins,   color: '#4CD964' },
                    { label: 'Défaites',  value: stats.losses, color: '#FF3B30' },
                    { label: 'Bilan RB',  value: bilanLabel,   color: bilanColor },
                ].map(s => (
                    <div key={s.label} className="flex-1 rounded-xl p-2.5 flex flex-col items-center"
                        style={{ background: '#1A1A1A' }}>
                        <span className="font-black text-base" style={{ color: s.color }}>{s.value}</span>
                        <span className="text-[#666] text-[9px] tracking-wider mt-0.5">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-2 px-4 mb-3">
                {['TOUT', 'GAGNÉS', 'PERDUS'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                        style={filter === f
                            ? { background: '#FF3B30', color: '#FFF' }
                            : { background: '#1A1A1A', color: '#888', border: '1px solid #2A2A2A' }}>
                        {f}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="flex flex-col gap-2 px-4">
                {filtered.length === 0 ? (
                    <div className="text-center py-12 text-[#555] text-sm">
                        Aucun combat{filter !== 'TOUT' ? ' ' + filter.toLowerCase() : ''} pour le moment.
                    </div>
                ) : filtered.map(item => (
                    <div key={item.id} className="flex items-center gap-3 rounded-2xl p-3.5"
                        style={{ background: '#1A1A1A' }}>
                        <div className="relative w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center"
                            style={{ background: '#2A2A2A' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#1A1A1A]"
                                style={{ background: item.won ? '#4CD964' : '#FF3B30' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{item.name}</p>
                            <p className="text-[#666] text-xs">{item.date}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="font-bold text-sm" style={{ color: item.won ? '#4CD964' : '#FF3B30' }}>
                                {item.amount}
                            </span>
                            {avisGiven.has(item.id) ? (
                                <span className="text-[#4CD964] text-[10px] font-semibold">✓ Avis donné</span>
                            ) : (
                                <button onClick={() => setAvisModal(item)}
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                                    style={{ background: 'rgba(255,170,136,0.12)', color: '#FFAA88' }}>
                                    AVIS
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {avisModal && (
                <AvisModal
                    opponent={avisModal.name}
                    onClose={() => {
                        setAvisGiven(prev => new Set([...prev, avisModal.id]));
                        setAvisModal(null);
                    }}
                />
            )}
        </div>
    );
}

function TransactionsTab({ transactions, balanceRb }) {
    const [filter, setFilter] = useState('TOUT');

    const filtered = filter === 'TOUT'       ? transactions
        : filter === 'RECHARGES'             ? transactions.filter(t => t.type === 'recharge')
        : transactions.filter(t => t.type === 'retrait');

    return (
        <div>
            {/* Solde card */}
            <div className="mx-4 mb-4 rounded-2xl p-4 flex items-center justify-between"
                style={{ background: '#1A1A1A' }}>
                <div>
                    <p className="text-[#888] text-xs mb-1">Solde actuel</p>
                    <p className="text-white font-black text-2xl">{balanceRb} RB</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/recharge" className="px-4 py-2 rounded-xl text-white font-semibold text-xs"
                        style={{ background: '#FF3B30' }}>
                        RECHARGER
                    </Link>
                    <Link href="/retrait" className="px-4 py-2 rounded-xl text-white font-semibold text-xs"
                        style={{ border: '1px solid #2A2A2A' }}>
                        RETIRER
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 px-4 mb-3">
                {['TOUT', 'RECHARGES', 'RETRAITS'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                        style={filter === f
                            ? { background: '#FF3B30', color: '#FFF' }
                            : { background: '#1A1A1A', color: '#888', border: '1px solid #2A2A2A' }}>
                        {f}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="flex flex-col gap-2 px-4">
                {filtered.length === 0 ? (
                    <div className="text-center py-12 text-[#555] text-sm">
                        Aucune transaction pour le moment.
                    </div>
                ) : filtered.map(tx => (
                    <div key={tx.id} className="flex items-center gap-3 rounded-2xl p-4"
                        style={{ background: '#1A1A1A' }}>
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: tx.type === 'recharge' ? 'rgba(76,217,100,0.1)' : 'rgba(255,59,48,0.1)' }}>
                            {tx.type === 'recharge' ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4CD964" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="12" y1="19" x2="12" y2="5"/>
                                    <polyline points="5 12 12 5 19 12"/>
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                    <polyline points="19 12 12 19 5 12"/>
                                </svg>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-semibold text-sm">{tx.label}</p>
                            <p className="text-[#666] text-xs mt-0.5">{tx.method} · {tx.date}</p>
                        </div>
                        <span className="font-bold text-sm"
                            style={{ color: tx.type === 'recharge' ? '#4CD964' : '#FF3B30' }}>
                            {tx.amount}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Historique({ combats = [], transactions = [], stats = { wins: 0, losses: 0, total_rb: 0 }, balance_rb = 0 }) {
    const [tab, setTab] = useState('COMBATS');

    return (
        <AppLayout>
            <TopBar />

            {/* Tabs */}
            <div className="flex px-4 mt-3 mb-4 border-b" style={{ borderColor: '#1E1E1E' }}>
                {[
                    { key: 'COMBATS',      label: 'Combats' },
                    { key: 'TRANSACTIONS', label: 'Transactions' },
                ].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className="flex-1 pb-3 text-sm font-bold tracking-wide transition-colors"
                        style={{
                            color: tab === t.key ? '#FF3B30' : '#555',
                            borderBottom: tab === t.key ? '2px solid #FF3B30' : '2px solid transparent',
                        }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'COMBATS'      && <CombatsTab combats={combats} stats={stats} />}
            {tab === 'TRANSACTIONS' && <TransactionsTab transactions={transactions} balanceRb={balance_rb} />}
        </AppLayout>
    );
}
