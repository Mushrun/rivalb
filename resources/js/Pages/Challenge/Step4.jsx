import BottomNav from '../../Components/BottomNav';
import { useState } from 'react';
import { Link, router } from '@inertiajs/react';

const rules = [
    { key: 'combat', label: 'RÈGLES DE\nCOMBAT', value: 'COMBAT CLASSIQUE', info: true },
    { key: 'position', label: 'POSITION', value: 'FORÊT DE BAMBOUS', info: false },
    { key: 'heros', label: 'PARAMÈTRES\nDES HÉROS', value: 'NIVEAUX RÉELS', info: false },
    { key: 'duree', label: 'DURÉE\nDE\nMANCHE', value: '100 SEC', info: true },
];

const valueOptions = {
    combat: ['COMBAT CLASSIQUE', 'COMBAT RAPIDE', 'MODE TOURNOI'],
    position: ['FORÊT DE BAMBOUS', 'ARÈNE VOLCANIQUE', 'TEMPLE ANCIEN', 'ALÉATOIRE'],
    heros: ['NIVEAUX RÉELS', 'NIVEAUX MAX', 'NIVEAUX ÉGAUX'],
    duree: ['60 SEC', '90 SEC', '100 SEC', '120 SEC', '150 SEC'],
};

function StepProgress({ current, total }) {
    return (
        <div className="flex gap-1 w-full mb-6">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className="flex-1 h-0.5 rounded-full"
                    style={{ background: i < current ? '#FFAA88' : '#2A1A1A' }} />
            ))}
        </div>
    );
}

export default function ChallengeStep4() {
    const [values, setValues] = useState({
        combat: 'COMBAT CLASSIQUE',
        position: 'FORÊT DE BAMBOUS',
        heros: 'NIVEAUX RÉELS',
        duree: '100 SEC',
    });

    const cycle = (key, dir) => {
        const opts = valueOptions[key];
        const idx = opts.indexOf(values[key]);
        const next = (idx + dir + opts.length) % opts.length;
        setValues(v => ({ ...v, [key]: opts[next] }));
    };

    return (
        <div className="flex justify-center min-h-screen" style={{ background: '#110808' }}>
            <div className="w-full max-w-[430px] min-h-screen flex flex-col" style={{ background: '#110808' }}>

                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                    <Link href="/challenge/create/3">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="19" y1="12" x2="5" y2="12"/>
                            <polyline points="12 19 5 12 12 5"/>
                        </svg>
                    </Link>
                    <div className="text-center">
                        <p className="text-[#CCAAA0] text-sm font-semibold">Paramètres</p>
                        <p className="text-[#888888] text-[10px] tracking-widest">ÉTAPE 4 SUR 6</p>
                    </div>
                    <div className="w-6" />
                </div>

                <div className="px-4">
                    <StepProgress current={4} total={6} />
                </div>

                {/* Title */}
                <div className="px-4 mb-6">
                    <h2 className="text-white font-black text-2xl mb-1">Paramètres du combat</h2>
                    <p className="text-[#888888] text-sm leading-relaxed">
                        Définissez les règles strictes de cet affrontement. Ces paramètres sont définitifs une fois le défi lancé.
                    </p>
                </div>

                {/* Settings */}
                <div className="flex flex-col gap-2 px-4">
                    {rules.map(rule => (
                        <div key={rule.key}
                            className="flex items-center rounded-2xl px-4 py-4"
                            style={{ background: '#1A0A0A' }}>
                            <div className="flex-1">
                                <p className="text-[#888888] text-[10px] font-bold tracking-widest leading-tight whitespace-pre-line">
                                    {rule.label}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {rule.info && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <line x1="12" y1="8" x2="12" y2="12"/>
                                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                                    </svg>
                                )}
                                <button onClick={() => cycle(rule.key, -1)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCAAA0" strokeWidth="2.5" strokeLinecap="round">
                                        <polyline points="15 18 9 12 15 6"/>
                                    </svg>
                                </button>
                                <span className="text-white font-bold text-sm min-w-[120px] text-center">
                                    {values[rule.key]}
                                </span>
                                <button onClick={() => cycle(rule.key, 1)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCAAA0" strokeWidth="2.5" strokeLinecap="round">
                                        <polyline points="9 18 15 12 9 6"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex-1" />

                {/* Button */}
                <div className="px-4 pt-4" style={{ paddingBottom: '100px' }}>
                    <button
                        onClick={() => {
                            sessionStorage.setItem('ch_rules', JSON.stringify(values));
                            router.visit('/challenge/create/5');
                        }}
                        className="w-full rounded-2xl py-3 font-bold text-sm flex items-center justify-center gap-2"
                        style={{ background: '#FFAA88', color: '#1A0808' }}>
                        Étape Suivante <span className="text-lg">→</span>
                    </button>
                </div>
            <BottomNav />
            </div>
        </div>
    );
}
