import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppLayout from '../../Components/AppLayout';
import TopBar from '../../Components/TopBar';

function useStatusConfig() {
    const { t } = useTranslation();
    return {
        ouvert:  { label: t('dispute.open'),      color: '#FF3B30', bg: 'rgba(255,59,48,0.15)' },
        resolu:  { label: t('dispute.resolved'),  color: '#4CD964', bg: 'rgba(76,217,100,0.15)' },
        annule:  { label: t('dispute.cancelled'), color: '#888888', bg: 'rgba(136,136,136,0.15)' },
    };
}

function ResultBadge({ result }) {
    const { t } = useTranslation();
    if (!result) return <span className="text-[#555] text-xs">{t('chat.waiting')}</span>;
    return (
        <span className="text-xs font-bold px-2 py-0.5 rounded"
            style={result === 'win'
                ? { background: 'rgba(76,217,100,0.15)', color: '#4CD964' }
                : { background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}>
            {result === 'win' ? t('dispute.declared_win') : t('dispute.declared_loss')}
        </span>
    );
}

export default function DisputeShow() {
    const { dispute, match, auth } = usePage().props;
    const { t } = useTranslation();
    const statusConfig = useStatusConfig();
    const userId = auth?.user?.id;

    const s           = statusConfig[dispute.status] ?? statusConfig.ouvert;
    const isPlayer1   = match.player1.id === userId;
    const opponentName = isPlayer1 ? match.player2.username : match.player1.username;
    const isResolved  = dispute.status === 'resolu';
    const isCancelled = dispute.status === 'annule';
    const iWon        = isResolved && dispute.winner?.id === userId;

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
                    <h1 className="text-white font-black text-lg">{t('dispute.title')} #{dispute.id}</h1>
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
                            {iWon ? t('dispute.won') : t('dispute.lost')}
                        </p>
                        <p className="font-black text-xl" style={{ color: iWon ? '#4CD964' : '#FF3B30' }}>
                            {iWon ? `+${match.bet_amount * 2} RB` : `-${match.bet_amount} RB`}
                        </p>
                        {dispute.admin_note && (
                            <p className="text-[#888] text-xs text-center mt-1">{t('dispute.admin_note')} {dispute.admin_note}</p>
                        )}
                        <p className="text-[#444] text-xs">{dispute.resolved_at}</p>
                    </div>
                )}

                {isCancelled && (
                    <div className="rounded-2xl p-4 flex flex-col items-center gap-2"
                        style={{ background: 'rgba(136,136,136,0.08)', border: '1px solid #444' }}>
                        <p className="text-white font-bold text-base">{t('dispute.match_cancelled_title')}</p>
                        <p className="text-[#4CD964] font-black text-xl">+{match.bet_amount} RB</p>
                        <p className="text-[#888] text-xs text-center">{t('dispute.refund_note')}</p>
                    </div>
                )}

                {/* Match info */}
                <div className="rounded-2xl p-4" style={{ background: '#1A1A1A' }}>
                    <p className="text-[#888] text-[10px] tracking-widest font-semibold mb-3">{t('dispute.match_concerned')}</p>
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

                {/* Vote communautaire Telegram */}
                {dispute.status === 'ouvert' && (
                    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.25)' }}>
                        <div className="flex items-center gap-2 mb-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            <p className="text-[#FF9500] font-bold text-sm">{t('dispute.vote_in_progress')}</p>
                        </div>
                        <p className="text-[#888] text-xs mb-3">
                            {t('dispute.vote_description')}
                        </p>
                        <div className="flex items-center gap-2 rounded-xl px-3 py-2"
                            style={{ background: 'rgba(0,136,204,0.1)', border: '1px solid rgba(0,136,204,0.3)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#0088CC">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.032 9.574c-.152.67-.548.835-1.111.519l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 14.498l-2.946-.916c-.64-.2-.653-.64.134-.948l11.498-4.43c.533-.194 1-.12.396.044z"/>
                            </svg>
                            <span className="text-[#0088CC] text-xs font-semibold">{t('dispute.join_telegram')}</span>
                        </div>
                    </div>
                )}

                <Link href="/battle"
                    className="w-full rounded-2xl py-3 font-bold text-sm text-center block"
                    style={{ background: '#1A1A1A', color: '#CCCCCC' }}>
                    {t('dispute.back_to_defis')}
                </Link>
            </div>
        </AppLayout>
    );
}
