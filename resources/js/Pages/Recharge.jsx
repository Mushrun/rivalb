import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '../Components/AppLayout';
import { useRBDeposit }   from '../hooks/useRBDeposit';
import { useUSDTDeposit } from '../hooks/useUSDTDeposit';

const statusLabel = { en_attente: 'EN ATTENTE', valide: 'VALIDÉ', refuse: 'REFUSÉ' };
const statusColor = { en_attente: '#FF9500', valide: '#4CD964', refuse: '#FF3B30' };
const statusBg    = { en_attente: 'rgba(255,149,0,0.12)', valide: 'rgba(76,217,100,0.12)', refuse: 'rgba(255,59,48,0.12)' };

export default function Recharge() {
    const { balance, balance_usdt, history, flash, auth } = usePage().props;
    const walletConnected = !!auth?.user?.wallet_address;

    const [tab,     setTab]     = useState('rb');
    const [amount,  setAmount]  = useState('');
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState('');

    const rb   = useRBDeposit();
    const usdt = useUSDTDeposit();
    const hook = tab === 'usdt' ? usdt : rb;

    const numVal   = parseFloat(amount) || 0;
    const minOk    = tab === 'usdt' ? numVal >= 1 : numVal >= 500;
    const formValid = minOk && walletConnected;

    const handleDeposit = async () => {
        if (!formValid || sending) return;
        setSending(true);
        setSuccess('');

        if (tab === 'usdt') {
            const result = await usdt.deposit(numVal);
            if (!result) { setSending(false); return; }
            router.post('/recharge', { tx_hash: result.hash, amount_usdt: result.amountUSDT, currency: 'usdt' }, {
                onSuccess: () => { setSuccess('Dépôt USDT soumis ! Vérification en cours.'); setAmount(''); usdt.reset(); },
                onError:   () => usdt.reset(),
                onFinish:  () => setSending(false),
            });
        } else {
            const result = await rb.deposit(numVal);
            if (!result) { setSending(false); return; }
            router.post('/recharge', { tx_hash: result.hash, amount_rb: result.amountRB, currency: 'rb' }, {
                onSuccess: () => { setSuccess('Dépôt RB soumis ! Vérification en cours.'); setAmount(''); rb.reset(); },
                onError:   () => rb.reset(),
                onFinish:  () => setSending(false),
            });
        }
    };

    return (
        <AppLayout>
            <div className="flex items-center gap-3 px-4 pt-5 pb-4">
                <Link href="/historique">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="15 18 9 12 15 6"/>
                    </svg>
                </Link>
                <h1 className="text-white font-black text-lg">Recharger</h1>
            </div>

            <div className="px-4 flex flex-col gap-5 pb-10">

                {(flash?.success || success) && (
                    <div className="rounded-xl px-4 py-3 flex items-center gap-2"
                        style={{ background: 'rgba(76,217,100,0.12)', border: '1px solid rgba(76,217,100,0.25)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4CD964" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span className="text-[#4CD964] text-sm">{flash?.success || success}</span>
                    </div>
                )}

                {/* Soldes */}
                <div className="flex gap-3">
                    <div className="flex-1 rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                        <p className="text-[#888] text-xs mb-0.5">Solde RB</p>
                        <p className="text-white font-black text-xl">{(balance ?? 0).toLocaleString()} RB</p>
                    </div>
                    <div className="flex-1 rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                        <p className="text-[#888] text-xs mb-0.5">Solde USDT</p>
                        <p className="text-white font-black text-xl">{parseFloat(balance_usdt ?? 0).toFixed(2)} USDT</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex rounded-xl p-1 gap-1" style={{ background: '#1A1A1A' }}>
                    {[{ key: 'rb', label: '🪙 Token RB' }, { key: 'usdt', label: '💵 USDT' }].map(t => (
                        <button key={t.key} onClick={() => { setTab(t.key); setAmount(''); hook.reset(); }}
                            className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
                            style={{
                                background: tab === t.key ? '#FF3B30' : 'transparent',
                                color:      tab === t.key ? '#FFF'    : '#555',
                            }}>
                            {t.label}
                        </button>
                    ))}
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
                            <p className="text-[#888] text-xs">Connecte ton MetaMask dans les paramètres.</p>
                            <Link href="/settings" className="text-[#FF9500] text-xs font-bold underline mt-1 inline-block">
                                Connecter MetaMask →
                            </Link>
                        </div>
                    </div>
                )}

                {/* Montant */}
                <div>
                    <p className="text-[#888] text-xs font-semibold tracking-wider mb-2">
                        {tab === 'usdt' ? 'MONTANT EN USDT' : 'MONTANT EN RB'}
                    </p>
                    <div className="relative">
                        <input
                            type="number" value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder={tab === 'usdt' ? 'Min 1 USDT' : 'Min 500 RB'}
                            className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none pr-16"
                            style={{ background: '#1A1A1A', border: `1px solid ${numVal > 0 && !minOk ? '#FF9500' : '#2A2A2A'}` }}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] text-sm font-semibold">
                            {tab === 'usdt' ? 'USDT' : 'RB'}
                        </span>
                    </div>

                    {numVal > 0 && !minOk && (
                        <p className="text-[#FF9500] text-xs mt-1.5">
                            {tab === 'usdt' ? 'Minimum 1 USDT' : 'Minimum 500 RB'}
                        </p>
                    )}

                    <div className="flex gap-2 mt-3">
                        {(tab === 'usdt' ? [1, 5, 10, 50] : [500, 1000, 2500, 5000]).map(v => (
                            <button key={v} onClick={() => setAmount(String(v))}
                                className="flex-1 rounded-xl py-2 text-xs font-bold"
                                style={{
                                    background: amount == v ? 'rgba(255,59,48,0.15)' : '#1A1A1A',
                                    border: `1px solid ${amount == v ? '#FF3B30' : '#2A2A2A'}`,
                                    color: amount == v ? '#FF3B30' : '#888',
                                }}>
                                {v}{tab === 'usdt' ? '$' : ''}
                            </button>
                        ))}
                    </div>
                </div>

                {hook.error && (
                    <div className="rounded-xl px-4 py-3"
                        style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)' }}>
                        <p className="text-[#FF3B30] text-xs">{hook.error}</p>
                    </div>
                )}

                {hook.status === 'submitted' && hook.txHash && (
                    <div className="rounded-xl px-4 py-3"
                        style={{ background: 'rgba(76,217,100,0.08)', border: '1px solid rgba(76,217,100,0.2)' }}>
                        <p className="text-[#4CD964] text-xs font-bold mb-1">Transaction envoyée ✓</p>
                        <p className="text-[#555] text-[10px] font-mono break-all">{hook.txHash}</p>
                    </div>
                )}

                <div className="rounded-xl p-3" style={{ background: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.2)' }}>
                    <p className="text-[#FF9500] text-xs text-center">
                        {tab === 'usdt'
                            ? 'Envoie des USDT (BSC BEP-20) depuis MetaMask. Crédité sur ton solde USDT.'
                            : 'Envoie des tokens RB (BSC BEP-20) depuis MetaMask. Crédité sur ton solde RB.'}
                    </p>
                </div>

                <button onClick={handleDeposit} disabled={!formValid || sending}
                    className="w-full rounded-2xl py-4 font-black text-sm flex items-center justify-center gap-2"
                    style={{
                        background: formValid && !sending ? '#FF3B30' : '#1A1A1A',
                        color:      formValid && !sending ? '#FFF'    : '#333',
                        transition: 'background 0.15s',
                    }}>
                    {sending && (
                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                    )}
                    {hook.status === 'pending'
                        ? 'Confirme dans MetaMask...'
                        : `🦊 DÉPOSER ${tab === 'usdt' ? 'EN USDT' : 'EN RB'}`}
                </button>

                {history?.length > 0 && (
                    <div>
                        <p className="text-[#888] text-xs font-semibold tracking-wider mb-3">HISTORIQUE DES DÉPÔTS</p>
                        <div className="rounded-2xl overflow-hidden" style={{ background: '#1A1A1A' }}>
                            {history.map((tx, i) => (
                                <div key={tx.id} className="flex items-center justify-between px-4 py-3.5"
                                    style={{ borderBottom: i < history.length - 1 ? '1px solid #0D0D0D' : 'none' }}>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm" style={{ color: tx.currency === 'usdt' ? '#4CD964' : '#FFAA88' }}>
                                            +{tx.currency === 'usdt'
                                                ? `${tx.amount_usdt} USDT`
                                                : `${tx.amount_rb.toLocaleString()} RB`}
                                        </p>
                                        <p className="text-[#555] text-[10px] font-mono truncate">{tx.tx_hash}</p>
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
