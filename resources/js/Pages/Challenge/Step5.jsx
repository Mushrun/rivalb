import BottomNav from '../../Components/BottomNav';
import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

function StepProgress({ current, total }) {
    return (
        <div className="flex gap-1 w-full">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className="flex-1 h-0.5 rounded-full"
                    style={{ background: i < current ? '#FF3B30' : '#2A1A1A' }} />
            ))}
        </div>
    );
}

export default function ChallengeStep5() {
    const { t } = useTranslation();
    const { balance = 0, balance_usdt = 0 } = usePage().props;

    const [currency, setCurrency] = useState('rb');
    const [raw,      setRaw]      = useState('');

    const max   = currency === 'usdt' ? parseFloat(balance_usdt) : balance;
    const value = parseInt(raw, 10) || 0;
    const valid = value >= 1 && value <= max;

    const handleChange = (e) => {
        setRaw(e.target.value.replace(/[^0-9]/g, ''));
    };

    const handleCurrency = (c) => {
        setCurrency(c);
        setRaw('');
    };

    return (
        <div className="flex justify-center min-h-screen" style={{ background: '#110808' }}>
            <div className="w-full max-w-[430px] min-h-screen flex flex-col" style={{ background: '#110808' }}>

                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-4">
                    <Link href="/challenge/create/4">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </Link>
                    <span className="text-[#CCCCCC] text-sm font-medium">{t('challenge.step_indicator', { step: 5, total: 6 })}</span>
                    <div className="w-5" />
                </div>

                <div className="px-4 mb-8">
                    <StepProgress current={5} total={6} />
                </div>

                <div className="flex-1" />

                {/* Main card */}
                <div className="mx-4 rounded-3xl p-6" style={{ background: '#1A0A0A' }}>
                    <h2 className="text-white font-black text-2xl text-center mb-5">{t('challenge.set_bet')}</h2>

                    {/* Sélection devise */}
                    <div className="flex rounded-xl p-1 gap-1 mb-5" style={{ background: '#0D0505' }}>
                        {[{ key: 'rb', label: '🪙 RB' }, { key: 'usdt', label: '💵 USDT' }].map(t => (
                            <button key={t.key} onClick={() => handleCurrency(t.key)}
                                className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                                style={{
                                    background: currency === t.key ? '#FF3B30' : 'transparent',
                                    color:      currency === t.key ? '#FFF'    : '#555',
                                }}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Saisie montant */}
                    <div className="rounded-2xl px-4 py-3 flex items-center justify-center gap-2 mb-3"
                        style={{ background: '#0D0505', border: `1.5px solid ${valid ? '#FF7766' : '#3A1A1A'}` }}>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={raw}
                            onChange={handleChange}
                            placeholder="0"
                            className="bg-transparent text-center font-black text-3xl outline-none w-28"
                            style={{ color: '#FF7766' }}
                        />
                        <span className="font-black text-2xl" style={{ color: '#FF7766' }}>
                            {currency === 'usdt' ? 'USDT' : 'RB'}
                        </span>
                    </div>

                    {/* Solde dispo */}
                    <p className="text-center text-[#666] text-xs mb-4">
                        {t('challenge.balance_label')}{' '}
                        <span className="text-[#FF7766] font-bold">
                            {currency === 'usdt' ? `${parseFloat(balance_usdt).toFixed(2)} USDT` : `${balance} RB`}
                        </span>
                    </p>

                    {raw !== '' && !valid && (
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                                style={{ border: '1px solid #3A1A1A' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF7766" strokeWidth="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                    <line x1="12" y1="9" x2="12" y2="13"/>
                                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                                <span className="text-[#FF7766] text-xs">
                                    {value < 1 ? t('challenge.min_one') : t('challenge.max_balance', { max })}
                                </span>
                            </div>
                        </div>
                    )}

                    {valid && (
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                                style={{ border: '1px solid #3A1A1A' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF7766" strokeWidth="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                    <line x1="12" y1="9" x2="12" y2="13"/>
                                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                                <span className="text-[#FF7766] text-xs">{t('challenge.risk_warning')}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1" />

                {/* Button */}
                <div className="px-4 pt-6" style={{ paddingBottom: '100px' }}>
                    <button
                        disabled={!valid}
                        onClick={() => {
                            sessionStorage.setItem('ch_bet', value);
                            sessionStorage.setItem('ch_currency', currency);
                            sessionStorage.setItem('ch_visibility', 'public');
                            router.visit('/challenge/create/6');
                        }}
                        className="w-full rounded-2xl py-3 font-bold text-sm flex items-center justify-center gap-2"
                        style={{ background: valid ? '#FF7766' : '#2A1A1A', color: valid ? '#1A0808' : '#555' }}>
                        {t('challenge.continue_btn')} <span className="text-lg">→</span>
                    </button>
                </div>
            <BottomNav />
            </div>
        </div>
    );
}
