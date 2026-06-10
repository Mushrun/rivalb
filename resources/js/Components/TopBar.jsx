import { useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

function playNotifSound() {
    try {
        const ctx  = new (window.AudioContext || window.webkitAudioContext)();
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
    } catch {}
}

const RB_TOKEN   = '0x8a56f2e7a05b27fab201ee879b35b2f235ff37c2';
const DEXSCREENER = `https://api.dexscreener.com/latest/dex/tokens/${RB_TOKEN}`;

function useRBPrice() {
    const [price, setPrice] = useState(null);

    useEffect(() => {
        const fetch_ = () => {
            fetch(DEXSCREENER)
                .then(r => r.json())
                .then(data => {
                    const pair = data?.pairs?.[0];
                    if (pair?.priceUsd) setPrice(parseFloat(pair.priceUsd));
                })
                .catch(() => {});
        };
        fetch_();
        const id = setInterval(fetch_, 60_000); // refresh toutes les 60s
        return () => clearInterval(id);
    }, []);

    return price;
}

function LangToggle() {
    const { i18n } = useTranslation();
    const { auth } = usePage().props;
    const lang = i18n.language?.startsWith('en') ? 'en' : 'fr';
    const toggle = () => {
        const newLang = lang === 'fr' ? 'en' : 'fr';
        i18n.changeLanguage(newLang);
        if (auth?.user) {
            const token = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
            fetch('/user/locale', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token },
                body: JSON.stringify({ locale: newLang }),
            }).catch(() => {});
        }
    };
    return (
        <button onClick={toggle}
            className="text-[10px] font-black px-2 py-0.5 rounded-lg border transition-all"
            style={{
                background: 'rgba(255,59,48,0.08)',
                borderColor: 'rgba(255,59,48,0.3)',
                color: '#FF3B30',
            }}>
            {lang === 'fr' ? 'EN' : 'FR'}
        </button>
    );
}

export default function TopBar() {
    const { url } = usePage();
    const { unread_count, auth } = usePage().props;
    const authPages = ['/login', '/register', '/forgot-password', '/reset-password'];
    const isGuest   = authPages.some(p => url.startsWith(p));
    const target    = isGuest ? '/login' : '/battle';
    const unread     = unread_count ?? 0;
    const prevUnread = useRef(unread);
    const price      = useRBPrice();

    useEffect(() => {
        if (unread > prevUnread.current) {
            playNotifSound();
        }
        prevUnread.current = unread;
    }, [unread]);
    const balance     = auth?.user?.balance_rb   ?? 0;
    const balanceUsdt = auth?.user?.balance_usdt ?? 0;
    const usdValue    = price !== null ? balance * price : null;

    const fmtUsd = (v) => v < 0.01 ? `$${v.toFixed(4)}` : `$${v.toFixed(2)}`;

    return (
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="w-20" />

            <div className="flex flex-col items-center">
                <Link href={target} className="text-[#FF3B30] font-black text-xl tracking-widest">
                    RIVALBET
                </Link>
                {!isGuest && (
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                            style={{ background: 'rgba(255,170,136,0.12)', color: '#FFAA88' }}>
                            {balance.toLocaleString()} RB
                        </span>
                        {balanceUsdt > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                                style={{ background: 'rgba(76,217,100,0.1)', color: '#4CD964' }}>
                                {parseFloat(balanceUsdt).toFixed(2)} USDT
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                <LangToggle />
                {!isGuest ? (
                    <Link href="/notifications" className="relative w-8 h-8 flex items-center justify-center">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                        {unread > 0 && (
                            <span className="absolute top-0 right-0 min-w-[16px] h-4 rounded-full text-[9px] font-black flex items-center justify-center px-1"
                                style={{ background: '#FF3B30', color: '#FFF' }}>
                                {unread > 99 ? '99+' : unread}
                            </span>
                        )}
                    </Link>
                ) : null}
            </div>
        </div>
    );
}
