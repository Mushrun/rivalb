import { useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import TopBar from '../../Components/TopBar';

const statusConfig = {
    ouvert:  { label: 'OUVERT',  color: '#FF3B30', bg: 'rgba(255,59,48,0.15)' },
    resolu:  { label: 'RÉSOLU',  color: '#4CD964', bg: 'rgba(76,217,100,0.15)' },
    annule:  { label: 'ANNULÉ',  color: '#888888', bg: 'rgba(136,136,136,0.15)' },
};

function ResultBadge({ result }) {
    if (!result) return <span className="text-[#555] text-xs">En attente</span>;
    return (
        <span className="text-xs font-bold px-2 py-0.5 rounded"
            style={result === 'win'
                ? { background: 'rgba(76,217,100,0.15)', color: '#4CD964' }
                : { background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}>
            Dit avoir {result === 'win' ? 'GAGNÉ' : 'PERDU'}
        </span>
    );
}

export default function DisputeShow() {
    const { dispute, match, my_result, opponent_result, has_video, auth } = usePage().props;
    const userId = auth?.user?.id;

    const [videoFile,  setVideoFile]  = useState(null);
    const [uploading,  setUploading]  = useState(false);
    const [uploadErr,  setUploadErr]  = useState('');
    const fileRef = useRef();

    const s           = statusConfig[dispute.status] ?? statusConfig.ouvert;
    const isPlayer1   = match.player1.id === userId;
    const opponentName = isPlayer1 ? match.player2.username : match.player1.username;
    const isResolved  = dispute.status === 'resolu';
    const isCancelled = dispute.status === 'annule';
    const iWon        = isResolved && dispute.winner?.id === userId;

    const handleVideoChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setVideoFile(f);
        setUploadErr('');
    };

    const handleUpload = () => {
        if (!videoFile) return;
        setUploading(true);
        setUploadErr('');
        const form = new FormData();
        form.append('video', videoFile);
        router.post(`/litiges/${dispute.id}/video`, form, {
            forceFormData: true,
            onError: (errors) => {
                setUploadErr(Object.values(errors)[0] || 'Erreur lors de l\'upload.');
                setUploading(false);
            },
            onSuccess: () => setUploading(false),
        });
    };

    return (
        <AppLayout>
            <TopBar />

            {/* Header */}
            <div className="flex items-center px-4 pt-2 pb-4 gap-3">
                <Link href={`/match/${match.id}`}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="19" y1="12" x2="5" y2="12"/>
                        <polyline points="12 19 5 12 12 5"/>
                    </svg>
                </Link>
                <div className="flex-1">
                    <h1 className="text-white font-black text-lg">Litige #{dispute.id}</h1>
                    <p className="text-[#555] text-xs">{dispute.created_at}</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-lg"
                    style={{ background: s.bg, color: s.color }}>
                    {s.label}
                </span>
            </div>

            <div className="px-4 flex flex-col gap-3 pb-6">

                {/* Résolution */}
                {isResolved && (
                    <div className="rounded-2xl p-4 flex flex-col items-center gap-2"
                        style={{ background: iWon ? 'rgba(76,217,100,0.08)' : 'rgba(255,59,48,0.08)', border: `1px solid ${iWon ? '#4CD964' : '#FF3B30'}` }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                            stroke={iWon ? '#4CD964' : '#FF3B30'} strokeWidth="2.5" strokeLinecap="round">
                            {iWon
                                ? <polyline points="20 6 9 17 4 12"/>
                                : <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>}
                        </svg>
                        <p className="font-bold text-base" style={{ color: iWon ? '#4CD964' : '#FF3B30' }}>
                            {iWon ? 'Tu as été déclaré vainqueur !' : 'L\'adversaire a été déclaré vainqueur.'}
                        </p>
                        <p className="font-black text-xl" style={{ color: iWon ? '#4CD964' : '#FF3B30' }}>
                            {iWon ? `+${match.bet_amount * 2} RB` : `-${match.bet_amount} RB`}
                        </p>
                        {dispute.admin_note && (
                            <p className="text-[#888] text-xs text-center mt-1">Note admin : {dispute.admin_note}</p>
                        )}
                        <p className="text-[#444] text-xs">{dispute.resolved_at}</p>
                    </div>
                )}

                {isCancelled && (
                    <div className="rounded-2xl p-4 flex flex-col items-center gap-2"
                        style={{ background: 'rgba(136,136,136,0.08)', border: '1px solid #444' }}>
                        <p className="text-white font-bold text-base">Match annulé — Remboursement</p>
                        <p className="text-[#4CD964] font-black text-xl">+{match.bet_amount} RB</p>
                        <p className="text-[#888] text-xs text-center">Ta mise a été remboursée suite à la décision de l'admin.</p>
                    </div>
                )}

                {/* Match info */}
                <div className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                    <p className="text-[#888] text-[10px] tracking-widest font-semibold mb-3">MATCH CONCERNÉ</p>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[#FF3B30] text-xs font-bold px-2 py-1 rounded-lg"
                            style={{ background: 'rgba(255,59,48,0.15)' }}>
                            {match.game}
                        </span>
                        <span className="text-[#FFAA88] font-black text-base ml-auto">{match.bet_amount} RB</span>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1 rounded-xl p-3" style={{ background: '#0D0D0D' }}>
                            <p className="text-white font-bold text-sm mb-1">{match.player1.username}</p>
                            <ResultBadge result={match.p1_result} />
                        </div>
                        <div className="flex items-center">
                            <span className="text-[#FF3B30] font-black text-sm">VS</span>
                        </div>
                        <div className="flex-1 rounded-xl p-3" style={{ background: '#0D0D0D' }}>
                            <p className="text-white font-bold text-sm mb-1">{match.player2.username}</p>
                            <ResultBadge result={match.p2_result} />
                        </div>
                    </div>
                </div>

                {/* Statut en cours */}
                {dispute.status === 'ouvert' && (
                    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.25)' }}>
                        <div className="flex items-center gap-2 mb-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            <p className="text-[#FF9500] font-bold text-sm">En attente de décision admin</p>
                        </div>
                        <p className="text-[#888] text-xs">Un administrateur examine les preuves. Décision sous 24h.</p>
                    </div>
                )}

                {/* Upload vidéo */}
                {dispute.status === 'ouvert' && (
                    <div className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                        <p className="text-[#888] text-[10px] tracking-widest font-semibold mb-1">PREUVE VIDÉO</p>
                        <p className="text-[#555] text-xs mb-3">Optionnel — Envoie une vidéo du match pour renforcer ton dossier</p>

                        {uploadErr && (
                            <p className="text-[#FF3B30] text-xs mb-2">{uploadErr}</p>
                        )}

                        {has_video ? (
                            <div className="flex items-center gap-2 rounded-xl px-3 py-2"
                                style={{ background: 'rgba(76,217,100,0.08)', border: '1px solid rgba(76,217,100,0.2)' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4CD964" strokeWidth="2.5" strokeLinecap="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                <p className="text-[#4CD964] text-xs font-semibold">Vidéo envoyée ✓</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <input ref={fileRef} type="file" accept="video/mp4,video/mov,video/avi"
                                    className="hidden" onChange={handleVideoChange} />
                                {videoFile ? (
                                    <div className="flex items-center justify-between rounded-xl px-3 py-2"
                                        style={{ background: '#0D0D0D', border: '1px solid #2A2A2A' }}>
                                        <span className="text-[#CCCCCC] text-xs truncate flex-1">{videoFile.name}</span>
                                        <button onClick={() => setVideoFile(null)}
                                            className="ml-2 flex-shrink-0">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round">
                                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => fileRef.current.click()}
                                        className="w-full rounded-xl py-4 flex flex-col items-center gap-2 border-2 border-dashed"
                                        style={{ borderColor: '#2A2A2A', background: '#0D0D0D' }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5">
                                            <polygon points="23 7 16 12 23 17 23 7"/>
                                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                                        </svg>
                                        <span className="text-[#555] text-xs">Sélectionner une vidéo (mp4, max 100 Mo)</span>
                                    </button>
                                )}
                                {videoFile && (
                                    <button onClick={handleUpload} disabled={uploading}
                                        className="w-full rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2"
                                        style={{ background: '#FF3B30', color: '#FFF', opacity: uploading ? 0.7 : 1 }}>
                                        {uploading && (
                                            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                            </svg>
                                        )}
                                        {uploading ? 'Envoi...' : 'ENVOYER LA VIDÉO'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <Link href="/battle"
                    className="w-full rounded-2xl py-3 font-bold text-sm text-center block"
                    style={{ background: '#1A1A1A', color: '#CCCCCC' }}>
                    Retour aux Défis
                </Link>
            </div>
        </AppLayout>
    );
}
