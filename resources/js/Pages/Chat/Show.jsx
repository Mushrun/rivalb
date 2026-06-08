import { useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import BottomNav from '../../Components/BottomNav';
import FIGHTERS from '../../data/fighters';

const fighterMap = Object.fromEntries(FIGHTERS.map(f => [f.name, f.img]));

function useStatusLabel() {
    const { t } = useTranslation();
    return {
        en_attente: t('chat.pending'),
        en_cours:   t('chat.in_progress'),
        litige:     t('chat.dispute'),
        termine:    t('chat.finished'),
        annule:     t('chat.cancelled'),
    };
}

function PlayerRow({ username, ready }) {
    return (
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
                    style={{ background: '#2A2A2A' }}>
                    {username?.[0]?.toUpperCase()}
                </div>
                <span className="text-white font-semibold text-sm">{username}</span>
            </div>
            {ready ? (
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider"
                    style={{ background: 'rgba(76,217,100,0.15)', color: '#4CD964' }}>
                    ✓ PRÊT
                </span>
            ) : (
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider"
                    style={{ background: 'rgba(255,149,0,0.15)', color: '#FF9500' }}>
                    EN ATTENTE
                </span>
            )}
        </div>
    );
}

function FighterChips({ fighter }) {
    if (!fighter) return <span className="text-[#333] text-[10px]">Libre</span>;
    const names = fighter.split(',').map(n => n.trim()).filter(Boolean);
    return (
        <div className="flex flex-wrap gap-1">
            {names.map(name => {
                const img = fighterMap[name];
                return (
                    <div key={name} className="flex items-center gap-1 px-2 py-1 rounded-lg"
                        style={{ background: '#1A1A2A', border: '1px solid #2A2A3A' }}>
                        {img && <img src={img} alt={name} className="w-4 h-4 rounded object-cover flex-shrink-0" />}
                        <span className="text-white text-[10px] font-semibold">{name}</span>
                    </div>
                );
            })}
        </div>
    );
}

function PlayersCard({ match, opponent }) {
    const p1Username = match.is_player1 ? (match.my_username ?? 'Moi') : opponent.username;
    const p2Username = match.is_player1 ? opponent.username : (match.my_username ?? 'Moi');
    const p1Ready    = match.is_player1 ? match.player1_ready : match.player2_ready;
    const p2Ready    = match.is_player1 ? match.player2_ready : match.player1_ready;
    const p1Fighter  = match.is_player1 ? match.my_fighter : match.opp_fighter;
    const p2Fighter  = match.is_player1 ? match.opp_fighter : match.my_fighter;

    return (
        <div style={{ background: '#111118' }}>
            <div className="px-4 py-3 flex flex-col gap-3">
                {/* Joueur 1 */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
                            style={{ background: '#2A2A2A' }}>
                            {p1Username?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-white font-semibold text-sm">{p1Username}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                        {p1Ready ? (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider"
                                style={{ background: 'rgba(76,217,100,0.15)', color: '#4CD964' }}>✓ PRÊT</span>
                        ) : (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider"
                                style={{ background: 'rgba(255,149,0,0.15)', color: '#FF9500' }}>EN ATTENTE</span>
                        )}
                        <FighterChips fighter={p1Fighter} />
                    </div>
                </div>

                <div style={{ height: '1px', background: '#1E1E2A' }} />

                {/* Joueur 2 */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
                            style={{ background: '#2A2A2A' }}>
                            {p2Username?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-white font-semibold text-sm">{p2Username}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                        {p2Ready ? (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider"
                                style={{ background: 'rgba(76,217,100,0.15)', color: '#4CD964' }}>✓ PRÊT</span>
                        ) : (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider"
                                style={{ background: 'rgba(255,149,0,0.15)', color: '#FF9500' }}>EN ATTENTE</span>
                        )}
                        <FighterChips fighter={p2Fighter} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ResultRow({ label, result, screenshot }) {
    const [open, setOpen] = useState(false);
    const isWin = result === 'win';

    return (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2A2A3A' }}>
            <div className="flex items-center justify-between px-3 py-2"
                style={{ background: '#0D0D14' }}>
                <div className="flex items-center gap-2">
                    <span className="text-[#888] text-xs font-semibold">{label}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                        style={{
                            background: isWin ? 'rgba(76,217,100,0.15)' : 'rgba(255,59,48,0.15)',
                            color:      isWin ? '#4CD964'                : '#FF3B30',
                        }}>
                        {isWin ? '🏆 VICTOIRE' : '💀 DÉFAITE'}
                    </span>
                </div>
                {screenshot && (
                    <button onClick={() => setOpen(true)}
                        className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg"
                        style={{ background: '#1A1A2A', color: '#888' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        Capture
                    </button>
                )}
            </div>

            {open && screenshot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.92)' }}
                    onClick={() => setOpen(false)}>
                    <div className="relative max-w-full max-h-full" onClick={e => e.stopPropagation()}>
                        <img src={screenshot} alt="Capture du match"
                            className="max-w-[90vw] max-h-[80vh] rounded-xl object-contain" />
                        <button onClick={() => setOpen(false)}
                            className="absolute -top-3 -right-3 w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: '#FF3B30' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function ResultForm({ matchId }) {
    const { t } = useTranslation();
    const [result,     setResult]     = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const canSubmit = result && !submitting;

    const handleSubmit = () => {
        if (!canSubmit) return;
        setSubmitting(true);
        router.post(`/match/${matchId}/result`, { claimed_result: result }, {
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <div className="flex flex-col gap-3">
            <p className="text-[#4CD964] font-bold text-sm">{t('chat.declare_result')}</p>
            <div className="flex gap-2">
                <button onClick={() => setResult('win')}
                    className="flex-1 rounded-xl py-2.5 font-bold text-sm"
                    style={{
                        background: result === 'win' ? 'rgba(76,217,100,0.2)' : '#0D0D14',
                        color:      result === 'win' ? '#4CD964' : '#666',
                        border:     `1.5px solid ${result === 'win' ? '#4CD964' : '#2A2A3A'}`,
                    }}>
                    🏆 {t('chat.victory')}
                </button>
                <button onClick={() => setResult('loss')}
                    className="flex-1 rounded-xl py-2.5 font-bold text-sm"
                    style={{
                        background: result === 'loss' ? 'rgba(255,59,48,0.2)' : '#0D0D14',
                        color:      result === 'loss' ? '#FF3B30' : '#666',
                        border:     `1.5px solid ${result === 'loss' ? '#FF3B30' : '#2A2A3A'}`,
                    }}>
                    💀 {t('chat.defeat')}
                </button>
            </div>
            <button onClick={handleSubmit} disabled={!canSubmit}
                className="w-full rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2"
                style={{
                    background: canSubmit ? '#FF3B30' : '#1A1A2A',
                    color:      canSubmit ? '#FFF'    : '#444',
                }}>
                {submitting
                    ? <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    : t('chat.submit_result')
                }
            </button>
        </div>
    );
}

function FighterAvatar({ name }) {
    // name peut être "APRIL" ou "APRIL, AZUMA" (3v3) — on prend le premier
    const firstName = name?.split(',')[0]?.trim();
    const img = firstName ? fighterMap[firstName] : null;

    if (img) {
        return (
            <img
                src={img}
                alt={firstName}
                className="w-14 h-14 rounded-xl object-cover"
                style={{ border: '2px solid #2A2A3A' }}
            />
        );
    }
    return (
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: '#1A1A2A', border: '2px solid #2A2A3A' }}>
            ⚔️
        </div>
    );
}

function FightersVS({ myFighter, oppFighter, myUsername, oppUsername }) {
    return (
        <div className="flex items-center justify-between px-6 py-3 flex-shrink-0"
            style={{ background: '#0D0D14', borderBottom: '1px solid #1A1A1A' }}>
            <div className="flex flex-col items-center gap-1">
                <FighterAvatar name={myFighter} />
                <span className="text-white text-[11px] font-bold max-w-[80px] truncate text-center">
                    {myFighter ?? '?'}
                </span>
                <span className="text-[#555] text-[9px] max-w-[80px] truncate">{myUsername}</span>
            </div>

            <span className="font-black text-base" style={{ color: '#FF3B30', letterSpacing: '2px' }}>VS</span>

            <div className="flex flex-col items-center gap-1">
                <FighterAvatar name={oppFighter} />
                <span className="text-white text-[11px] font-bold max-w-[80px] truncate text-center">
                    {oppFighter ?? '?'}
                </span>
                <span className="text-[#555] text-[9px] max-w-[80px] truncate">{oppUsername}</span>
            </div>
        </div>
    );
}

function MatchCard({ match, opponent }) {
    const [matchLink,  setMatchLink]  = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (match.status === 'termine' || match.status === 'annule') return null;

    const myReady  = match.my_ready;
    const oppReady = match.is_player1 ? match.player2_ready : match.player1_ready;

    const p1Ready = match.is_player1 ? myReady  : oppReady;
    const p2Ready = match.is_player1 ? oppReady : myReady;

    const p1Username = match.is_player1 ? (match.my_username ?? 'Moi') : opponent.username;
    const p2Username = match.is_player1 ? opponent.username             : (match.my_username ?? 'Moi');

    const canSubmit = match.is_player1 ? matchLink.trim().length > 0 : true;

    const handleReady = () => {
        if (!canSubmit || submitting) return;
        setSubmitting(true);
        router.post(`/match/${match.id}/ready`,
            match.is_player1 ? { match_link: matchLink } : {},
            { onFinish: () => setSubmitting(false) }
        );
    };

    return (
        <div style={{ background: '#111118' }}>
            <div className="px-4 py-3 flex flex-col gap-3">

                {match.status === 'en_attente' && (
                    <>
                        {match.is_player1 && !myReady && (
                            <div className="flex flex-col gap-2">
                                <p className="text-[#888] text-xs">
                                    Crée la salle dans Shadow Fight 4, copie l'ID et colle-le ici.
                                </p>
                                <input
                                    type="text"
                                    value={matchLink}
                                    onChange={e => setMatchLink(e.target.value)}
                                    placeholder="Colle l'ID de la salle SF4 ici..."
                                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                                    style={{ background: '#0D0D14', border: '1px solid #2A2A3A' }}
                                />
                                <button onClick={handleReady}
                                    disabled={!matchLink.trim() || submitting}
                                    className="w-full rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2"
                                    style={{
                                        background: matchLink.trim() && !submitting ? '#4CD964' : '#1A2A1A',
                                        color:      matchLink.trim() && !submitting ? '#000'    : '#3A5A3A',
                                    }}>
                                    {submitting
                                        ? <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                                        : '✓ Je suis prêt'
                                    }
                                </button>
                            </div>
                        )}

                        {match.is_player1 && myReady && !oppReady && (
                            <div className="flex items-center gap-2 py-1">
                                <svg className="animate-spin flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2.5">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                </svg>
                                <p className="text-[#FF9500] text-xs font-semibold">En attente que l'adversaire confirme...</p>
                            </div>
                        )}

                        {!match.is_player1 && !myReady && (
                            <div className="flex flex-col gap-2">
                                {p1Ready && (
                                    <p className="text-[#888] text-xs">Le créateur a partagé l'ID dans le chat. Rejoins la salle et confirme.</p>
                                )}
                                <button onClick={handleReady}
                                    disabled={submitting}
                                    className="w-full rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2"
                                    style={{ background: submitting ? '#1A2A1A' : '#4CD964', color: submitting ? '#3A5A3A' : '#000' }}>
                                    {submitting
                                        ? <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                                        : '✓ Je suis prêt'
                                    }
                                </button>
                            </div>
                        )}

                        {!match.is_player1 && myReady && !p1Ready && (
                            <div className="flex items-center gap-2 py-1">
                                <svg className="animate-spin flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2.5">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                </svg>
                                <p className="text-[#FF9500] text-xs font-semibold">En attente que le créateur confirme...</p>
                            </div>
                        )}
                    </>
                )}

                {match.status === 'en_cours' && !match.my_result && (
                    <ResultForm matchId={match.id} />
                )}

                {match.status === 'en_cours' && match.my_result && (
                    <div className="flex flex-col gap-2">
                        <ResultRow
                            label="Ton résultat"
                            result={match.my_result}
                            screenshot={match.my_screenshot}
                        />
                        {!match.opp_result ? (
                            <div className="flex items-center gap-2 py-1">
                                <svg className="animate-spin flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2.5">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                </svg>
                                <p className="text-[#FF9500] text-xs font-semibold">En attente du résultat de l'adversaire...</p>
                            </div>
                        ) : (
                            <ResultRow
                                label={opponent.username}
                                result={match.opp_result}
                                screenshot={match.opp_screenshot}
                            />
                        )}
                    </div>
                )}

                {match.status === 'litige' && (
                    <div className="flex flex-col gap-2">
                        {match.my_result && (
                            <ResultRow
                                label="Ton résultat"
                                result={match.my_result}
                                screenshot={match.my_screenshot}
                            />
                        )}
                        {match.opp_result && (
                            <ResultRow
                                label={opponent.username}
                                result={match.opp_result}
                                screenshot={match.opp_screenshot}
                            />
                        )}
                        <p className="text-[#FF9500] font-semibold text-xs mt-1">⚠️ Litige en cours — un admin va trancher.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function ResultMessage({ msg, opponent }) {
    const [open, setOpen] = useState(false);
    const isWin = msg.result === 'win';
    const name  = msg.is_mine ? 'Moi' : opponent.username;

    return (
        <div className={`flex flex-col gap-1 ${msg.is_mine ? 'items-end' : 'items-start'}`}>
            <div className="rounded-2xl overflow-hidden"
                style={{
                    width: '220px',
                    border: `1.5px solid ${isWin ? '#4CD964' : '#FF3B30'}`,
                    background: '#111118',
                }}>
                {/* Header résultat */}
                <div className="flex items-center gap-2 px-3 py-2"
                    style={{ background: isWin ? 'rgba(76,217,100,0.12)' : 'rgba(255,59,48,0.12)' }}>
                    <span className="text-sm">{isWin ? '🏆' : '💀'}</span>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold" style={{ color: isWin ? '#4CD964' : '#FF3B30' }}>
                            {isWin ? 'VICTOIRE' : 'DÉFAITE'}
                        </span>
                        <span className="text-[10px] text-[#666]">{name}</span>
                    </div>
                </div>
                {/* Screenshot */}
                {msg.screenshot && (
                    <button className="w-full block" onClick={() => setOpen(true)}>
                        <img src={msg.screenshot} alt="Capture"
                            className="w-full object-cover"
                            style={{ maxHeight: '160px' }} />
                    </button>
                )}
            </div>
            <span className="text-[#555] text-[10px] px-1">{msg.time}</span>

            {/* Lightbox */}
            {open && msg.screenshot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.92)' }}
                    onClick={() => setOpen(false)}>
                    <div className="relative" onClick={e => e.stopPropagation()}>
                        <img src={msg.screenshot} alt="Capture"
                            className="max-w-[90vw] max-h-[80vh] rounded-xl object-contain" />
                        <button onClick={() => setOpen(false)}
                            className="absolute -top-3 -right-3 w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: '#FF3B30' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function AvisBlock({ matchId, opponent, hasReviewed }) {
    const [sentiment, setSentiment] = useState(null);
    const [comment,   setComment]   = useState('');
    const [done,      setDone]      = useState(hasReviewed);
    const [sending,   setSending]   = useState(false);

    if (done) {
        return (
            <div className="mx-4 mt-3 rounded-2xl p-4 flex items-center gap-3"
                style={{ background: '#0D0D14', border: '1px solid #1E1E2A' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4CD964" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                <p className="text-[#4CD964] text-sm font-semibold">Avis envoyé pour ce match.</p>
            </div>
        );
    }

    const handleSubmit = () => {
        if (!sentiment || sending) return;
        setSending(true);
        router.post(`/match/${matchId}/review`, { sentiment, comment }, {
            onSuccess: () => setDone(true),
            onFinish:  () => setSending(false),
        });
    };

    return (
        <div className="mx-4 mt-3 rounded-2xl overflow-hidden flex-shrink-0"
            style={{ background: '#111118', border: '1px solid #1E1E2A' }}>

            <div className="px-4 py-2.5" style={{ background: '#0D0D14', borderBottom: '1px solid #1E1E2A' }}>
                <p className="text-[#555] text-[9px] tracking-widest font-semibold">
                    ÉVALUER {opponent.username.toUpperCase()}
                </p>
            </div>

            <div className="px-4 py-3 flex flex-col gap-3">
                <div className="flex gap-2">
                    <button onClick={() => setSentiment('positive')}
                        className="flex-1 rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2"
                        style={{
                            background: sentiment === 'positive' ? 'rgba(76,217,100,0.15)' : '#0D0D14',
                            border:     `1.5px solid ${sentiment === 'positive' ? '#4CD964' : '#2A2A3A'}`,
                            color:      sentiment === 'positive' ? '#4CD964' : '#555',
                        }}>
                        👍 Positif
                    </button>
                    <button onClick={() => setSentiment('negative')}
                        className="flex-1 rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2"
                        style={{
                            background: sentiment === 'negative' ? 'rgba(255,59,48,0.15)' : '#0D0D14',
                            border:     `1.5px solid ${sentiment === 'negative' ? '#FF3B30' : '#2A2A3A'}`,
                            color:      sentiment === 'negative' ? '#FF3B30' : '#555',
                        }}>
                        👎 Négatif
                    </button>
                </div>

                <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Laisse un commentaire (optionnel)..."
                    rows={2}
                    maxLength={500}
                    className="w-full rounded-xl px-3 py-2.5 text-white text-sm outline-none resize-none"
                    style={{ background: '#0D0D14', border: '1px solid #2A2A3A' }}
                />

                <button onClick={handleSubmit} disabled={!sentiment || sending}
                    className="w-full rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2"
                    style={{
                        background: sentiment && !sending ? '#FF3B30' : '#1A1A2A',
                        color:      sentiment && !sending ? '#FFF'    : '#444',
                    }}>
                    {sending
                        ? <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        : 'Envoyer mon avis'
                    }
                </button>
            </div>
        </div>
    );
}

export default function ChatShow() {
    const { match, opponent, messages: initialMessages } = usePage().props;
    const { t } = useTranslation();
    const statusLabel = useStatusLabel();

    const [messages, setMessages] = useState(initialMessages);
    const [text,     setText]     = useState('');
    const [sending,  setSending]  = useState(false);
    const bottomRef    = useRef();
    const lastIdRef    = useRef(initialMessages.length > 0 ? initialMessages[initialMessages.length - 1].id : 0);
    const isAtBottomRef = useRef(true);

    // Scroll to bottom on new messages (only if already at bottom)
    useEffect(() => {
        if (isAtBottomRef.current) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages.length]);

    // Polling toutes les 2 secondes
    useEffect(() => {
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

        const poll = async () => {
            try {
                const res = await axios.get(`/chat/${match.id}/poll?after=${lastIdRef.current}`, {
                    headers: { 'X-CSRF-TOKEN': csrf },
                });
                const newMsgs = res.data.messages;
                if (newMsgs.length > 0) {
                    lastIdRef.current = newMsgs[newMsgs.length - 1].id;
                    setMessages(prev => [...prev, ...newMsgs]);
                }
            } catch {
                // silencieux
            }
        };

        const interval = setInterval(poll, 2000);
        return () => clearInterval(interval);
    }, [match.id]);

    const handleSend = async () => {
        const body = text.trim();
        if (!body || sending) return;

        setSending(true);
        setText('');

        const tempId = Date.now();
        const now = new Date();
        const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        setMessages(prev => [...prev, {
            id:      tempId,
            body,
            type:    'text',
            is_mine: true,
            time,
        }]);

        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
            const response = await axios.post(`/chat/${match.id}`, { body }, {
                headers: { 'X-CSRF-TOKEN': csrf },
            });
            const real = response.data.message;
            lastIdRef.current = real.id;
            setMessages(prev => {
                const withoutDupes = prev.filter(m => m.id !== tempId && m.id !== real.id);
                return [...withoutDupes, { ...real }];
            });
        } catch {
            setMessages(prev => prev.filter(m => m.id !== tempId));
        } finally {
            setSending(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const [openCombattants, setOpenCombattants] = useState(false);
    const [openMatch,       setOpenMatch]       = useState(false);

    return (
        <div className="flex justify-center" style={{ background: '#0A0A0F', height: '100dvh' }}>
            <div className="w-full max-w-[430px] flex flex-col" style={{ background: '#0A0A0F', height: '100dvh' }}>

                {/* Header */}
                <div className="flex items-center gap-3 px-4 pt-4 pb-3 flex-shrink-0"
                    style={{ borderBottom: '1px solid #1A1A1A' }}>
                    <Link href="/chat" className="p-1">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="19" y1="12" x2="5" y2="12"/>
                            <polyline points="12 19 5 12 12 5"/>
                        </svg>
                    </Link>

                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                        style={{ background: '#FF3B30' }}>
                        {opponent.username?.[0]?.toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm">{opponent.username}</p>
                        <p className="text-[#888] text-xs">{match.game} · {match.bet_amount} {match.currency === 'usdt' ? 'USDT' : 'RB'}</p>
                    </div>
                </div>

                {/* Accordéon Combattants */}
                <div className="flex-shrink-0 mx-4 mt-2 rounded-2xl overflow-hidden" style={{ border: '1px solid #1E1E2A' }}>
                    <button onClick={() => setOpenCombattants(o => !o)}
                        className="w-full flex items-center justify-between px-4 py-2.5"
                        style={{ background: '#0D0D14' }}>
                        <span className="text-[#555] text-[10px] tracking-widest font-semibold">{t('chat.fighters')}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round"
                            style={{ transform: openCombattants ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </button>
                    {openCombattants && <PlayersCard match={match} opponent={opponent} />}
                </div>

                {/* Accordéon Match */}
                {match.status !== 'termine' && match.status !== 'annule' && (
                    <div className="flex-shrink-0 mx-4 mt-1 rounded-2xl overflow-hidden" style={{ border: '1px solid #1E1E2A' }}>
                        <button onClick={() => setOpenMatch(o => !o)}
                            className="w-full flex items-center justify-between px-4 py-2.5"
                            style={{ background: '#0D0D14' }}>
                            <span className="text-[#555] text-[10px] tracking-widest font-semibold">{t('chat.match')} #{match.id}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                                    style={{
                                        background: match.status === 'en_cours' ? 'rgba(76,217,100,0.15)' : match.status === 'litige' ? 'rgba(255,59,48,0.15)' : 'rgba(255,149,0,0.15)',
                                        color:      match.status === 'en_cours' ? '#4CD964'               : match.status === 'litige' ? '#FF3B30'               : '#FF9500',
                                    }}>
                                    {statusLabel[match.status] ?? match.status}
                                </span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round"
                                    style={{ transform: openMatch ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                                    <polyline points="6 9 12 15 18 9"/>
                                </svg>
                            </div>
                        </button>
                        {openMatch && <MatchCard match={match} opponent={opponent} />}
                    </div>
                )}

                {/* Avis — visible quand le match est terminé */}
                {match.status === 'termine' && (
                    <AvisBlock
                        matchId={match.id}
                        opponent={opponent}
                        hasReviewed={match.has_reviewed}
                    />
                )}

                {/* Messages */}
                <div className="flex-1 px-4 py-4 flex flex-col gap-2 overflow-y-auto min-h-0">
                    {messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            <p className="text-[#444] text-sm">{t('chat.no_messages')}</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            if (msg.type === 'system') {
                                return (
                                    <div key={msg.id} className="flex justify-center my-1">
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                                            style={{ background: '#1A1A1A' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"/>
                                                <line x1="12" y1="8" x2="12" y2="12"/>
                                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                                            </svg>
                                            <span className="text-[#888] text-xs">{msg.body}</span>
                                        </div>
                                    </div>
                                );
                            }

                            if (msg.type === 'result') {
                                return <ResultMessage key={msg.id} msg={msg} opponent={opponent} />;
                            }

                            if (msg.is_mine) {
                                return (
                                    <div key={msg.id} className="flex flex-col items-end gap-0.5">
                                        <div className="max-w-[78%] rounded-2xl rounded-br-sm px-4 py-2.5"
                                            style={{ background: '#FF3B30' }}>
                                            <p className="text-white text-sm leading-relaxed">{msg.body}</p>
                                        </div>
                                        <span className="text-[#555] text-[10px] pr-1">{msg.time} ✓✓</span>
                                    </div>
                                );
                            }

                            return (
                                <div key={msg.id} className="flex items-end gap-2">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
                                        style={{ background: '#3A3A3A' }}>
                                        {opponent.username?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="max-w-[78%]">
                                        <div className="rounded-2xl rounded-bl-sm px-4 py-2.5"
                                            style={{ background: '#1A1A1A' }}>
                                            <p className="text-white text-sm leading-relaxed">{msg.body}</p>
                                        </div>
                                        <span className="text-[#555] text-[10px] pl-1">{msg.time}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="flex items-end gap-2 px-4 pb-24 pt-2 flex-shrink-0"
                    style={{ borderTop: '1px solid #1A1A1A' }}>
                    <div className="flex-1 rounded-2xl px-4 py-2.5 min-h-[44px] flex items-center"
                        style={{ background: '#1A1A1A' }}>
                        <textarea
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder={t('chat.message_placeholder')}
                            rows={1}
                            className="w-full bg-transparent text-white text-sm outline-none resize-none leading-relaxed"
                            style={{ maxHeight: '100px' }}
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!text.trim() || sending}
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: text.trim() && !sending ? '#FF3B30' : '#2A2A2A', transition: 'background 0.15s' }}>
                        {sending ? (
                            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"/>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                            </svg>
                        )}
                    </button>
                </div>
            </div>
            <BottomNav />
        </div>
    );
}
