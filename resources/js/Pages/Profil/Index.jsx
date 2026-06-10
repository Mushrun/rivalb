import { Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppLayout from '../../Components/AppLayout';
import { resolveMediaUrl } from '../../utils/media';

function Avatar({ path, username, size = 24 }) {
    const url = resolveMediaUrl(path);
    return (
        <div className="rounded-2xl overflow-hidden flex items-center justify-center glow-border-red flex-shrink-0"
            style={{ width: size, height: size, background: '#1A1A1A' }}>
            {url ? (
                <img src={url} alt={username} className="w-full h-full object-cover" />
            ) : (
                <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
            )}
        </div>
    );
}

export default function ProfilIndex() {
    const { profile } = usePage().props;
    const { t } = useTranslation();

    const reliability = profile?.reliability_score ?? 100;
    const wins        = profile?.wins   ?? 0;
    const losses      = profile?.losses ?? 0;
    const total       = profile?.total  ?? 0;

    const menuItems = [
        { icon: 'settings', label: t('profil.menu_settings'), href: '/settings' },
        { icon: 'list',     label: t('profil.menu_history'),  href: '/historique' },
        { icon: 'help',     label: t('profil.menu_support'),  href: '/support' },
    ];

    return (
        <AppLayout>
            <div className="flex flex-col items-center px-4 pt-8">

                <Avatar path={profile?.avatar_path} username={profile?.username} size={96} />

                <h1 className="text-white font-bold text-2xl mt-3 mb-1">{profile?.username}</h1>
                {profile?.bio && (
                    <p className="text-[#666] text-xs text-center max-w-xs mb-1">{profile.bio}</p>
                )}
                <p className="text-[#888] text-sm mb-6">{t('profil.member_since')} {profile?.member_since}</p>

                {/* Stats */}
                <div className="w-full rounded-2xl p-4 mb-4 flex items-center justify-between"
                    style={{ background: '#1A1A1A' }}>
                    <div className="flex-1 flex flex-col items-center">
                        <span className="text-white font-black text-2xl">{wins}</span>
                        <span className="text-[#888] text-xs tracking-wider mt-0.5">{t('profil.wins_label')}</span>
                    </div>
                    <div className="w-px h-10" style={{ background: '#2A2A2A' }}/>
                    <div className="flex-1 flex flex-col items-center">
                        <span className="text-white font-black text-2xl">{losses}</span>
                        <span className="text-[#888] text-xs tracking-wider mt-0.5">{t('profil.losses_label')}</span>
                    </div>
                    <div className="w-px h-10" style={{ background: '#2A2A2A' }}/>
                    <div className="flex-1 flex flex-col items-center">
                        <span className="text-white font-black text-2xl">{total}</span>
                        <span className="text-[#888] text-xs tracking-wider mt-0.5">{t('profil.fights_label')}</span>
                    </div>
                </div>

                {/* Fiabilité */}
                <div className="w-full rounded-2xl p-4 mb-3" style={{ background: '#1A1A1A' }}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-white font-semibold text-sm">{t('profil.reliability_label')}</span>
                        <span className="text-[#FF3B30] font-bold text-sm">{reliability}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full mb-2" style={{ background: '#2A2A2A' }}>
                        <div className="h-full rounded-full transition-all"
                            style={{ width: `${reliability}%`, background: 'linear-gradient(to right, #FF3B30, #FF6B30)' }} />
                    </div>
                    <p className="text-[#666] text-xs">{t('profil.reliability_hint')}</p>
                </div>

                {/* Solde */}
                <div className="w-full rounded-2xl p-4 mb-4 flex items-center justify-between"
                    style={{ background: '#1A1A1A' }}>
                    <span className="text-[#888] text-sm">{t('profil.balance_rb_label')}</span>
                    <span className="text-white font-black text-lg">{(profile?.balance_rb ?? 0).toLocaleString()} RB</span>
                </div>

                {/* Menu */}
                <div className="w-full flex flex-col gap-2 mb-4">
                    {menuItems.map(item => (
                        <Link key={item.href} href={item.href}
                            className="w-full rounded-2xl px-4 py-3 flex items-center justify-between"
                            style={{ background: '#1A1A1A' }}>
                            <div className="flex items-center gap-3">
                                <MenuIcon type={item.icon} />
                                <span className="text-white font-medium text-sm">{item.label}</span>
                            </div>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round">
                                <polyline points="9 18 15 12 9 6"/>
                            </svg>
                        </Link>
                    ))}
                </div>

                {/* Déconnexion */}
                <button onClick={() => router.post('/logout')}
                    className="w-full rounded-2xl py-3 flex items-center justify-center mb-8"
                    style={{ background: '#1A1A1A' }}>
                    <span className="text-white font-semibold text-xs tracking-widest">{t('profil.logout')}</span>
                </button>
            </div>
        </AppLayout>
    );
}

function MenuIcon({ type }) {
    const stroke = '#CCCCCC';
    if (type === 'settings') return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
    );
    if (type === 'list') return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
    );
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
    );
}
