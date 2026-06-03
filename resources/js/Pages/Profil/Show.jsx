import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import TopBar from '../../Components/TopBar';
import { resolveMediaUrl } from '../../utils/media';

const sentimentColor = { positive: '#4CD964', negative: '#FF3B30', neutre: '#FF9500' };
const sentimentLabel = { positive: 'FIABLE', negative: 'LITIGIEUX', neutre: 'À SURVEILLER' };

function Avatar({ path, username, size = 20 }) {
    const url = resolveMediaUrl(path);
    return (
        <div className="rounded-2xl overflow-hidden flex items-center justify-center glow-border-red flex-shrink-0"
            style={{ width: size, height: size, background: '#1A1A1A' }}>
            {url ? (
                <img src={url} alt={username} className="w-full h-full object-cover" />
            ) : (
                <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
            )}
        </div>
    );
}

function PlayerHeader({ profile, tab, setTab, challengeCount, reviewCount }) {
    const positiveReviews = reviewCount ?? 0;
    return (
        <>
            <TopBar />
            <div className="px-4 mt-2">
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                        <Avatar path={profile.avatar_path} username={profile.username} size={80} />
                        <span className="absolute -bottom-1 left-1 w-3.5 h-3.5 rounded-full border-2 border-[#0D0D0D]"
                            style={{ background: '#4CD964' }} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-white font-bold text-xl">{profile.username}</h2>
                        <p className="text-[#888] text-xs">Membre depuis {profile.member_since}</p>
                    </div>
                    <Link href={`/challenge/create/1`}
                        className="px-4 py-2 rounded-xl text-white font-bold text-xs"
                        style={{ background: '#FF3B30' }}>
                        DÉFIER
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                        { label: 'VICTOIRES', value: profile.wins,   color: '#4CD964' },
                        { label: 'DÉFAITES',  value: profile.losses, color: '#FF3B30' },
                        { label: 'COMBATS',   value: profile.total,  color: '#FFFFFF' },
                    ].map(s => (
                        <div key={s.label} className="rounded-xl p-3 flex flex-col items-center"
                            style={{ background: '#1A1A1A' }}>
                            <span className="text-[#888] text-[9px] tracking-widest font-semibold mb-1">{s.label}</span>
                            <span className="font-black text-2xl" style={{ color: s.color }}>{s.value}</span>
                        </div>
                    ))}
                </div>

                {/* Fiabilité */}
                <div className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between"
                    style={{ background: '#1A1A1A' }}>
                    <span className="text-[#888] text-xs">Fiabilité</span>
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full" style={{ background: '#2A2A2A' }}>
                            <div className="h-full rounded-full"
                                style={{ width: `${profile.reliability_score}%`, background: 'linear-gradient(to right, #FF3B30, #FF6B30)' }} />
                        </div>
                        <span className="text-[#FF3B30] font-bold text-sm">{profile.reliability_score}%</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b mb-4" style={{ borderColor: '#1E1E1E' }}>
                    {[
                        { key: 'INFOS',    label: 'INFOS' },
                        { key: 'ADS',      label: `ADS (${challengeCount})` },
                        { key: 'FEEDBACK', label: `FEEDBACK (${reviewCount})` },
                    ].map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className="flex-1 pb-2 text-xs font-semibold tracking-wider"
                            style={{ color: tab === t.key ? '#FF3B30' : '#555', borderBottom: tab === t.key ? '2px solid #FF3B30' : '2px solid transparent' }}>
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}

function InfosTab({ profile }) {
    return (
        <div className="px-4 flex flex-col gap-4">
            <div>
                <p className="text-[#888] text-[11px] font-bold tracking-widest mb-2">INFORMATIONS</p>
                <div className="rounded-2xl overflow-hidden" style={{ background: '#1A1A1A' }}>
                    <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid #2A2A2A' }}>
                        <span className="text-[#CCC] text-sm">Total Combats</span>
                        <span className="text-white font-bold text-sm">{profile.total}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-4">
                        <span className="text-[#CCC] text-sm">Membre depuis</span>
                        <span className="text-white font-bold text-sm">{profile.member_since}</span>
                    </div>
                </div>
            </div>

            {profile.bio && (
                <div>
                    <p className="text-[#888] text-[11px] font-bold tracking-widest mb-2">RÉSUMÉ</p>
                    <div className="rounded-2xl px-4 py-4" style={{ background: '#1A1A1A' }}>
                        <p className="text-[#CCC] text-sm leading-relaxed">{profile.bio}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

function AdsTab({ challenges }) {
    if (!challenges?.length) return (
        <div className="flex flex-col items-center py-10 gap-2 px-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            <p className="text-[#555] text-sm">Aucun défi actif</p>
        </div>
    );

    return (
        <div className="px-4">
            <p className="text-[#888] text-[11px] font-bold tracking-widest mb-3">DÉFIS ACTIFS</p>
            <div className="flex flex-col gap-3">
                {challenges.map(c => (
                    <div key={c.id} className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[#FF3B30] text-xs font-bold px-2 py-0.5 rounded"
                                    style={{ background: 'rgba(255,59,48,0.15)' }}>
                                    DÉFI {c.type?.toUpperCase()}
                                </span>
                            </div>
                            <span className="text-[#666] text-xs">{c.created_at}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[#888] text-sm">{c.game}</span>
                            <span className="text-[#FF3B30] font-black text-lg">{c.bet_amount} RB</span>
                        </div>
                        <Link href={`/defis/${c.id}`}
                            className="w-full rounded-xl py-2 font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 mt-3"
                            style={{ background: '#2A2A2A', color: '#CCC', border: '1px solid #3A3A3A' }}>
                            En savoir plus
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="5" y1="12" x2="19" y2="12"/>
                                <polyline points="12 5 19 12 12 19"/>
                            </svg>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FeedbackTab({ reviews }) {
    const [filter, setFilter] = useState('TOUS');

    const total    = reviews?.length ?? 0;
    const positive = reviews?.filter(r => r.sentiment === 'positive').length ?? 0;
    const negative = reviews?.filter(r => r.sentiment === 'negative').length ?? 0;
    const pct      = total > 0 ? Math.round((positive / total) * 100) : 0;

    const filtered = filter === 'POSITIFS' ? reviews?.filter(r => r.sentiment === 'positive')
        : filter === 'NÉGATIFS'           ? reviews?.filter(r => r.sentiment === 'negative')
        : reviews;

    if (!total) return (
        <div className="flex flex-col items-center py-10 gap-2 px-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-[#555] text-sm">Aucun avis pour l'instant</p>
        </div>
    );

    return (
        <div className="px-4">
            <div className="rounded-2xl py-4 px-4 flex items-center justify-center gap-3 mb-3"
                style={{ background: '#1A1A1A' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#4CD964" stroke="#4CD964" strokeWidth="1">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" fill="#4CD964"/>
                </svg>
                <span className="text-white font-black text-xl">{pct}%</span>
                <span className="text-[#666] text-sm">|</span>
                <span className="text-[#AAA] text-sm">({total}) Avis</span>
            </div>

            <div className="flex items-center gap-2 mb-4">
                {[
                    { key: 'TOUS',     label: `Tous (${total})` },
                    { key: 'POSITIFS', label: `Positifs (${positive})` },
                    { key: 'NÉGATIFS', label: `Négatifs (${negative})` },
                ].map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                        style={{ background: filter === f.key ? '#FFF' : '#1A1A1A', color: filter === f.key ? '#0D0D0D' : '#888' }}>
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-3">
                {filtered?.map(r => {
                    const color = sentimentColor[r.sentiment] ?? '#888';
                    return (
                        <div key={r.id} className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                                        style={{ background: '#3A3A3A' }}>
                                        {r.reviewer?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-sm">{r.reviewer}</p>
                                        <p className="text-[#666] text-xs">{r.created_at}</p>
                                    </div>
                                </div>
                                <span className="px-2 py-1 rounded-lg text-[10px] font-bold flex-shrink-0"
                                    style={{ background: `${color}22`, color }}>
                                    {sentimentLabel[r.sentiment] ?? r.sentiment?.toUpperCase()}
                                </span>
                            </div>
                            {r.comment && <p className="text-[#CCC] text-sm leading-relaxed">{r.comment}</p>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function ProfilShow() {
    const { profile, challenges = [], reviews = [] } = usePage().props;
    const [tab, setTab] = useState('INFOS');

    return (
        <AppLayout>
            <PlayerHeader
                profile={profile}
                tab={tab}
                setTab={setTab}
                challengeCount={challenges.length}
                reviewCount={reviews.length}
            />
            <div className="pb-4">
                {tab === 'INFOS'    && <InfosTab    profile={profile} />}
                {tab === 'ADS'      && <AdsTab      challenges={challenges} />}
                {tab === 'FEEDBACK' && <FeedbackTab reviews={reviews} />}
            </div>
        </AppLayout>
    );
}
