import { useState, useEffect, useRef } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '../Components/AppLayout';
import TopBar from '../Components/TopBar';

const PHASES = ['waiting', 'playing', 'submit', 'validating', 'done', 'dispute'];

function derivePhase(match) {
    switch (match.status) {
        case 'en_attente': return 'waiting';
        case 'en_cours':   return match.my_result ? 'validating' : 'playing';
        case 'termine':    return 'done';
        case 'litige':     return 'dispute';
        default:           return 'waiting';
    }
}

function StepBar({ phase }) {
    const steps = [
        { key: 'waiting',    label: 'Prêt' },
        { key: 'playing',    label: 'En jeu' },
        { key: 'submit',     label: 'Résultat' },
        { key: 'validating', label: 'Validation' },
        { key: 'done',       label: 'Terminé' },
    ];
    const idx = PHASES.indexOf(phase);
    return (
        <div className="flex items-center justify-between px-4 mb-4">
            {steps.map((s, i) => {
                const done   = i < idx;
                const active = s.key === phase || (phase === 'dispute' && s.key === 'validating');
                return (
                    <div key={s.key} className="flex flex-col items-center gap-1 flex-1">
                        <div className="flex items-center w-full">
                            {i > 0 && (
                                <div className="flex-1 h-0.5 rounded-full"
                                    style={{ background: done ? '#FF3B30' : '#2A2A2A' }} />
                            )}
                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{
                                    background: done ? '#FF3B30' : active ? 'rgba(255,59,48,0.2)' : '#1A1A1A',
                                    border: active ? '2px solid #FF3B30' : done ? 'none' : '2px solid #2A2A2A',
                                }}>
                                {done ? (
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                ) : (
                                    <span className="text-[8px] font-bold" style={{ color: active ? '#FF3B30' : '#555' }}>{i + 1}</span>
                                )}
                            </div>
                            {i < steps.length - 1 && (
                                <div className="flex-1 h-0.5 rounded-full"
                                    style={{ background: done ? '#FF3B30' : '#2A2A2A' }} />
                            )}
                        </div>
                        <span className="text-[8px] tracking-wider font-semibold"
                            style={{ color: active ? '#FF3B30' : done ? '#888' : '#444' }}>
                            {s.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function PlayerVS({ match }) {
    return (
        <div className="mx-4 rounded-2xl p-4 mb-3 flex items-center gap-3" style={{ background: '#1A1A1A' }}>
            <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-white text-xl"
                    style={{ background: '#8B5CF6' }}>
                    {match.player1.username?.[0]?.toUpperCase()}
                </div>
                <p className="text-white font-bold text-xs">{match.player1.username}</p>
                <p className="text-[#888] text-[9px] tracking-wider">Créateur</p>
            </div>
            <div className="flex flex-col items-center gap-1">
                <span className="text-[#FF3B30] font-black text-lg">VS</span>
                <span className="text-[#FFAA88] font-black text-base">{match.bet_amount} RB</span>
                <span className="text-[#666] text-[9px] tracking-wider">{match.rules?.format || 'Classic'}</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-white text-xl"
                    style={{ background: '#FF3B30' }}>
                    {match.player2.username?.[0]?.toUpperCase()}
                </div>
                <p className="text-white font-bold text-xs">{match.player2.username}</p>
                <p className="text-[#888] text-[9px] tracking-wider">Adversaire</p>
            </div>
        </div>
    );
}

/* ─── PHASE: waiting ─── */
function PhaseWaiting({ match, me }) {
    const [loading,   setLoading]   = useState(false);
    const [matchLink, setMatchLink] = useState('');

    const isMeReady       = me === 'player1' ? match.player1_ready : match.player2_ready;
    const isOpponentReady = me === 'player1' ? match.player2_ready : match.player1_ready;
    const opponentName    = me === 'player1' ? match.player2.username : match.player1.username;
    const isCreator       = me === 'player1';

    const handleReady = () => {
        setLoading(true);
        router.post(`/match/${match.id}/ready`, { match_link: matchLink }, {
            onError: () => setLoading(false),
        });
    };

    return (
        <div className="px-4 flex flex-col gap-3">
            <div className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                <p className="text-[#888] text-[10px] tracking-widest font-semibold mb-3">CONFIRMATION DES JOUEURS</p>
                <div className="flex flex-col gap-3">
                    {[
                        { label: match.player1.username, ready: match.player1_ready, color: '#8B5CF6' },
                        { label: match.player2.username, ready: match.player2_ready, color: '#FF3B30' },
                    ].map(p => (
                        <div key={p.label} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                                    style={{ background: p.color }}>
                                    {p.label?.[0]?.toUpperCase()}
                                </div>
                                <span className="text-white text-sm font-semibold">{p.label}</span>
                            </div>
                            {p.ready ? (
                                <span className="flex items-center gap-1 text-[#4CD964] text-xs font-bold px-2 py-1 rounded-lg"
                                    style={{ background: 'rgba(76,217,100,0.15)' }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                    PRÊT
                                </span>
                            ) : (
                                <span className="text-[#FF9500] text-xs font-bold px-2 py-1 rounded-lg"
                                    style={{ background: 'rgba(255,149,0,0.15)' }}>
                                    EN ATTENTE
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {!isMeReady ? (
                <div className="flex flex-col gap-2">
                    {isCreator && (
                        <div className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                            <p className="text-[#888] text-[10px] tracking-widest font-semibold mb-2">
                                LIEN DU MATCH SHADOW FIGHT 4
                            </p>
                            <p className="text-[#666] text-xs mb-3">
                                Crée le match dans SF4, copie le lien et colle-le ici. Il sera envoyé automatiquement dans le chat.
                            </p>
                            <input
                                type="text"
                                placeholder="Colle le lien SF4 ici..."
                                value={matchLink}
                                onChange={e => setMatchLink(e.target.value)}
                                className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none"
                                style={{ background: '#0D0D0D', border: '1px solid #2A2A2A' }}
                            />
                        </div>
                    )}
                    <button onClick={handleReady} disabled={loading || (isCreator && !matchLink.trim())}
                        className="w-full rounded-2xl py-3 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                        style={{ background: '#4CD964', color: '#0D0D0D', opacity: loading ? 0.7 : 1 }}>
                        {loading ? (
                            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        )}
                        JE SUIS PRÊT
                    </button>
                </div>
            ) : (
                <div className="rounded-2xl py-3 flex items-center justify-center gap-2"
                    style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span className="text-[#FF9500] text-sm font-semibold">En attente de {opponentName}...</span>
                </div>
            )}
        </div>
    );
}

/* ─── PHASE: playing ─── */
function PhasePlaying({ match, onSubmitResult }) {
    return (
        <div className="px-4 flex flex-col gap-3">
            <div className="rounded-2xl p-5 flex flex-col items-center gap-3"
                style={{ background: '#1A1A1A', border: '1px solid #FF3B30' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,59,48,0.15)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                </div>
                <p className="text-[#FF3B30] font-black text-lg tracking-widest">MATCH EN COURS</p>
                <p className="text-[#888] text-xs text-center">
                    Lancez {match.game} et jouez votre partie. Revenez ici pour soumettre le résultat.
                </p>
            </div>

            <div className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                <p className="text-[#888] text-[10px] tracking-widest font-semibold mb-3">RAPPEL DES RÈGLES</p>
                <div className="flex flex-col gap-2">
                    {[
                        { label: 'Format',      value: match.rules?.format || 'Classic' },
                        { label: 'Jeu',         value: match.game },
                        { label: 'Mise en jeu', value: `${match.bet_amount} RB chacun` },
                    ].map(r => (
                        <div key={r.label} className="flex items-center justify-between">
                            <span className="text-[#666] text-sm">{r.label}</span>
                            <span className="text-white font-bold text-sm">{r.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.2)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" className="flex-shrink-0">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <p className="text-[#FF9500] text-xs">Prenez une capture d'écran du résultat final pour preuve.</p>
            </div>

            <button onClick={onSubmitResult}
                className="w-full rounded-2xl py-3 font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: '#FF3B30', color: '#FFFFFF' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                    <circle cx="12" cy="13" r="3"/>
                </svg>
                SOUMETTRE MON RÉSULTAT
            </button>
        </div>
    );
}

/* ─── PHASE: submit ─── */
function PhaseSubmit({ match }) {
    const [outcome,     setOutcome]     = useState(null);
    const [file,        setFile]        = useState(null);
    const [preview,     setPreview]     = useState(null);
    const [submitting,  setSubmitting]  = useState(false);
    const [error,       setError]       = useState('');
    const fileRef = useRef();

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleSubmit = () => {
        if (!outcome) return;
        setSubmitting(true);
        setError('');
        const data = { claimed_result: outcome };
        if (file) data.screenshot = file;
        router.post(`/match/${match.id}/result`, data, {
            forceFormData: true,
            onError: (errors) => {
                setError(Object.values(errors)[0] || 'Une erreur est survenue.');
                setSubmitting(false);
            },
        });
    };

    return (
        <div className="px-4 flex flex-col gap-3">
            {error && (
                <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.3)' }}>
                    <p className="text-[#FF3B30] text-sm">{error}</p>
                </div>
            )}

            <div className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                <p className="text-[#888] text-[10px] tracking-widest font-semibold mb-3">QUE S'EST-IL PASSÉ ?</p>
                <div className="flex gap-3">
                    <button onClick={() => setOutcome('win')}
                        className="flex-1 rounded-xl py-4 flex flex-col items-center gap-2"
                        style={{
                            background: outcome === 'win' ? 'rgba(76,217,100,0.15)' : '#0D0D0D',
                            border: outcome === 'win' ? '2px solid #4CD964' : '2px solid #2A2A2A',
                        }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                            stroke={outcome === 'win' ? '#4CD964' : '#555'} strokeWidth="2">
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                            <path d="M4 22h16"/>
                            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                            <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
                        </svg>
                        <span className="font-bold text-sm" style={{ color: outcome === 'win' ? '#4CD964' : '#666' }}>J'AI GAGNÉ</span>
                        <span className="text-[10px]" style={{ color: outcome === 'win' ? '#4CD964' : '#444' }}>+{match.bet_amount} RB</span>
                    </button>

                    <button onClick={() => setOutcome('loss')}
                        className="flex-1 rounded-xl py-4 flex flex-col items-center gap-2"
                        style={{
                            background: outcome === 'loss' ? 'rgba(255,59,48,0.1)' : '#0D0D0D',
                            border: outcome === 'loss' ? '2px solid #FF3B30' : '2px solid #2A2A2A',
                        }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                            stroke={outcome === 'loss' ? '#FF3B30' : '#555'} strokeWidth="2">
                            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
                            <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                        </svg>
                        <span className="font-bold text-sm" style={{ color: outcome === 'loss' ? '#FF3B30' : '#666' }}>J'AI PERDU</span>
                        <span className="text-[10px]" style={{ color: outcome === 'loss' ? '#FF3B30' : '#444' }}>-{match.bet_amount} RB</span>
                    </button>
                </div>
            </div>

            <div className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                <p className="text-[#888] text-[10px] tracking-widest font-semibold mb-3">CAPTURE D'ÉCRAN (optionnelle)</p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                {preview ? (
                    <div className="relative rounded-xl overflow-hidden mb-2" style={{ aspectRatio: '16/9' }}>
                        <img src={preview} alt="preuve" className="w-full h-full object-cover" />
                        <button onClick={() => { setFile(null); setPreview(null); }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(0,0,0,0.7)' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                ) : (
                    <button onClick={() => fileRef.current.click()}
                        className="w-full rounded-xl py-6 flex flex-col items-center gap-2 border-2 border-dashed"
                        style={{ borderColor: '#2A2A2A', background: '#0D0D0D' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5">
                            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                            <circle cx="12" cy="13" r="3"/>
                        </svg>
                        <span className="text-[#555] text-xs">Appuyer pour ajouter une photo</span>
                    </button>
                )}
            </div>

            <button onClick={handleSubmit} disabled={!outcome || submitting}
                className="w-full rounded-2xl py-3 font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: '#FF3B30', color: '#FFFFFF', opacity: (!outcome || submitting) ? 0.4 : 1 }}>
                {submitting ? (
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                ) : null}
                CONFIRMER MON RÉSULTAT
            </button>
            <p className="text-[#444] text-xs text-center">
                Le résultat sera soumis à la validation de ton adversaire.
            </p>
        </div>
    );
}

/* ─── PHASE: validating ─── */
function PhaseValidating({ match, me }) {
    const myResult     = match.my_result;
    const myScreenshot = match.my_screenshot;
    const opponentName = me === 'player1' ? match.player2.username : match.player1.username;

    return (
        <div className="px-4 flex flex-col gap-3">
            <div className="rounded-2xl p-5 flex flex-col items-center gap-3" style={{ background: '#1A1A1A' }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,149,0,0.15)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                </div>
                <p className="text-white font-bold text-base">En attente de l'adversaire</p>
                <p className="text-[#888] text-xs text-center">
                    Tu as déclaré avoir{' '}
                    <span className="font-bold" style={{ color: myResult === 'win' ? '#4CD964' : '#FF3B30' }}>
                        {myResult === 'win' ? 'GAGNÉ' : 'PERDU'}
                    </span>
                    . En attente de la confirmation de{' '}
                    <span className="text-white font-semibold">{opponentName}</span>.
                </p>
            </div>

            <div className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                <p className="text-[#888] text-[10px] tracking-widest font-semibold mb-3">TON RÉSULTAT SOUMIS</p>
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#0D0D0D' }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: myResult === 'win' ? 'rgba(76,217,100,0.15)' : 'rgba(255,59,48,0.15)' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke={myResult === 'win' ? '#4CD964' : '#FF3B30'} strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm">{myResult === 'win' ? 'Victoire' : 'Défaite'}</p>
                        <p className="text-[#888] text-xs">Résultat enregistré ✓</p>
                    </div>
                    <span className="ml-auto font-black text-base"
                        style={{ color: myResult === 'win' ? '#4CD964' : '#FF3B30' }}>
                        {myResult === 'win' ? `+${match.bet_amount}` : `-${match.bet_amount}`} RB
                    </span>
                </div>

                {myScreenshot && (
                    <div className="mt-3">
                        <p className="text-[#888] text-[10px] tracking-widest font-semibold mb-2">TA CAPTURE D'ÉCRAN</p>
                        <a href={myScreenshot} target="_blank" rel="noreferrer"
                            className="block relative rounded-xl overflow-hidden"
                            style={{ aspectRatio: '16/9' }}>
                            <img src={myScreenshot} alt="capture preuve" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                                style={{ background: 'rgba(0,0,0,0.5)' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                    <polyline points="15 3 21 3 21 9"/>
                                    <line x1="10" y1="14" x2="21" y2="3"/>
                                </svg>
                            </div>
                        </a>
                    </div>
                )}
            </div>

            <button onClick={() => router.reload()}
                className="w-full rounded-2xl py-3 font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: '#1A1A1A', color: '#CCCCCC', border: '1px solid #2A2A2A' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 .49-4.6"/>
                </svg>
                Actualiser le statut
            </button>

            <p className="text-[#444] text-xs text-center">
                La page se mettra à jour automatiquement dès que l'adversaire aura soumis son résultat.
            </p>
        </div>
    );
}

/* ─── PHASE: done ─── */
function AvisModal({ matchId, opponentName, onClose }) {
    const [sentiment, setSentiment] = useState(null);
    const [comment,   setComment]   = useState('');
    const [sending,   setSending]   = useState(false);
    const [sent,      setSent]      = useState(false);

    const submit = () => {
        if (!sentiment || sending) return;
        setSending(true);
        router.post(`/match/${matchId}/review`, { sentiment, comment }, {
            onSuccess: () => setSent(true),
            onFinish:  () => setSending(false),
        });
    };

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
                <p className="text-white font-bold text-base">Avis envoyé !</p>
                <p className="text-[#888] text-xs text-center">
                    Ton avis sur <span className="text-white font-semibold">{opponentName}</span> a été publié.
                </p>
                <button onClick={onClose}
                    className="w-full rounded-xl py-3 font-bold text-sm mt-1"
                    style={{ background: '#FF3B30', color: '#FFF' }}>
                    FERMER
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.75)' }} onClick={onClose}>
            <div className="w-full max-w-[390px] rounded-2xl p-5"
                style={{ background: '#1A1A1A' }} onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-base">Laisser un avis</h3>
                    <button onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <p className="text-[#888] text-xs mb-4">
                    Comment s'est passé le match avec <span className="text-white font-semibold">{opponentName}</span> ?
                </p>

                <div className="flex gap-3 mb-4">
                    {[
                        { key: 'positive', label: 'POSITIF', color: '#4CD964' },
                        { key: 'negative', label: 'NÉGATIF', color: '#FF3B30' },
                    ].map(s => (
                        <button key={s.key} onClick={() => setSentiment(s.key)}
                            className="flex-1 rounded-xl py-4 flex flex-col items-center gap-2"
                            style={{
                                background: sentiment === s.key ? `${s.color}1A` : '#0D0D0D',
                                border: `2px solid ${sentiment === s.key ? s.color : '#2A2A2A'}`,
                            }}>
                            <span className="text-xl">{s.key === 'positive' ? '👍' : '👎'}</span>
                            <span className="text-xs font-bold"
                                style={{ color: sentiment === s.key ? s.color : '#666' }}>
                                {s.label}
                            </span>
                        </button>
                    ))}
                </div>

                <textarea value={comment} onChange={e => setComment(e.target.value)}
                    placeholder="Ajoute un commentaire (optionnel)..."
                    rows={3} maxLength={500}
                    className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none resize-none mb-4"
                    style={{ background: '#0D0D0D', border: '1px solid #2A2A2A' }} />

                <button onClick={submit} disabled={!sentiment || sending}
                    className="w-full rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2"
                    style={{ background: '#FF3B30', color: '#FFF', opacity: sentiment && !sending ? 1 : 0.35 }}>
                    {sending && (
                        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                    )}
                    PUBLIER L'AVIS
                </button>
            </div>
        </div>
    );
}

function PhaseDone({ match, me, userId }) {
    const won          = match.winner?.id === userId;
    const opponentName = me === 'player1' ? match.player2.username : match.player1.username;
    const [showAvis, setShowAvis] = useState(false);
    const [avisDone, setAvisDone] = useState(match.has_reviewed ?? false);

    return (
        <div className="px-4 flex flex-col gap-3">
            <div className="rounded-2xl p-6 flex flex-col items-center gap-3"
                style={{
                    background: won ? 'rgba(76,217,100,0.08)' : 'rgba(255,59,48,0.08)',
                    border: `1px solid ${won ? '#4CD964' : '#FF3B30'}`,
                }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: won ? 'rgba(76,217,100,0.2)' : 'rgba(255,59,48,0.2)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                        stroke={won ? '#4CD964' : '#FF3B30'} strokeWidth="2">
                        {won ? (
                            <>
                                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                                <path d="M4 22h16"/>
                                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                                <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
                            </>
                        ) : (
                            <>
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="15" y1="9" x2="9" y2="15"/>
                                <line x1="9" y1="9" x2="15" y2="15"/>
                            </>
                        )}
                    </svg>
                </div>
                <p className="font-black text-2xl" style={{ color: won ? '#4CD964' : '#FF3B30' }}>
                    {won ? 'VICTOIRE !' : 'DÉFAITE'}
                </p>
                <div className="flex items-center gap-2">
                    <span className="text-[#888] text-sm">Gains :</span>
                    <span className="font-black text-xl" style={{ color: won ? '#4CD964' : '#FF3B30' }}>
                        {won ? `+${match.bet_amount * 2}` : `-${match.bet_amount}`} RB
                    </span>
                </div>
                <p className="text-[#666] text-xs text-center">
                    {won
                        ? 'Les fonds ont été crédités sur ton solde.'
                        : 'Ta mise a été transférée au vainqueur.'}
                </p>
            </div>

            <div className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                <p className="text-[#888] text-[10px] tracking-widest font-semibold mb-3">RÉSUMÉ DU MATCH</p>
                <div className="flex flex-col gap-2">
                    {[
                        { label: 'Adversaire',    value: opponentName },
                        { label: 'Jeu',           value: match.game },
                        { label: 'Format',        value: match.rules?.format || 'Classic' },
                        { label: 'Mise initiale', value: `${match.bet_amount} RB` },
                        { label: 'Résultat',      value: won ? `+${match.bet_amount * 2} RB` : `-${match.bet_amount} RB`, color: won ? '#4CD964' : '#FF3B30' },
                    ].map(r => (
                        <div key={r.label} className="flex items-center justify-between">
                            <span className="text-[#666] text-sm">{r.label}</span>
                            <span className="font-bold text-sm" style={{ color: r.color || '#FFFFFF' }}>{r.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {!avisDone ? (
                <button onClick={() => setShowAvis(true)}
                    className="w-full rounded-2xl py-3 font-bold text-sm flex items-center justify-center gap-2"
                    style={{ background: '#1A1A1A', color: '#FFAA88', border: '1px solid #3A2A2A' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Laisser un avis à {opponentName}
                </button>
            ) : (
                <div className="rounded-2xl py-3 flex items-center justify-center gap-2"
                    style={{ background: 'rgba(76,217,100,0.08)', border: '1px solid #4CD964' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4CD964" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span className="text-[#4CD964] text-sm font-semibold">Avis publié</span>
                </div>
            )}

            <div className="flex gap-3">
                <Link href="/battle" className="flex-1 rounded-2xl py-3 font-bold text-sm text-center"
                    style={{ background: '#1A1A1A', color: '#CCCCCC' }}>
                    Retour aux Défis
                </Link>
                <Link href="/challenge/create/1" className="flex-1 rounded-2xl py-3 font-bold text-sm text-center"
                    style={{ background: '#FF3B30', color: '#FFFFFF' }}>
                    Nouveau Défi
                </Link>
            </div>

            {showAvis && (
                <AvisModal
                    matchId={match.id}
                    opponentName={opponentName}
                    onClose={() => { setShowAvis(false); setAvisDone(true); }}
                />
            )}
        </div>
    );
}

/* ─── PHASE: dispute ─── */
function PhaseDispute({ disputeId }) {
    return (
        <div className="px-4 flex flex-col gap-3">
            <div className="rounded-2xl p-5 flex flex-col items-center gap-3"
                style={{ background: 'rgba(255,149,0,0.08)', border: '1px solid #FF9500' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,149,0,0.2)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                </div>
                <p className="text-[#FF9500] font-bold text-base">Litige ouvert</p>
                <p className="text-[#888] text-xs text-center">
                    Les deux résultats sont contradictoires. Un administrateur va examiner les preuves et trancher.
                </p>
            </div>

            <div className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                <p className="text-[#888] text-[10px] tracking-widest font-semibold mb-3">QUE SE PASSE-T-IL MAINTENANT ?</p>
                <div className="flex flex-col gap-3">
                    {[
                        'Les captures d\'écran des deux joueurs sont examinées',
                        'Décision sous 24h ouvrables',
                        'La mise reste en séquestre jusqu\'à la décision',
                        'La décision de l\'admin est définitive',
                    ].map((text, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ background: 'rgba(255,149,0,0.2)' }}>
                                <span className="text-[10px] font-bold text-[#FF9500]">{i + 1}</span>
                            </div>
                            <p className="text-[#CCCCCC] text-sm">{text}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-3">
                {disputeId && (
                    <Link href={`/litiges/${disputeId}`}
                        className="flex-1 rounded-2xl py-3 font-bold text-sm text-center"
                        style={{ background: '#FF9500', color: '#0D0D0D' }}>
                        VOIR LE LITIGE
                    </Link>
                )}
                <Link href="/battle"
                    className="flex-1 rounded-2xl py-3 font-bold text-sm text-center"
                    style={{ background: '#1A1A1A', color: '#CCCCCC', border: '1px solid #2A2A2A' }}>
                    Retour aux Défis
                </Link>
            </div>
        </div>
    );
}

/* ─── MAIN ─── */
export default function Match() {
    const { match: matchData, me, auth } = usePage().props;
    const userId = auth?.user?.id;

    const [localPhase, setLocalPhase] = useState(() => derivePhase(matchData));

    useEffect(() => {
        const serverPhase = derivePhase(matchData);
        if (localPhase !== 'submit') {
            setLocalPhase(serverPhase);
        }
    }, [matchData.status, matchData.my_result]);

    const phaseLabel = {
        waiting:    'EN ATTENTE',
        playing:    'EN JEU',
        submit:     'RÉSULTAT',
        validating: 'VALIDATION',
        done:       'TERMINÉ',
        dispute:    'LITIGE',
    }[localPhase] ?? 'EN ATTENTE';

    const phaseColor = localPhase === 'done'
        ? '#4CD964'
        : localPhase === 'dispute'
        ? '#FF9500'
        : '#FF3B30';

    const phaseBg = localPhase === 'done'
        ? 'rgba(76,217,100,0.15)'
        : localPhase === 'dispute'
        ? 'rgba(255,149,0,0.15)'
        : 'rgba(255,59,48,0.15)';

    return (
        <AppLayout>
            <TopBar />

            <div className="flex items-center px-4 pt-2 pb-3 gap-3">
                <Link href="/battle">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="19" y1="12" x2="5" y2="12"/>
                        <polyline points="12 19 5 12 12 5"/>
                    </svg>
                </Link>
                <h1 className="text-white font-black text-lg flex-1">Match #{matchData.id}</h1>
                <span className="text-xs px-2 py-1 rounded-lg font-semibold"
                    style={{ background: phaseBg, color: phaseColor }}>
                    {phaseLabel}
                </span>
            </div>

            <StepBar phase={localPhase} />
            <PlayerVS match={matchData} />

            <div className="pb-6">
                {localPhase === 'waiting'    && <PhaseWaiting    match={matchData} me={me} />}
                {localPhase === 'playing'    && <PhasePlaying    match={matchData} onSubmitResult={() => setLocalPhase('submit')} />}
                {localPhase === 'submit'     && <PhaseSubmit     match={matchData} />}
                {localPhase === 'validating' && <PhaseValidating match={matchData} me={me} />}
                {localPhase === 'done'       && <PhaseDone       match={matchData} me={me} userId={userId} />}
                {localPhase === 'dispute'    && <PhaseDispute disputeId={matchData.dispute_id} />}
            </div>
        </AppLayout>
    );
}
