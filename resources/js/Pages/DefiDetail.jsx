import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppLayout from '../Components/AppLayout';
import TopBar from '../Components/TopBar';
import FIGHTERS from '../data/fighters';

const fighterMap = Object.fromEntries(FIGHTERS.map(f => [f.name, f.img]));

function StatBox({ label, value, color }) {
    return (
        <div className="flex-1 rounded-xl p-3 flex flex-col items-center" style={{ background: '#0D0D0D' }}>
            <span className="text-[#666] text-[9px] tracking-widest font-semibold mb-1">{label}</span>
            <span className="font-black text-xl" style={{ color: color || '#FFFFFF' }}>{value}</span>
        </div>
    );
}

export default function DefiDetail() {
    const { challenge, canJoin, auth } = usePage().props;
    const { t } = useTranslation();
    const isCreator = auth?.user?.id === challenge?.creator?.id;
    const [selected,  setSelected]  = useState(new Set());
    const [accepting, setAccepting] = useState(false);
    const [done,      setDone]      = useState(false);
    const [copied,    setCopied]    = useState(false);

    const shareUrl  = `${window.location.origin}/defis/${challenge?.id}`;
    const shareText = t('defi.share_text', { game: challenge?.game, bet: challenge?.bet_amount, currency: challenge?.currency === 'usdt' ? 'USDT' : 'RB' });

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: 'RivalBet', text: shareText, url: shareUrl });
            } catch {}
        } else {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!challenge) {
        return (
            <AppLayout>
                <TopBar />
                <div className="flex items-center justify-center h-64">
                    <p className="text-[#555]">{t('defi.not_found')}</p>
                </div>
            </AppLayout>
        );
    }

    const rules        = challenge.rules ?? {};
    const creator      = challenge.creator;
    const allowedChars = rules.allowed_chars ?? [];
    const is3v3        = challenge.type?.toUpperCase() === '3V3';
    const maxSelect    = is3v3 ? 3 : 1;
    // Si aucun personnage autorisé défini, pas besoin de sélection
    const needsSelect  = allowedChars.length > 0;
    const ready        = !needsSelect || selected.size === maxSelect;

    const toggleChar = (char) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(char)) {
                next.delete(char);
            } else if (!is3v3) {
                next.clear();
                next.add(char);
            } else if (next.size < maxSelect) {
                next.add(char);
            }
            return next;
        });
    };

    const handleAccept = () => {
        if (!ready || accepting) return;
        setAccepting(true);
        router.post(`/challenges/${challenge.id}/join`, {
            fighter: [...selected].join(', ') || 'Libre',
        }, {
            onSuccess: () => setDone(true),
            onError:   () => setAccepting(false),
        });
    };

    return (
        <AppLayout>
            <TopBar />

            {/* Header */}
            <div className="flex items-center px-4 pt-2 pb-4 gap-3">
                <Link href="/battle">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="19" y1="12" x2="5" y2="12"/>
                        <polyline points="12 19 5 12 12 5"/>
                    </svg>
                </Link>
                <div className="flex-1">
                    <h1 className="text-white font-black text-lg">{t('defi.title')}</h1>
                </div>
                {isCreator && (
                    <button onClick={handleShare}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs flex-shrink-0"
                        style={{ background: copied ? 'rgba(76,217,100,0.15)' : 'rgba(255,119,102,0.15)', color: copied ? '#4CD964' : '#FF7766', border: `1px solid ${copied ? 'rgba(76,217,100,0.3)' : 'rgba(255,119,102,0.3)'}` }}>
                        {copied ? (
                            <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                                {t('defi.share_copied')}
                            </>
                        ) : (
                            <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                                {t('defi.share_btn')}
                            </>
                        )}
                    </button>
                )}
            </div>

            <div className="px-4 flex flex-col gap-3 pb-6">

                {/* Type badge */}
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg text-[#FF3B30] font-bold text-xs tracking-wider"
                        style={{ background: 'rgba(255,59,48,0.15)' }}>
                        DÉFI {challenge.type}
                    </span>
                    <span className="text-[#666] text-xs">{challenge.visibility}</span>
                    <span className="text-[#666] text-xs">·</span>
                    <span className="text-[#666] text-xs">{challenge.game}</span>
                </div>

                {/* Creator card */}
                <div className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                    <p className="text-[#666] text-[10px] tracking-widest font-semibold mb-3">{t('defi.creator')}</p>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-white text-xl flex-shrink-0"
                            style={{ background: '#FF3B30' }}>
                            {creator.username?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-bold text-base">{creator.username}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full" style={{ background: '#4CD964' }} />
                                <span className="text-[#4CD964] text-xs font-semibold">{t('defi.reliability', { score: creator.reliability_score })}</span>
                            </div>
                        </div>
                        <Link href={`/profil/${creator.id}`}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                            style={{ background: '#2A2A2A', color: '#CCCCCC' }}>
                            {t('defi.profile')}
                        </Link>
                    </div>
                    <div className="flex gap-2">
                        <StatBox label={t('defi.wins')}   value={creator.wins}                  color="#4CD964" />
                        <StatBox label={t('defi.losses')} value={creator.losses}                color="#FF3B30" />
                        <StatBox label={t('defi.fights')} value={creator.wins + creator.losses} color="#FFFFFF" />
                    </div>
                </div>

                {/* Mise */}
                <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: '#1A1A1A' }}>
                    <div className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2">
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                            <path d="M4 22h16"/>
                            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                            <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
                        </svg>
                        <div>
                            <p className="text-[#666] text-[10px] tracking-widest font-semibold">{t('defi.bet')}</p>
                            <p className="text-[#888] text-xs">{t('defi.bet_subtitle')}</p>
                        </div>
                    </div>
                    <span className="text-[#FF3B30] font-black text-2xl">
                        {challenge.bet_amount} {challenge.currency === 'usdt' ? 'USDT' : 'RB'}
                    </span>
                </div>

                {/* Fighter du créateur */}
                {rules.fighter && (
                    <div className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                        <p className="text-[#666] text-[10px] tracking-widest font-semibold mb-3">{t('defi.creator_fighter')}</p>
                        <div className="flex gap-2">
                            {rules.fighter.split(', ').map(name => {
                                const img = fighterMap[name.trim()];
                                return (
                                    <div key={name} className="relative rounded-xl overflow-hidden flex-shrink-0"
                                        style={{ width: '72px', height: '72px', background: '#111', border: '1.5px solid #2A2A2A' }}>
                                        {img
                                            ? <img src={img} alt={name} className="absolute inset-0 w-full h-full object-cover" />
                                            : null
                                        }
                                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }} />
                                        <span className="absolute bottom-1 left-0 right-0 text-center text-white font-bold text-[7px] tracking-wide px-1">{name.trim()}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Personnages autorisés — cliquables si canJoin */}
                {allowedChars.length > 0 && (
                    <div className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-[#666] text-[10px] tracking-widest font-semibold">{t('defi.allowed_chars')}</p>
                            {canJoin && !done && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                                    style={{
                                        background: ready ? 'rgba(76,217,100,0.15)' : 'rgba(255,255,255,0.07)',
                                        color:      ready ? '#4CD964' : '#666',
                                    }}>
                                    {selected.size}/{maxSelect}
                                </span>
                            )}
                        </div>

                        {canJoin && !done && (
                            <p className="text-[#FF3B30] text-[10px] mb-3 font-semibold">
                                {maxSelect === 1 ? t('defi.choose_char_singular') : t('defi.choose_char_plural', { n: maxSelect })}
                            </p>
                        )}

                        <div className="grid grid-cols-4 gap-2">
                            {allowedChars.map(c => {
                                const active = selected.has(c);
                                const img    = fighterMap[c];
                                return canJoin && !done ? (
                                    <button key={c} onClick={() => toggleChar(c)}
                                        className="relative rounded-xl overflow-hidden flex flex-col items-end justify-end"
                                        style={{
                                            aspectRatio: '1',
                                            border: `2px solid ${active ? '#FF3B30' : '#2A2A2A'}`,
                                            background: '#111',
                                        }}>
                                        {img
                                            ? <img src={img} alt={c} className="absolute inset-0 w-full h-full object-cover" />
                                            : <span className="absolute inset-0 flex items-center justify-center text-[#444] text-[9px] font-bold">{c}</span>
                                        }
                                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }} />
                                        {active && (
                                            <div className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center z-10" style={{ background: '#FF3B30' }}>
                                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                                                    <polyline points="20 6 9 17 4 12"/>
                                                </svg>
                                            </div>
                                        )}
                                        <span className="relative z-10 text-white font-bold text-[7px] tracking-wide pb-1 px-1 leading-tight text-center w-full">{c}</span>
                                    </button>
                                ) : (
                                    <div key={c} className="relative rounded-xl overflow-hidden"
                                        style={{ aspectRatio: '1', background: '#111', border: '1px solid #2A2A2A' }}>
                                        {img && <img src={img} alt={c} className="absolute inset-0 w-full h-full object-cover opacity-70" />}
                                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)' }} />
                                        <span className="absolute bottom-1 left-0 right-0 text-center text-white font-bold text-[7px] tracking-wide px-1">{c}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Règles du combat */}
                {(rules.combat || rules.position || rules.heros || rules.duree) && (
                    <div className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                        <p className="text-[#666] text-[10px] tracking-widest font-semibold mb-3">{t('defi.combat_params')}</p>
                        <div className="grid grid-cols-2 gap-3">
                            {rules.combat   && <div><p className="text-[#666] text-xs mb-0.5">{t('defi.rule_label')}</p><p className="text-white font-bold text-sm">{rules.combat}</p></div>}
                            {rules.position && <div><p className="text-[#666] text-xs mb-0.5">{t('defi.position_label')}</p><p className="text-white font-bold text-sm">{rules.position}</p></div>}
                            {rules.heros    && <div><p className="text-[#666] text-xs mb-0.5">{t('defi.heroes_label')}</p><p className="text-white font-bold text-sm">{rules.heros}</p></div>}
                            {rules.duree    && <div><p className="text-[#666] text-xs mb-0.5">{t('defi.duration_label')}</p><p className="text-white font-bold text-sm">{rules.duree}</p></div>}
                        </div>
                    </div>
                )}

                {/* Bouton Accept */}
                {done ? (
                    <div className="rounded-2xl p-4 flex flex-col items-center gap-2"
                        style={{ background: 'rgba(76,217,100,0.1)', border: '1px solid #4CD964' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4CD964" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <p className="text-[#4CD964] font-bold text-sm">{t('defi.accepted')}</p>
                        <p className="text-[#888] text-xs text-center">{t('defi.accepted_subtitle')}</p>
                    </div>
                ) : canJoin ? (
                    <>
                        <button onClick={handleAccept}
                            disabled={!ready || accepting}
                            className="w-full rounded-2xl py-3 font-bold text-sm flex items-center justify-center gap-2"
                            style={{
                                background: ready && !accepting ? '#FF3B30' : '#2A2A2A',
                                color:      ready && !accepting ? '#FFF' : '#555',
                            }}>
                            {accepting ? (
                                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                </svg>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                    {t('defi.accept_with_amount', { amount: challenge.bet_amount, currency: challenge.currency === 'usdt' ? 'USDT' : 'RB' })}
                                </>
                            )}
                        </button>
                        {!ready && allowedChars.length > 0 && (
                            <p className="text-[#555] text-xs text-center">
                                {maxSelect === 1 ? t('defi.select_hero_singular') : t('defi.select_hero_plural', { n: maxSelect })}
                            </p>
                        )}
                        <p className="text-[#444] text-xs text-center px-4">
                            {t('defi.escrow_note', { amount: challenge.bet_amount, currency: challenge.currency === 'usdt' ? 'USDT' : 'RB' })}
                        </p>
                    </>
                ) : isCreator ? (
                    <div className="rounded-2xl p-4 flex flex-col items-center gap-2"
                        style={{ background: 'rgba(255,119,102,0.08)', border: '1px solid rgba(255,119,102,0.25)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF7766" strokeWidth="2" strokeLinecap="round">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <p className="text-[#FF7766] font-bold text-sm">{t('defi.waiting_opponent')}</p>
                        <p className="text-[#666] text-xs text-center">{t('defi.waiting_opponent_sub')}</p>
                    </div>
                ) : (
                    <div className="rounded-2xl p-4 text-center" style={{ background: '#1A1A1A' }}>
                        <p className="text-[#888] text-sm">
                            {challenge.status !== 'ouvert'
                                ? t('defi.not_available')
                                : t('defi.insufficient_balance', { currency: challenge.currency === 'usdt' ? 'USDT' : 'RB' })}
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
