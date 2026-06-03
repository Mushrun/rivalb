import BottomNav from '../../Components/BottomNav';
import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import FIGHTERS from '../../data/fighters';

const characters = FIGHTERS;

function StepProgress({ current, total }) {
    return (
        <div className="flex gap-1 w-full mb-6">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className="flex-1 h-0.5 rounded-full"
                    style={{ background: i < current ? '#FF3B30' : '#2A2A2A' }} />
            ))}
        </div>
    );
}

export default function ChallengeStep3() {
    const [selected, setSelected] = useState(new Set());

    const toggle = (id) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelected(next);
    };

    const allSelected = selected.size === characters.length;
    const selectAll = () => setSelected(new Set(characters.map(c => c.id)));
    const deselectAll = () => setSelected(new Set());

    return (
        <div className="flex justify-center min-h-screen" style={{ background: '#110808' }}>
            <div className="w-full max-w-[430px] min-h-screen flex flex-col px-4" style={{ background: '#110808' }}>

                {/* Header */}
                <div className="flex items-center justify-between pt-4 pb-3">
                    <Link href="/challenge/create/2">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="19" y1="12" x2="5" y2="12"/>
                            <polyline points="12 19 5 12 12 5"/>
                        </svg>
                    </Link>
                    <div className="text-center">
                        <p className="text-[#888888] text-[10px] tracking-widest font-semibold">ÉTAPE 3/6</p>
                    </div>
                    <div className="w-9" />
                </div>

                <StepProgress current={3} total={6} />

                {/* Title */}
                <h2 className="text-white font-black text-3xl leading-tight mb-2">
                    Quels adversaires<br/>acceptes-tu?
                </h2>
                <p className="text-[#888888] text-sm mb-5">
                    Choisis les personnages que ton adversaire pourra utiliser.
                </p>

                {/* Counter + Select all */}
                <div className="flex items-center gap-3 rounded-2xl px-4 py-3.5 mb-4"
                    style={{ background: '#1A0A0A' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: '#2A1A1A' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CCAAAA" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                    </div>
                    <div className="flex-1">
                        <span className="text-white font-bold text-sm">{selected.size} / TOUS</span>
                        <p className="text-[#888888] text-xs">personnages autorisés</p>
                    </div>
                    <button onClick={allSelected ? deselectAll : selectAll}
                        className="px-3 py-2 rounded-xl text-xs font-bold"
                        style={{
                            border: '1px solid #3A2A2A',
                            background: allSelected ? '#3A1A1A' : 'transparent',
                            color: allSelected ? '#FF7766' : '#FFFFFF',
                        }}>
                        {allSelected ? 'TOUT DÉCOCHER' : 'TOUT COCHER'}
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-3 gap-2">
                    {characters.map(char => {
                        const isSelected = selected.has(char.id);
                        return (
                            <button key={char.id}
                                onClick={() => toggle(char.id)}
                                className="relative rounded-2xl overflow-hidden transition-all"
                                style={{
                                    aspectRatio: '1',
                                    background: '#1A0808',
                                    border: isSelected ? '2px solid #FFAA88' : '2px solid #2A1A1A',
                                }}>
                                <img src={char.img} alt={char.name}
                                    className="absolute inset-0 w-full h-full object-cover" />
                                <div className="absolute inset-0"
                                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }} />
                                {isSelected && (
                                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center z-10"
                                        style={{ background: '#FFAA88' }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1A0808" strokeWidth="3" strokeLinecap="round">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    </div>
                                )}
                                <span className="absolute bottom-1.5 left-0 right-0 z-10 text-white font-bold text-[8px] tracking-wider text-center px-1">{char.name}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex-1" />

                {/* Button */}
                <div className="pt-4" style={{ paddingBottom: '100px' }}>
                    <button
                        onClick={() => {
                            const allowed = characters.filter(c => selected.has(c.id)).map(c => c.name);
                            sessionStorage.setItem('ch_allowed_chars', JSON.stringify(allowed));
                            router.visit('/challenge/create/4');
                        }}
                        className="w-full rounded-2xl py-3 text-[#1A0808] font-bold text-sm flex items-center justify-center gap-2"
                        style={{ background: '#FFAA88' }}>
                        Continuer <span className="text-lg">→</span>
                    </button>
                </div>
            <BottomNav />
            </div>
        </div>
    );
}
