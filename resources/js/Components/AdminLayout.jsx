import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

const navItems = [
    { href: '/admin',              label: 'Dashboard',       icon: 'dashboard' },
    { href: '/admin/users',        label: 'Utilisateurs',    icon: 'users' },
    { href: '/admin/defis',        label: 'Défis',           icon: 'swords' },
    { href: '/admin/matchs',       label: 'Matchs',          icon: 'trophy' },
    { href: '/admin/litiges',      label: 'Litiges',         icon: 'alert', badge: 'disputes' },
    { href: '/admin/transactions', label: 'Transactions',    icon: 'wallet' },
    { href: '/admin/combattants',  label: 'Combattants',     icon: 'fighter' },
    { href: '/admin/admins',       label: 'Administrateurs', icon: 'shield' },
];

function NavIcon({ type }) {
    const p = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
    if (type === 'dashboard') return <svg {...p} stroke="currentColor"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
    if (type === 'users')     return <svg {...p} stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    if (type === 'swords')    return <svg {...p} stroke="currentColor"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/></svg>;
    if (type === 'trophy')    return <svg {...p} stroke="currentColor"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>;
    if (type === 'alert')     return <svg {...p} stroke="currentColor"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
    if (type === 'wallet')    return <svg {...p} stroke="currentColor"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
    if (type === 'fighter')   return <svg {...p} stroke="currentColor"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/></svg>;
    if (type === 'shield')    return <svg {...p} stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    return null;
}

const logout = () => router.post('/admin/logout');

export default function AdminLayout({ children, title }) {
    const { url, props } = usePage();
    const [sideOpen, setSideOpen] = useState(false);
    const admin = props.auth?.admin;
    const openDisputesCount = props.open_disputes_count ?? 0;

    return (
        <div className="flex min-h-screen" style={{ background: '#0A0A0A' }}>

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col w-56 transition-transform ${sideOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
                style={{ background: '#111111', borderRight: '1px solid #1E1E1E' }}>

                {/* Logo */}
                <div className="flex items-center gap-2 px-5 py-5" style={{ borderBottom: '1px solid #1E1E1E' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#FF3B30' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/>
                            <line x1="13" y1="19" x2="19" y2="13"/>
                        </svg>
                    </div>
                    <div>
                        <p className="text-white font-black text-sm tracking-wider">RIVALBET</p>
                        <p className="text-[#555] text-[9px] tracking-widest">ADMIN</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
                    {navItems.map(item => {
                        const active = url === item.href || (item.href !== '/admin' && url.startsWith(item.href));
                        return (
                            <Link key={item.href} href={item.href}
                                onClick={() => setSideOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative"
                                style={{
                                    background: active ? 'rgba(255,59,48,0.12)' : 'transparent',
                                    color: active ? '#FF3B30' : '#888888',
                                }}>
                                <NavIcon type={item.icon} />
                                <span className="text-sm font-semibold">{item.label}</span>
                                {item.badge === 'disputes' && openDisputesCount > 0 && (
                                    <span className="ml-auto w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                                        style={{ background: '#FF3B30', color: '#FFF' }}>
                                        {openDisputesCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="px-3 py-4 flex flex-col gap-1" style={{ borderTop: '1px solid #1E1E1E' }}>
                    <button onClick={logout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left"
                        style={{ color: '#FF3B30' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        <span className="text-sm font-semibold">Se déconnecter</span>
                    </button>
                </div>
            </aside>

            {/* Overlay mobile */}
            {sideOpen && (
                <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSideOpen(false)} />
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col lg:ml-56">

                {/* Topbar */}
                <header className="sticky top-0 z-20 flex items-center justify-between px-5 py-3"
                    style={{ background: '#111111', borderBottom: '1px solid #1E1E1E' }}>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSideOpen(v => !v)} className="lg:hidden">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round">
                                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
                            </svg>
                        </button>
                        <h1 className="text-white font-bold text-base">{title}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={logout} className="text-[#555] text-xs font-semibold hidden sm:block hover:text-[#FF3B30] transition-colors">
                            Déconnexion
                        </button>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs"
                            style={{ background: '#FF3B30' }}>
                            {admin?.name?.[0]?.toUpperCase() ?? 'A'}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-5">
                    {children}
                </main>
            </div>
        </div>
    );
}
