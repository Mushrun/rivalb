import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

const BattleIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <path d="M9 12h6M9 16h6M9 8h1"/>
    </svg>
);

const SwordsIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/>
        <line x1="13" y1="19" x2="19" y2="13"/>
        <line x1="16" y1="16" x2="20" y2="20"/>
        <line x1="19" y1="21" x2="21" y2="19"/>
        <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/>
        <line x1="5" y1="14" x2="8" y2="17"/>
        <line x1="3" y1="21" x2="5" y2="19"/>
    </svg>
);

const HistoriqueIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/>
        <line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/>
        <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
);

const AdsIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="14.31" y1="8" x2="20.05" y2="17.94"/>
        <line x1="9.69" y1="8" x2="21.17" y2="8"/>
        <line x1="7.38" y1="12" x2="13.12" y2="2.06"/>
        <line x1="9.69" y1="16" x2="3.95" y2="6.06"/>
        <line x1="14.31" y1="16" x2="2.83" y2="16"/>
        <line x1="16.62" y1="12" x2="10.88" y2="21.94"/>
    </svg>
);

const ChatIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
);

const ProfileIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
);

export default function BottomNav() {
    const { url, props } = usePage();
    const { t } = useTranslation();
    const unreadChat = props.unread_chat ?? 0;

    const tabs = [
        { name: t('nav.defis').toUpperCase(),      href: '/battle',     icon: SwordsIcon },
        { name: t('nav.historique').toUpperCase(), href: '/historique', icon: HistoriqueIcon },
        { name: t('nav.mes_defis').toUpperCase(),  href: '/ads',        icon: AdsIcon },
        { name: t('nav.chat').toUpperCase(),       href: '/chat',       icon: ChatIcon },
        { name: t('nav.profil').toUpperCase(),     href: '/profil',     icon: ProfileIcon },
    ];

    return (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50"
            style={{ background: 'linear-gradient(to top, #0D0D0D 80%, transparent)' }}>
            <div className="flex items-center justify-around px-2 pb-2 pt-3"
                style={{ borderTop: '1px solid #1E1E1E' }}>
                {tabs.map(({ name, href, icon: Icon }) => {
                    const active = url.startsWith(href);
                    return (
                        <Link key={name} href={href}
                            className="flex flex-col items-center gap-1 min-w-[52px] relative">
                            <div className="relative">
                                <Icon />
                                {name === 'CHAT' && unreadChat > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-[3px] rounded-full bg-[#FF3B30] border border-[#0D0D0D] flex items-center justify-center text-white font-bold leading-none"
                                        style={{ fontSize: '9px' }}>
                                        {unreadChat > 99 ? '99+' : unreadChat}
                                    </span>
                                )}
                            </div>
                            <span className="text-[9px] font-semibold tracking-wider"
                                style={{ color: active ? '#FF3B30' : '#666666' }}>
                                {name}
                            </span>
                            {active && (
                                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#FF3B30]" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
