import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '../Components/AppLayout';

const statusLabel = { en_attente: 'EN ATTENTE', valide: 'VALIDÉ', refuse: 'REFUSÉ' };
const statusColor = { en_attente: '#FF9500', valide: '#4CD964', refuse: '#FF3B30' };
const statusBg    = { en_attente: 'rgba(255,149,0,0.12)', valide: 'rgba(76,217,100,0.12)', refuse: 'rgba(255,59,48,0.12)' };

export default function Retrait() {
    const { balance, minAmount, rate, history, errors, flash, auth } = usePage().props;

    const walletAddress = auth?.user?.wallet_address ?? '';
    const walletConnected = !!walletAddress;

    const [amount,  setAmount]  = useState('');
    const [sending, setSending] = useState(false);

    const rb          = parseInt(amount) || 0;
    const usdt        = rb > 0 ? (rb / (rate ?? 500)).toFixed(4) : '0.0000';
    const amountValid = rb >= (minAmount ?? 500) && rb <= (balance ?? 0);
    const formValid   = amountValid && walletConnected;

    const handleSubmit = () => {
        if (!formValid || sending) return;
        setSending(true);
        router.post('/retrait', { amount_rb: rb, wallet_address: walletAddress }, {
            onFinish: () => setSending(false),
        });
    };

    return (
        <AppLayout>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 pt-5 pb-4">
                <Link href="/historique">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="15 18 9 12 15 6"/>
                    </svg>
                </Link>
                <h1 className="text-white font-black text-lg">Retirer mes RB</h1>
            </div>

            <div className="px-4 flex flex-col gap-5 pb-10">

                {/* Flash */}
                {flash?.success && (
                    <div className="rounded-xl px-4 py-3 flex items-center gap-2"
                        style={{ background: 'rgba(76,217,100,0.12)', border: '1px solid rgba(76,217,100,0.25)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4CD964" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span className="text-[#4CD964] text-sm">{flash.success}</span>
                    </div>
                )}

                {/* Solde */}
                <div className="rounded-2xl p-4 flex items-center justify-between"
                    style={{ background: '#1A1A1A' }}>
                    <div>
                        <p className="text-[#888] text-xs mb-0.5">Solde disponible</p>
                        <p className="text-white font-black text-2xl">{(balance ?? 0).toLocaleString()} RB</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[#555] text-xs mb-0.5">Minimum</p>
                        <p className="text-[#888] text-sm font-bold">{minAmount ?? 500} RB</p>
                    </div>
                </div>

                {/* Wallet non connecté */}
                {!walletConnected && (
                    <div className="rounded-xl p-4 flex items-start gap-3"
                        style={{ background: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.3)' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <div>
                            <p className="text-[#FF9500] text-sm font-bold mb-1">Wallet non connecté</p>
                            <p className="text-[#888] text-xs">Tu dois connecter ton MetaMask dans les paramètres pour retirer.</p>
                            <Link href="/settings" className="text-[#FF9500] text-xs font-bold underline mt-1 inline-block">
                                Connecter MetaMask →
                            </Link>
                        </div>
                    </div>
                )}

                {/* Wallet connecté — affichage adresse */}
                {walletConnected && (
                    <div className="rounded-xl px-4 py-3 flex items-center gap-3"
                        style={{ background: 'rgba(76,217,100,0.08)', border: '1px solid rgba(76,217,100,0.2)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4CD964" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="15" rx="2"/>
                            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                            <circle cx="17" cy="14" r="1" fill="#4CD964" stroke="none"/>
                        </svg>
                        <div className="flex-1 min-w-0">
                            <p className="text-[#4CD964] text-[10px] font-bold tracking-wider">WALLET DE RÉCEPTION</p>
                            <p className="text-white text-xs font-mono truncate">{walletAddress}</p>
                        </div>
                        <Link href="/settings" className="text-[#555] text-[10px] underline flex-shrink-0">Changer</Link>
                    </div>
                )}

                {/* Montant */}
                <div>
                    <p className="text-[#888] text-xs font-semibold tracking-wider mb-2">MONTANT À RETIRER</p>
                    <div className="relative">
                        <input
                            type="number" value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder={`Min ${minAmount ?? 500} RB`}
                            max={balance ?? 0}
                            className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none pr-14"
                            style={{ background: '#1A1A1A', border: `1px solid ${errors?.amount_rb || rb > (balance ?? 0) ? '#FF3B30' : '#2A2A2A'}` }}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] text-sm font-semibold">RB</span>
                    </div>
                    {rb > (balance ?? 0) && <p className="text-[#FF3B30] text-xs mt-1.5">Solde insuffisant</p>}
                    {rb > 0 && rb < (minAmount ?? 500) && <p className="text-[#FF9500] text-xs mt-1.5">Minimum {minAmount ?? 500} RB</p>}
                    {errors?.amount_rb && <p className="text-[#FF3B30] text-xs mt-1">{errors.amount_rb}</p>}

                    {/* Raccourcis */}
                    <div className="flex gap-2 mt-3">
                        {[25, 50, 100].map(pct => {
                            const v = Math.floor((balance ?? 0) * pct / 100);
                            return (
                                <button key={pct} onClick={() => setAmount(String(v))}
                                    className="flex-1 rounded-xl py-2 text-xs font-bold"
                                    style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#888' }}>
                                    {pct}% ({v.toLocaleString()} RB)
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Conversion */}
                {amountValid && (
                    <div className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[#888] text-xs">RB retirés</span>
                            <span className="text-[#FF3B30] font-bold text-sm">-{rb.toLocaleString()} RB</span>
                        </div>
                        <div className="h-px my-2" style={{ background: '#2A2A2A' }} />
                        <div className="flex items-center justify-between">
                            <span className="text-[#888] text-xs">Tu recevras environ</span>
                            <span className="text-[#4CD964] font-black text-lg">~{usdt} USDT</span>
                        </div>
                    </div>
                )}

                {/* Info */}
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.2)' }}>
                    <p className="text-[#FF9500] text-xs text-center">
                        Les RB sont réservés immédiatement. Envoi des tokens RB sur ton wallet sous 24h.
                    </p>
                </div>

                <button onClick={handleSubmit} disabled={!formValid || sending}
                    className="w-full rounded-2xl py-4 font-black text-sm"
                    style={{
                        background: formValid && !sending ? '#FF3B30' : '#1A1A1A',
                        color: formValid && !sending ? '#FFF' : '#333',
                        transition: 'background 0.15s',
                    }}>
                    {sending ? 'ENVOI...' : 'CONFIRMER LE RETRAIT'}
                </button>

                {/* Historique */}
                {history?.length > 0 && (
                    <div>
                        <p className="text-[#888] text-xs font-semibold tracking-wider mb-3">HISTORIQUE DES RETRAITS</p>
                        <div className="rounded-2xl overflow-hidden" style={{ background: '#1A1A1A' }}>
                            {history.map((tx, i) => (
                                <div key={tx.id} className="flex items-center justify-between px-4 py-3.5"
                                    style={{ borderBottom: i < history.length - 1 ? '1px solid #0D0D0D' : 'none' }}>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[#FF3B30] font-bold text-sm">-{tx.amount_rb.toLocaleString()} RB</p>
                                        <p className="text-[#555] text-[10px] font-mono truncate">{tx.wallet_address}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                                            style={{ background: statusBg[tx.status], color: statusColor[tx.status] }}>
                                            {statusLabel[tx.status] ?? tx.status.toUpperCase()}
                                        </span>
                                        <span className="text-[#555] text-[10px]">{tx.created_at}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
