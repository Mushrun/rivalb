import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

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

export default function TopBar() {
    const { url } = usePage();
    const { unread_count, auth } = usePage().props;
    const authPages = ['/login', '/register', '/forgot-password', '/reset-password'];
    const isGuest   = authPages.some(p => url.startsWith(p));
    const target    = isGuest ? '/login' : '/battle';
    const unread    = unread_count ?? 0;
    const price     = useRBPrice();
    const balance   = auth?.user?.balance_rb ?? 0;
    const usdValue  = price !== null ? balance * price : null;

    const fmtUsd = (v) => v < 0.01 ? `$${v.toFixed(4)}` : `$${v.toFixed(2)}`;

    return (
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="w-20" />

            <div className="flex flex-col items-center">
                <Link href={target} className="text-[#FF3B30] font-black text-xl tracking-widest">
                    RIVALBET
                </Link>
                {!isGuest && price !== null && (
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                            style={{ background: 'rgba(255,170,136,0.12)', color: '#FFAA88' }}>
                            RB ${price < 0.001 ? price.toExponential(2) : price.toFixed(6)}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                            style={{ background: 'rgba(76,217,100,0.1)', color: '#4CD964' }}>
                            {fmtUsd(usdValue ?? 0)}
                        </span>
                    </div>
                )}
            </div>

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
            ) : (
                <div className="w-8" />
            )}
        </div>
    );
}
