import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppLayout from '../Components/AppLayout';

export default function Parrainage() {
    const { referral_code, referral_link, referrees_count, referrees, commissions_rb, commissions_usdt } = usePage().props;
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard.writeText(referral_link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <AppLayout>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 pt-5 pb-4">
                <Link href="/profil">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="15 18 9 12 15 6"/>
                    </svg>
                </Link>
                <h1 className="text-white font-black text-lg">{t('referral.title')}</h1>
            </div>

            <div className="px-4 flex flex-col gap-5 pb-10">

                {/* Stats */}
                <div className="flex gap-3">
                    <div className="flex-1 rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                        <p className="text-[#888] text-xs mb-0.5">{t('referral.referrees')}</p>
                        <p className="text-white font-black text-2xl">{referrees_count}</p>
                    </div>
                    <div className="flex-1 rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                        <p className="text-[#888] text-xs mb-0.5">{t('referral.earned_rb')}</p>
                        <p className="text-[#FF3B30] font-black text-xl">{commissions_rb.toLocaleString()} RB</p>
                    </div>
                    <div className="flex-1 rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                        <p className="text-[#888] text-xs mb-0.5">{t('referral.earned_usdt')}</p>
                        <p className="text-[#4CD964] font-black text-xl">{commissions_usdt.toFixed(2)} USDT</p>
                    </div>
                </div>

                {/* Lien */}
                <div className="rounded-2xl p-5" style={{ background: '#1A1A1A' }}>
                    <p className="text-[#888] text-xs font-semibold tracking-wider mb-3">{t('referral.your_link')}</p>

                    {/* Code */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 rounded-xl px-4 py-3 font-mono text-sm text-white tracking-widest"
                            style={{ background: '#0D0D0D', border: '1px solid #2A2A2A' }}>
                            {referral_code}
                        </div>
                    </div>

                    {/* URL + copier */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1 rounded-xl px-3 py-2.5 text-xs text-[#888] truncate"
                            style={{ background: '#0D0D0D', border: '1px solid #2A2A2A' }}>
                            {referral_link}
                        </div>
                        <button onClick={copy}
                            className="px-4 py-2.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all"
                            style={{
                                background: copied ? 'rgba(76,217,100,0.15)' : 'rgba(255,59,48,0.15)',
                                border: `1px solid ${copied ? '#4CD964' : '#FF3B30'}`,
                                color: copied ? '#4CD964' : '#FF3B30',
                            }}>
                            {copied ? t('referral.copied') : t('referral.copy')}
                        </button>
                    </div>
                </div>

                {/* Comment ça marche */}
                <div className="rounded-2xl p-5" style={{ background: '#1A1A1A' }}>
                    <p className="text-white font-bold text-sm mb-4">{t('referral.how_it_works')}</p>
                    <div className="flex flex-col gap-3">
                        {[
                            { icon: '🔗', text: t('referral.step1') },
                            { icon: '👤', text: t('referral.step2') },
                            { icon: '💰', text: t('referral.step3_rb') },
                            { icon: '💵', text: t('referral.step3_usdt') },
                        ].map((s, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <span className="text-lg flex-shrink-0">{s.icon}</span>
                                <p className="text-[#888] text-xs leading-relaxed">{s.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Liste filleuls */}
                {referrees.length > 0 && (
                    <div>
                        <p className="text-[#888] text-xs font-semibold tracking-wider mb-3">{t('referral.referrees_list')}</p>
                        <div className="rounded-2xl overflow-hidden" style={{ background: '#1A1A1A' }}>
                            {referrees.map((r, i) => (
                                <div key={r.id}
                                    className="flex items-center justify-between px-4 py-3.5"
                                    style={{ borderBottom: i < referrees.length - 1 ? '1px solid #0D0D0D' : 'none' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white"
                                            style={{ background: '#FF3B30' }}>
                                            {r.username[0].toUpperCase()}
                                        </div>
                                        <p className="text-white text-sm font-semibold">@{r.username}</p>
                                    </div>
                                    <p className="text-[#555] text-xs">{r.joined_at}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {referrees.length === 0 && (
                    <div className="rounded-2xl p-6 text-center" style={{ background: '#1A1A1A' }}>
                        <p className="text-4xl mb-3">👥</p>
                        <p className="text-white font-bold text-sm mb-1">{t('referral.no_referrees_title')}</p>
                        <p className="text-[#555] text-xs">{t('referral.no_referrees_hint')}</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
