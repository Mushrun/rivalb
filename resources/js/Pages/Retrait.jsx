import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppLayout from '../Components/AppLayout';

const statusColor = { en_attente: '#FF9500', valide: '#4CD964', refuse: '#FF3B30' };
const statusBg    = { en_attente: 'rgba(255,149,0,0.12)', valide: 'rgba(76,217,100,0.12)', refuse: 'rgba(255,59,48,0.12)' };

export default function Retrait() {
    const { balance_rb, balance_usdt, minAmountRb, minAmountUsdt, rate, history, errors, flash, auth } = usePage().props;
    const { t } = useTranslation();
    const statusLabel = {
        en_attente: t('retrait.status_waiting'),
        valide:     t('retrait.status_validated'),
        refuse:     t('retrait.status_refused'),
    };

    const walletAddress   = auth?.user?.wallet_address ?? '';
    const walletConnected = !!walletAddress;

    const [tab,     setTab]     = useState('rb');
    const [amount,  setAmount]  = useState('');
    const [sending, setSending] = useState(false);

    const isUsdt   = tab === 'usdt';
    const numVal   = parseFloat(amount) || 0;
    const minRb    = minAmountRb  ?? 500;
    const minUsdt  = minAmountUsdt ?? 1;

    const rbVal    = isUsdt ? 0 : (parseInt(amount) || 0);
    const usdtVal  = isUsdt ? numVal : (rbVal > 0 ? rbVal / (rate ?? 500) : 0);

    const amountOk = isUsdt
        ? (numVal >= minUsdt && numVal <= (parseFloat(balance_usdt) || 0))
        : (rbVal  >= minRb   && rbVal  <= (balance_rb ?? 0));

    const formValid = amountOk && walletConnected;

    const handleSubmit = () => {
        if (!formValid || sending) return;
        setSending(true);
        const payload = isUsdt
            ? { currency: 'usdt', amount_usdt: numVal, wallet_address: walletAddress }
            : { currency: 'rb',   amount_rb: rbVal,    wallet_address: walletAddress };
        router.post('/retrait', payload, { onFinish: () => setSending(false) });
    };

    const switchTab = (t) => { setTab(t); setAmount(''); };

    return (
        <AppLayout>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 pt-5 pb-4">
                <Link href="/historique">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="15 18 9 12 15 6"/>
                    </svg>
                </Link>
                <h1 className="text-white font-black text-lg">{t('retrait.title')}</h1>
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

                {/* Soldes */}
                <div className="flex gap-3">
                    <div className="flex-1 rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                        <p className="text-[#888] text-xs mb-0.5">{t('retrait.available_rb')}</p>
                        <p className="text-white font-black text-xl">{(balance_rb ?? 0).toLocaleString()} RB</p>
                    </div>
                    <div className="flex-1 rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                        <p className="text-[#888] text-xs mb-0.5">{t('retrait.available_usdt')}</p>
                        <p className="text-white font-black text-xl">{parseFloat(balance_usdt ?? 0).toFixed(2)} USDT</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex rounded-xl p-1 gap-1" style={{ background: '#1A1A1A' }}>
                    {[{ key: 'rb', label: t('retrait.tab_rb') }, { key: 'usdt', label: t('retrait.tab_usdt') }].map(item => (
                        <button key={item.key} onClick={() => switchTab(item.key)}
                            className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
                            style={{
                                background: tab === item.key ? '#FF3B30' : 'transparent',
                                color:      tab === item.key ? '#FFF'    : '#555',
                            }}>
                            {item.label}
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
                            <p className="text-[#FF9500] text-sm font-bold mb-1">{t('recharge.wallet_not_connected')}</p>
                            <p className="text-[#888] text-xs">{t('retrait.wallet_hint_full')}</p>
                            <Link href="/settings" className="text-[#FF9500] text-xs font-bold underline mt-1 inline-block">
                                {t('recharge.connect_metamask')}
                            </Link>
                        </div>
                    </div>
                )}

                {/* Wallet connecté */}
                {walletConnected && (
                    <div className="rounded-xl px-4 py-3 flex items-center gap-3"
                        style={{ background: 'rgba(76,217,100,0.08)', border: '1px solid rgba(76,217,100,0.2)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4CD964" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="15" rx="2"/>
                            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                            <circle cx="17" cy="14" r="1" fill="#4CD964" stroke="none"/>
                        </svg>
                        <div className="flex-1 min-w-0">
                            <p className="text-[#4CD964] text-[10px] font-bold tracking-wider">{t('retrait.wallet_reception')}</p>
                            <p className="text-white text-xs font-mono truncate">{walletAddress}</p>
                        </div>
                        <Link href="/settings" className="text-[#555] text-[10px] underline flex-shrink-0">{t('retrait.change')}</Link>
                    </div>
                )}

                {/* Montant */}
                <div>
                    <p className="text-[#888] text-xs font-semibold tracking-wider mb-2">
                        {isUsdt ? t('retrait.amount_label_usdt') : t('retrait.amount_label')}
                    </p>
                    <div className="relative">
                        <input
                            type="number" value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder={isUsdt ? `Min ${minUsdt} USDT` : `Min ${minRb} RB`}
                            max={isUsdt ? (parseFloat(balance_usdt) || 0) : (balance_rb ?? 0)}
                            className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none pr-16"
                            style={{
                                background: '#1A1A1A',
                                border: `1px solid ${
                                    (isUsdt && numVal > (parseFloat(balance_usdt) || 0)) ||
                                    (!isUsdt && rbVal > (balance_rb ?? 0))
                                        ? '#FF3B30' : '#2A2A2A'
                                }`,
                            }}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] text-sm font-semibold">
                            {isUsdt ? 'USDT' : 'RB'}
                        </span>
                    </div>

                    {/* Erreurs */}
                    {isUsdt ? (
                        <>
                            {numVal > (parseFloat(balance_usdt) || 0) && numVal > 0 && (
                                <p className="text-[#FF3B30] text-xs mt-1.5">{t('retrait.insufficient_usdt')}</p>
                            )}
                            {numVal > 0 && numVal < minUsdt && (
                                <p className="text-[#FF9500] text-xs mt-1.5">{t('retrait.min_amount_usdt')}</p>
                            )}
                        </>
                    ) : (
                        <>
                            {rbVal > (balance_rb ?? 0) && rbVal > 0 && (
                                <p className="text-[#FF3B30] text-xs mt-1.5">{t('retrait.insufficient')}</p>
                            )}
                            {rbVal > 0 && rbVal < minRb && (
                                <p className="text-[#FF9500] text-xs mt-1.5">{t('retrait.min_rb_amount', { min: minRb })}</p>
                            )}
                            {errors?.amount_rb && <p className="text-[#FF3B30] text-xs mt-1">{errors.amount_rb}</p>}
                        </>
                    )}

                    {/* Raccourcis */}
                    <div className="flex gap-2 mt-3">
                        {isUsdt
                            ? [1, 5, 10, 50].map(v => (
                                <button key={v} onClick={() => setAmount(String(v))}
                                    className="flex-1 rounded-xl py-2 text-xs font-bold"
                                    style={{
                                        background: amount == v ? 'rgba(255,59,48,0.15)' : '#1A1A1A',
                                        border: `1px solid ${amount == v ? '#FF3B30' : '#2A2A2A'}`,
                                        color: amount == v ? '#FF3B30' : '#888',
                                    }}>
                                    {v}$
                                </button>
                            ))
                            : [25, 50, 100].map(pct => {
                                const v = Math.floor((balance_rb ?? 0) * pct / 100);
                                return (
                                    <button key={pct} onClick={() => setAmount(String(v))}
                                        className="flex-1 rounded-xl py-2 text-xs font-bold"
                                        style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#888' }}>
                                        {pct}% ({v.toLocaleString()} RB)
                                    </button>
                                );
                            })
                        }
                    </div>
                </div>

                {/* Récap conversion (RB → USDT) */}
                {!isUsdt && amountOk && (
                    <div className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[#888] text-xs">{t('retrait.rb_withdrawn')}</span>
                            <span className="text-[#FF3B30] font-bold text-sm">-{rbVal.toLocaleString()} RB</span>
                        </div>
                        <div className="h-px my-2" style={{ background: '#2A2A2A' }} />
                        <div className="flex items-center justify-between">
                            <span className="text-[#888] text-xs">{t('retrait.you_receive')}</span>
                            <span className="text-[#4CD964] font-black text-lg">~{usdtVal.toFixed(4)} USDT</span>
                        </div>
                    </div>
                )}

                {/* Récap USDT direct */}
                {isUsdt && amountOk && (
                    <div className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                        <div className="flex items-center justify-between">
                            <span className="text-[#888] text-xs">{t('retrait.usdt_withdrawn')}</span>
                            <span className="text-[#FF3B30] font-bold text-lg">-{numVal.toFixed(2)} USDT</span>
                        </div>
                    </div>
                )}

                {/* Info */}
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.2)' }}>
                    <p className="text-[#FF9500] text-xs text-center">
                        {isUsdt ? t('retrait.info_usdt') : t('retrait.info')}
                    </p>
                </div>

                <button onClick={handleSubmit} disabled={!formValid || sending}
                    className="w-full rounded-2xl py-4 font-black text-sm"
                    style={{
                        background: formValid && !sending ? '#FF3B30' : '#1A1A1A',
                        color: formValid && !sending ? '#FFF' : '#333',
                        transition: 'background 0.15s',
                    }}>
                    {sending ? t('retrait.processing') : t('retrait.confirm_btn')}
                </button>

                {/* Historique */}
                {history?.length > 0 && (
                    <div>
                        <p className="text-[#888] text-xs font-semibold tracking-wider mb-3">{t('retrait.history_title')}</p>
                        <div className="rounded-2xl overflow-hidden" style={{ background: '#1A1A1A' }}>
                            {history.map((tx, i) => (
                                <div key={tx.id} className="flex items-center justify-between px-4 py-3.5"
                                    style={{ borderBottom: i < history.length - 1 ? '1px solid #0D0D0D' : 'none' }}>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm" style={{ color: tx.currency === 'usdt' ? '#FF9500' : '#FF3B30' }}>
                                            -{tx.currency === 'usdt'
                                                ? `${parseFloat(tx.amount_usdt ?? 0).toFixed(2)} USDT`
                                                : `${(tx.amount_rb ?? 0).toLocaleString()} RB`}
                                        </p>
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
