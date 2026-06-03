import BottomNav from '../../Components/BottomNav';
import { useEffect, useState } from 'react';
import { Link, router } from '@inertiajs/react';

function StepProgress({ current, total }) {
    return (
        <div className="flex gap-1 w-full">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className="flex-1 h-0.5 rounded-full"
                    style={{ background: i < current ? '#FF7766' : '#2A1A1A' }} />
            ))}
        </div>
    );
}

export default function ChallengeStep6() {
    const [data, setData]       = useState({ type: '1v1', game: 'Shadow Fight', bet_amount: 10, visibility: 'public', rules: {} });
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');

    useEffect(() => {
        try {
            const baseRules = JSON.parse(sessionStorage.getItem('ch_rules') || '{}');
            setData({
                type:       sessionStorage.getItem('ch_type')       || '1v1',
                game:       sessionStorage.getItem('ch_game')       || 'Shadow Fight 4: Arena',
                bet_amount: parseInt(sessionStorage.getItem('ch_bet') || '10'),
                visibility: sessionStorage.getItem('ch_visibility') || 'public',
                rules: {
                    ...baseRules,
                    fighter:       sessionStorage.getItem('ch_fighter') || '',
                    allowed_chars: JSON.parse(sessionStorage.getItem('ch_allowed_chars') || '[]'),
                },
            });
        } catch {}
    }, []);

    const handleLaunch = () => {
        setLoading(true);
        setError('');
        router.post('/challenges', data, {
            onError: (errors) => {
                setError(Object.values(errors)[0] || 'Une erreur est survenue.');
                setLoading(false);
            },
            onSuccess: () => {
                sessionStorage.removeItem('ch_type');
                sessionStorage.removeItem('ch_game');
                sessionStorage.removeItem('ch_bet');
                sessionStorage.removeItem('ch_visibility');
                sessionStorage.removeItem('ch_rules');
            },
        });
    };

    return (
        <div className="flex justify-center min-h-screen" style={{ background: '#110808' }}>
            <div className="w-full max-w-[430px] min-h-screen flex flex-col" style={{ background: '#110808' }}>

                {/* Header */}
                <div className="flex items-center px-4 pt-4 pb-4">
                    <Link href="/challenge/create/5">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF7766" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="19" y1="12" x2="5" y2="12"/>
                            <polyline points="12 19 5 12 12 5"/>
                        </svg>
                    </Link>
                    <span className="flex-1 text-center text-[#FF7766] font-black text-base tracking-widest">RIVALBET</span>
                    <div className="w-6" />
                </div>

                <div className="px-4 mb-2">
                    <div className="flex justify-between mb-1">
                        <span className="text-[#FFAA88] text-[10px] tracking-widest font-semibold">ÉTAPE FINALE</span>
                        <span className="text-[#888888] text-[10px]">6/6</span>
                    </div>
                    <StepProgress current={6} total={6} />
                </div>

                <div className="px-4 mt-4 mb-5">
                    <h2 className="text-white font-black text-3xl mb-1">Validation</h2>
                    <p className="text-[#888888] text-sm">Dernière vérification avant l'ouverture du salon.</p>
                </div>

                {error && (
                    <div className="mx-4 mb-3 rounded-xl px-4 py-3" style={{ background: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.3)' }}>
                        <p className="text-[#FF3B30] text-sm">{error}</p>
                    </div>
                )}

                {/* Summary */}
                <div className="mx-4 rounded-2xl p-4 mb-3" style={{ background: '#1A0A0A' }}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[#FFAA88] font-bold text-sm tracking-wider">{data.type.toUpperCase()} CLASSIC</span>
                        <span className="text-[#CCCCCC] text-xs px-2 py-1 rounded-lg" style={{ background: '#2A1A1A' }}>
                            {data.visibility === 'public' ? 'Publique' : 'Privée'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm" style={{ borderTop: '1px solid #2A1A1A', paddingTop: 12, marginTop: 4 }}>
                        <span className="text-[#888888]">Jeu</span>
                        <span className="text-white font-bold">{data.game}</span>
                    </div>
                    {data.rules?.format && (
                        <div className="flex items-center justify-between text-sm mt-2">
                            <span className="text-[#888888]">Format</span>
                            <span className="text-white font-bold">{data.rules.format}</span>
                        </div>
                    )}
                </div>

                {/* Bet */}
                <div className="mx-4 rounded-2xl p-4 mb-3 flex flex-col items-center" style={{ background: '#1A0A0A' }}>
                    <p className="text-[#888888] text-[10px] tracking-widest font-semibold mb-1">MA MISE</p>
                    <p className="text-white font-black text-3xl mb-2">{data.bet_amount} RB</p>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5">
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                        <path d="M4 22h16"/>
                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
                    </svg>
                </div>

                {/* Launch */}
                <div className="px-4 pt-2" style={{ paddingBottom: '100px' }}>
                    <button onClick={handleLaunch} disabled={loading}
                        className="w-full rounded-2xl py-3 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                        style={{ background: '#FFAA88', color: '#1A0808' }}>
                        {loading ? (
                            <>
                                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                </svg>
                                Création...
                            </>
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <path d="M9 11l3 3L22 4"/>
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                                </svg>
                                LANCER LE DÉFI
                            </>
                        )}
                    </button>
                </div>
            <BottomNav />
            </div>
        </div>
    );
}
