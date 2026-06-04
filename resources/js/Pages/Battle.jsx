import { Link, usePage } from '@inertiajs/react';
import AppLayout from '../Components/AppLayout';
import TopBar from '../Components/TopBar';

function ReliabilityDot({ value }) {
    const color = value >= 80 ? '#4CD964' : value >= 60 ? '#FF9500' : '#FF3B30';
    return <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />;
}

export default function Battle() {
    const { challenges = [], auth } = usePage().props;
    const balance     = auth?.user?.balance_rb   ?? 0;
    const balanceUsdt = auth?.user?.balance_usdt ?? 0;

    return (
        <AppLayout>
            <TopBar />

            {/* Balance card */}
            <div className="mx-4 mt-2 rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="text-[#888888] text-xs mb-0.5">Solde disponible :</p>
                        <p className="text-white font-bold text-lg">{balance.toLocaleString()} RB</p>
                        {parseFloat(balanceUsdt) > 0 && (
                            <p className="text-[#4CD964] font-bold text-sm">{parseFloat(balanceUsdt).toFixed(2)} USDT</p>
                        )}
                    </div>
                    <Link href="/challenge/create/1"
                        className="px-3 py-2 rounded-xl text-white font-bold text-xs"
                        style={{ background: '#FF3B30' }}>
                        Lancer un défi
                    </Link>
                </div>
                <div className="flex gap-3">
                    <Link href="/recharge" className="flex-1 rounded-xl py-2 text-xs font-semibold tracking-wider text-[#CCCCCC] text-center"
                        style={{ border: '1px solid #2A2A2A', background: '#0D0D0D' }}>
                        RECHARGER
                    </Link>
                    <Link href="/retrait" className="flex-1 rounded-xl py-2 text-xs font-semibold tracking-wider text-[#CCCCCC] text-center"
                        style={{ border: '1px solid #2A2A2A', background: '#0D0D0D' }}>
                        RETIRER
                    </Link>
                </div>
            </div>

            {/* Header */}
            <div className="px-4 mt-5 mb-3">
                <h2 className="text-white font-bold text-base">Défis disponibles</h2>
                <p className="text-[#555555] text-xs mt-0.5">Défis lancés par d'autres joueurs — accepte pour jouer</p>
            </div>

            {/* List */}
            <div className="flex flex-col gap-2 px-4">
                {challenges.length === 0 ? (
                    <div className="rounded-2xl p-8 flex flex-col items-center gap-2" style={{ background: '#1A1A1A' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
                            <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/>
                            <line x1="13" y1="19" x2="19" y2="13"/>
                        </svg>
                        <p className="text-[#555] text-sm text-center">Aucun défi disponible pour l'instant.<br/>Lance le premier !</p>
                    </div>
                ) : (
                    challenges.map(c => (
                        <div key={c.id} className="flex items-center gap-3 rounded-2xl p-3.5" style={{ background: '#1A1A1A' }}>
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-white text-lg"
                                style={{ background: '#FF3B30' }}>
                                {c.creator.username?.[0]?.toUpperCase()}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-white font-semibold text-sm truncate">{c.creator.username}</span>
                                    <span className="text-[#555] text-xs">{c.type}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <ReliabilityDot value={c.creator.reliability_score} />
                                    <span className="text-[10px] text-[#888]">Fiabilité {c.creator.reliability_score}%</span>
                                    <span className="text-[#555] text-xs mx-1">·</span>
                                    <span className="text-[#888] text-xs">{c.created_at}</span>
                                </div>
                            </div>

                            {/* Amount + button */}
                            <div className="flex flex-col items-end gap-2">
                                <span className="text-[#FF3B30] font-black text-lg">
                                    {c.bet_amount} {c.currency === 'usdt' ? 'USDT' : 'RB'}
                                </span>
                                <Link href={`/defis/${c.id}`}
                                    className="px-3 py-1.5 rounded-lg font-bold text-xs"
                                    style={{ background: '#2A2A2A', color: '#CCCCCC', border: '1px solid #3A3A3A' }}>
                                    En savoir +
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </AppLayout>
    );
}
