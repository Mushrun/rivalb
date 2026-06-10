import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppLayout from '../../Components/AppLayout';
import TopBar from '../../Components/TopBar';

function Avatar({ username }) {
    return (
        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-base"
            style={{ background: '#FF3B30' }}>
            {username?.[0]?.toUpperCase()}
        </div>
    );
}

export default function ChatIndex() {
    const { conversations = [] } = usePage().props;
    const { t } = useTranslation();
    const [query, setQuery] = useState('');

    const statusLabel = {
        en_attente: { label: t('chat.status_waiting'),     color: '#FF9500' },
        en_cours:   { label: t('chat.status_in_progress'), color: '#4CD964' },
        litige:     { label: t('chat.status_dispute'),     color: '#FF3B30' },
        termine:    { label: t('chat.status_done'),        color: '#555' },
        annule:     { label: t('chat.status_cancelled'),   color: '#555' },
    };

    const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

    const filtered = query.trim()
        ? conversations.filter(c =>
            c.opponent.username.toLowerCase().includes(query.toLowerCase()) ||
            c.game?.toLowerCase().includes(query.toLowerCase())
          )
        : conversations;

    return (
        <AppLayout>
            <TopBar />

            <div className="px-4 pt-2 pb-3">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h1 className="text-white font-bold text-2xl">{t('chat.messages_title')}</h1>
                        {totalUnread > 0 && (
                            <p className="text-[#FF3B30] text-xs font-semibold">
                                {totalUnread} {t(totalUnread > 1 ? 'chat.unread_other' : 'chat.unread_one')}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl"
                    style={{ background: '#1A1A1A' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder={t('chat.search_placeholder')}
                        className="flex-1 bg-transparent text-white text-sm outline-none placeholder-[#444]"
                    />
                    {query && (
                        <button onClick={() => setQuery('')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)', paddingBottom: '100px' }}>
                {conversations.length === 0 ? (
                    <div className="mx-4 rounded-2xl p-10 flex flex-col items-center gap-3" style={{ background: '#1A1A1A' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        <p className="text-[#555] text-sm text-center">
                            {t('chat.no_conversations')}<br/>{t('chat.no_conversations_sub')}
                        </p>
                        <Link href="/battle"
                            className="px-4 py-2 rounded-xl font-bold text-xs"
                            style={{ background: '#FF3B30', color: '#FFF' }}>
                            {t('chat.see_battles')}
                        </Link>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="mx-4 rounded-2xl p-8 flex flex-col items-center gap-2" style={{ background: '#1A1A1A' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <p className="text-[#555] text-sm">{t('chat.no_results_prefix')} "{query}"</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {filtered.map((conv, i) => {
                            const s         = statusLabel[conv.status] ?? { label: conv.status, color: '#888' };
                            const hasUnread = conv.unread_count > 0;
                            return (
                                <Link key={conv.match_id} href={`/chat/${conv.match_id}`}
                                    className="flex items-center gap-3 px-4 py-3.5"
                                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid #1A1A1A' : 'none' }}>

                                    <div className="relative">
                                        <Avatar username={conv.opponent.username} />
                                        {hasUnread && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                                style={{ background: '#FF3B30' }}>
                                                {conv.unread_count > 9 ? '9+' : conv.unread_count}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className="text-white font-semibold text-sm">{conv.opponent.username}</span>
                                            <span className="text-[#666] text-xs ml-2 flex-shrink-0">
                                                {conv.last_message?.time ?? ''}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm truncate flex-1"
                                                style={{ color: hasUnread ? '#CCCCCC' : '#888', fontWeight: hasUnread ? '600' : '400' }}>
                                                {conv.last_message
                                                    ? (conv.last_message.is_mine ? t('chat.you_prefix') : '') + conv.last_message.body
                                                    : `${conv.game} · ${conv.bet_amount} RB`}
                                            </p>
                                            <div className="flex flex-col items-end flex-shrink-0">
                                                <span className="text-[10px] font-semibold" style={{ color: s.color }}>
                                                    {s.label}
                                                </span>
                                                {conv.status === 'termine' && conv.my_outcome === 'win' && (
                                                    <span className="text-[10px] font-bold" style={{ color: '#4CD964' }}>{t('chat.victory_label')}</span>
                                                )}
                                                {conv.status === 'termine' && conv.my_outcome === 'loss' && (
                                                    <span className="text-[10px] font-bold" style={{ color: '#FF3B30' }}>{t('chat.lost_label')}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
