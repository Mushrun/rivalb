import BottomNav from '../../Components/BottomNav';
import { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import FIGHTERS from '../../data/fighters';

const VISIBLE_DEFAULT = 9;

function StepProgress({ current, total }) {
    return (
        <div className="flex gap-1 px-4 mb-4">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className="flex-1 h-0.5 rounded-full"
                    style={{ background: i < current ? '#FF3B30' : '#2A2A2A' }} />
            ))}
        </div>
    );
}

export default function ChallengeStep2() {
    const { t } = useTranslation();
    const { activeFighters = [] } = usePage().props;

    // Si la DB a des fighters actifs, on filtre — sinon on affiche tout
    const characters = activeFighters.length > 0
        ? FIGHTERS.filter(f => activeFighters.includes(f.name))
        : FIGHTERS;

    const [type,     setType]     = useState('1v1');
    const [selected, setSelected] = useState(new Set());
    const [showAll,  setShowAll]  = useState(false);

    useEffect(() => {
        setType(sessionStorage.getItem('ch_type') || '1v1');
    }, []);

    const maxSelect = type === '3v3' ? 3 : 1;
    const visible   = showAll ? characters : characters.slice(0, VISIBLE_DEFAULT);
    const isReady   = selected.size === maxSelect;

    const toggle = (id) => {
        const next = new Set(selected);
        if (next.has(id)) {
            next.delete(id);
        } else {
            if (next.size >= maxSelect) {
                if (maxSelect === 1) next.clear();
                else return;
            }
            next.add(id);
        }
        setSelected(next);
    };

    const handleNext = () => {
        const names = characters.filter(c => selected.has(c.id)).map(c => c.name);
        sessionStorage.setItem('ch_fighter', names.join(', '));
        sessionStorage.setItem('ch_game', 'Shadow Fight 4: Arena');
        router.visit('/challenge/create/3');
    };

    return (
        <div className="flex justify-center min-h-screen" style={{ background: '#110808' }}>
            <div className="w-full max-w-[430px] min-h-screen flex flex-col" style={{ background: '#110808' }}>

                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                    <Link href="/challenge/create/1">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center"
                            style={{ background: '#2A1A1A' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="19" y1="12" x2="5" y2="12"/>
                                <polyline points="12 19 5 12 12 5"/>
                            </svg>
                        </div>
                    </Link>
                    <div className="text-center">
                        <p className="text-[#888888] text-[10px] tracking-widest font-semibold">{t('challenge.step_indicator', { step: 2, total: 6 })}</p>
                        <p className="text-white font-bold text-sm">
                            {type === '3v3' ? t('challenge.fighters_3v3') : t('challenge.fighter_1v1')}
                        </p>
                    </div>
                    <div className="w-9" />
                </div>

                <StepProgress current={2} total={6} />

                {/* Title */}
                <div className="px-4 flex items-start justify-between mb-5">
                    <div>
                        <h2 className="text-white font-black text-3xl leading-tight">
                            {type === '3v3' ? t('challenge.choose_fighters_3v3') : t('challenge.choose_fighter_1v1')}
                        </h2>
                    </div>
                    <div className="text-right">
                        <p className="text-[#888888] text-xs tracking-wider">{t('challenge.format_prefix')} {type.toUpperCase()}</p>
                        <span className="px-2.5 py-1 rounded-lg text-white font-semibold text-xs"
                            style={{ background: '#3A1A1A', color: isReady ? '#4CD964' : '#FFAA99' }}>
                            {t('challenge.selected_count', { n: selected.size, max: maxSelect })}
                        </span>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-3 gap-2 px-4">
                    {visible.map(char => {
                        const isSelected = selected.has(char.id);
                        // En 1v1 on peut toujours changer de sélection, en 3v3 on bloque après 3
                        const isDisabled = !isSelected && selected.size >= maxSelect && maxSelect > 1;
                        return (
                            <button key={char.id}
                                onClick={() => toggle(char.id)}
                                disabled={isDisabled}
                                className="relative rounded-2xl overflow-hidden flex flex-col items-end justify-end transition-all disabled:opacity-30"
                                style={{
                                    aspectRatio: '1',
                                    border: isSelected ? '2px solid #FF3B30' : '2px solid #2A1A1A',
                                    background: '#1A0A0A',
                                }}>
                                <img src={char.img} alt={char.name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    style={{ opacity: isDisabled ? 0.4 : 1 }} />
                                <div className="absolute inset-0"
                                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }} />
                                {isSelected && (
                                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center z-10"
                                        style={{ background: '#FF3B30' }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    </div>
                                )}
                                <span className="relative z-10 text-white font-bold text-[8px] tracking-wider pb-1.5 px-1.5 leading-tight text-center w-full">
                                    {char.name}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Voir plus / Voir moins */}
                <button onClick={() => setShowAll(v => !v)}
                    className="mx-4 mt-3 rounded-2xl py-2.5 flex items-center justify-center gap-2"
                    style={{ background: '#1A0A0A', border: '1px solid #2A1A1A' }}>
                    <span className="text-[#CCCCCC] text-xs font-semibold">
                        {showAll ? t('challenge.see_less') : t('challenge.see_more', { n: characters.length - VISIBLE_DEFAULT })}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="2.5" strokeLinecap="round"
                        style={{ transform: showAll ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </button>

                <div className="flex-1" />

                {/* Button */}
                <div className="px-4 pt-3" style={{ paddingBottom: '100px' }}>
                    <button
                        disabled={!isReady}
                        onClick={handleNext}
                        className="w-full rounded-2xl py-3 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                        style={{ background: '#FF3B30' }}>
                        {t('challenge.validate_selection')} <span className="text-lg">→</span>
                    </button>
                </div>
            <BottomNav />
            </div>
        </div>
    );
}
