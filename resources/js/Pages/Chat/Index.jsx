import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppLayout from '../../Components/AppLayout';
import TopBar from '../../Components/TopBar';

function Avatar({ username, size = 12 }) {
    return (
        <div className={`w-${size} h-${size} rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-base`}
            style={{ background: '#FF3B30' }}>
            {username?.[0]?.toUpperCase()}
        </div>
    );
}

// ── Onglet Messages ──────────────────────────────────────────────────────────
function MessagesTab({ conversations }) {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');

    const statusLabel = {
        en_attente: { label: t('chat.status_waiting'),     color: '#FF9500' },
        en_cours:   { label: t('chat.status_in_progress'), color: '#4CD964' },
        litige:     { label: t('chat.status_dispute'),     color: '#FF3B30' },
        termine:    { label: t('chat.status_done'),        color: '#555' },
        annule:     { label: t('chat.status_cancelled'),   color: '#555' },
    };

    const filtered = query.trim()
        ? conversations.filter(c =>
            c.opponent.username.toLowerCase().includes(query.toLowerCase())
          )
        : conversations;

    return (
        <>
            {/* Barre de recherche */}
            <div className="px-4 pb-3">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl" style={{ background: '#1A1A1A' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
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
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 260px)', paddingBottom: '100px' }}>
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
                        <p className="text-[#555] text-sm">{t('chat.no_results_prefix')} "{query}"</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {filtered.map((conv, i) => {
                            const s         = statusLabel[conv.status] ?? { label: conv.status, color: '#888' };
                            const hasUnread = conv.unread_count > 0;
                            return (
                                <Link key={conv.opponent_id} href={`/chat/user/${conv.opponent_id}`}
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
        </>
    );
}

// ── Onglet Contacts ──────────────────────────────────────────────────────────
function ContactsTab({ contacts }) {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');

    const filtered = query.trim()
        ? contacts.filter(c => c.username.toLowerCase().includes(query.toLowerCase()))
        : contacts;

    return (
        <>
            {/* Barre de recherche */}
            <div className="px-4 pb-3">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl" style={{ background: '#1A1A1A' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
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
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 260px)', paddingBottom: '100px' }}>
                {contacts.length === 0 ? (
                    <div className="mx-4 rounded-2xl p-10 flex flex-col items-center gap-3" style={{ background: '#1A1A1A' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        <p className="text-[#555] text-sm text-center">
                            {t('chat.no_contacts')}<br/>
                            <span className="text-[#444]">{t('chat.no_contacts_sub')}</span>
                        </p>
                        <Link href="/battle"
                            className="px-4 py-2 rounded-xl font-bold text-xs"
                            style={{ background: '#FF3B30', color: '#FFF' }}>
                            {t('chat.see_battles')}
                        </Link>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="mx-4 rounded-2xl p-8 flex flex-col items-center gap-2" style={{ background: '#1A1A1A' }}>
                        <p className="text-[#555] text-sm">{t('chat.no_results_prefix')} "{query}"</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {filtered.map((contact, i) => {
                            const hasUnread = contact.unread_count > 0;
                            return (
                                <Link key={contact.user_id} href={`/chat/user/${contact.user_id}`}
                                    className="flex items-center gap-3 px-4 py-3.5"
                                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid #1A1A1A' : 'none' }}>

                                    <div className="relative">
                                        <Avatar username={contact.username} />
                                        {hasUnread && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                                style={{ background: '#FF3B30' }}>
                                                {contact.unread_count > 9 ? '9+' : contact.unread_count}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <span className="text-white font-semibold text-sm block">{contact.username}</span>
                                        {contact.last_message ? (
                                            <p className="text-sm truncate"
                                                style={{ color: hasUnread ? '#CCC' : '#888', fontWeight: hasUnread ? '600' : '400' }}>
                                                {(contact.last_message.is_mine ? t('chat.you_prefix') : '') + contact.last_message.body}
                                            </p>
                                        ) : (
                                            <p className="text-[#555] text-xs">{t('chat.no_message_yet')}</p>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                        {contact.last_message && (
                                            <span className="text-[#666] text-xs">{contact.last_message.time}</span>
                                        )}
                                        <span className="px-3 py-1 rounded-xl text-[10px] font-bold"
                                            style={{ background: '#1E1E2A', color: '#888', border: '1px solid #2A2A3A' }}>
                                            {t('chat.write_btn')}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

// ── Page principale ──────────────────────────────────────────────────────────
export default function ChatIndex() {
    const { conversations = [], contacts = [] } = usePage().props;
    const { t } = useTranslation();
    const [tab, setTab] = useState('messages');

    const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)
        + contacts.reduce((sum, c) => sum + (c.unread_count || 0), 0);

    const tabs = [
        { key: 'messages', label: t('chat.tab_messages') },
        { key: 'contacts', label: t('chat.tab_contacts'), count: contacts.length },
    ];

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

                {/* Onglets */}
                <div className="flex gap-1 p-1 rounded-2xl mb-3" style={{ background: '#1A1A1A' }}>
                    {tabs.map(t2 => (
                        <button key={t2.key} onClick={() => setTab(t2.key)}
                            className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                            style={{
                                background: tab === t2.key ? '#FF3B30' : 'transparent',
                                color:      tab === t2.key ? '#FFF'    : '#555',
                            }}>
                            {t2.label}
                            {t2.count > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                                    style={{
                                        background: tab === t2.key ? 'rgba(255,255,255,0.25)' : '#2A2A2A',
                                        color:      tab === t2.key ? '#FFF' : '#888',
                                    }}>
                                    {t2.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {tab === 'messages' && <MessagesTab conversations={conversations} />}
            {tab === 'contacts' && <ContactsTab contacts={contacts} />}
        </AppLayout>
    );
}
