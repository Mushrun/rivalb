import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '../Components/AppLayout';

const typeIcon = {
    defi_recu:      { bg: 'rgba(255,59,48,0.15)',   color: '#FF3B30', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
    defi_rejoint:   { bg: 'rgba(255,59,48,0.15)',   color: '#FF3B30', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/></svg> },
    defi_annule:    { bg: 'rgba(255,149,0,0.15)',   color: '#FF9500', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> },
    match_demarre:  { bg: 'rgba(255,149,0,0.15)',   color: '#FF9500', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> },
    match_gagne:    { bg: 'rgba(76,217,100,0.15)',  color: '#4CD964', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg> },
    match_perdu:    { bg: 'rgba(255,59,48,0.15)',   color: '#FF3B30', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg> },
    litige_ouvert:  { bg: 'rgba(255,59,48,0.15)',   color: '#FF3B30', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
    litige_gagne:   { bg: 'rgba(76,217,100,0.15)',  color: '#4CD964', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> },
    litige_perdu:   { bg: 'rgba(255,59,48,0.15)',   color: '#FF3B30', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> },
    depot_valide:   { bg: 'rgba(76,217,100,0.15)',  color: '#4CD964', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> },
    retrait_valide: { bg: 'rgba(255,149,0,0.15)',   color: '#FF9500', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg> },
};

const defaultIcon = { bg: 'rgba(255,59,48,0.15)', color: '#FF3B30', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> };

export default function Notifications() {
    const { notifications = [] } = usePage().props;

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllRead = () => {
        router.post('/notifications/read-all', {}, { preserveScroll: true });
    };

    const handleClick = (n) => {
        if (!n.read) {
            router.post(`/notifications/${n.id}/read`);
        } else {
            router.visit(n.link);
        }
    };

    // Grouper par date
    const groups = notifications.reduce((acc, n) => {
        if (!acc[n.date]) acc[n.date] = [];
        acc[n.date].push(n);
        return acc;
    }, {});

    return (
        <AppLayout>
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-5 pb-4">
                <div className="flex items-center gap-3">
                    <Link href="/battle">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-white font-black text-lg leading-none">Notifications</h1>
                        {unreadCount > 0 && (
                            <p className="text-[#FF3B30] text-xs font-semibold mt-0.5">
                                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                </div>
                {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[#888] text-xs font-semibold">
                        Tout marquer lu
                    </button>
                )}
            </div>

            {/* Liste groupée */}
            <div className="flex flex-col gap-5 px-4 pb-6">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                            style={{ background: '#1A1A1A' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                            </svg>
                        </div>
                        <p className="text-[#555] text-sm">Aucune notification</p>
                    </div>
                ) : (
                    Object.entries(groups).map(([date, items]) => (
                        <div key={date}>
                            <p className="text-[#444] text-[10px] font-bold tracking-widest mb-2">
                                {date.toUpperCase()}
                            </p>
                            <div className="flex flex-col gap-2">
                                {items.map(n => {
                                    const icon = typeIcon[n.type] ?? defaultIcon;
                                    return (
                                        <button key={n.id} onClick={() => handleClick(n)}
                                            className="flex items-start gap-3 rounded-2xl p-3.5 text-left w-full"
                                            style={{
                                                background: n.read ? '#111' : '#1A1A1A',
                                                border: n.read ? '1px solid transparent' : '1px solid #2A2A2A',
                                            }}>
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                                                style={{ background: icon.bg, color: icon.color }}>
                                                {icon.svg}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold leading-tight"
                                                    style={{ color: n.read ? '#888' : '#FFF' }}>
                                                    {n.title}
                                                </p>
                                                <p className="text-[#555] text-xs mt-0.5 leading-relaxed">{n.body}</p>
                                                <p className="text-[#444] text-[10px] mt-1">{n.time}</p>
                                            </div>
                                            {!n.read && (
                                                <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                                                    style={{ background: '#FF3B30' }} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </AppLayout>
    );
}
