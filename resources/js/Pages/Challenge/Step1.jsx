import BottomNav from '../../Components/BottomNav';
import { useState } from 'react';
import { Link, router } from '@inertiajs/react';

function StepProgress({ current, total }) {
    return (
        <div className="flex gap-1 px-4 mb-6">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className="flex-1 h-0.5 rounded-full"
                    style={{ background: i < current ? '#FF3B30' : '#2A2A2A' }} />
            ))}
        </div>
    );
}

export default function ChallengeStep1() {
    const [selected, setSelected] = useState('1v1');

    return (
        <div className="flex justify-center min-h-screen" style={{ background: '#0D0D0D' }}>
            <div className="w-full max-w-[430px] min-h-screen flex flex-col" style={{ background: '#0D0D0D' }}>

                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <button className="w-8 h-8 flex items-center justify-center" onClick={() => router.visit('/battle')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                    <span className="text-[#FF3B30] font-black text-base tracking-widest">CRÉER UN DÉFI</span>
                    <div className="w-8" />
                </div>

                {/* Step info */}
                <div className="flex items-center justify-between px-4 mb-2">
                    <span className="text-[#CCCCCC] text-sm font-medium">Étape 1 sur 6</span>
                    <span className="text-[#888888] text-xs font-semibold tracking-widest">TYPE</span>
                </div>

                <StepProgress current={1} total={6} />

                {/* Title */}
                <div className="px-4 mb-2">
                    <p className="text-[#CCCCCC] text-sm text-center mb-1">Choisir un type de défi</p>
                    <p className="text-[#888888] text-xs text-center">Sélectionnez le format de votre affrontement.</p>
                </div>

                {/* Options */}
                <div className="flex flex-col gap-3 px-4 mt-4">
                    {/* 1v1 */}
                    <button onClick={() => setSelected('1v1')}
                        className="w-full rounded-2xl p-4 text-left transition-all"
                        style={{
                            background: '#1A1A1A',
                            border: selected === '1v1' ? '2px solid #FF3B30' : '2px solid transparent',
                        }}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: selected === '1v1' ? 'rgba(255,59,48,0.2)' : '#2A2A2A' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        stroke={selected === '1v1' ? '#FF3B30' : '#888'} strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                        <circle cx="12" cy="7" r="4"/>
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm mb-1">Défi 1v1</p>
                                    <p className="text-[#888888] text-xs leading-relaxed">
                                        Tu choisis ton combattant et les adversaires autorisés. Celui qui accepte choisit un combattant parmi ta liste.
                                    </p>
                                </div>
                            </div>
                            <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                                style={{ border: `2px solid ${selected === '1v1' ? '#FF3B30' : '#555'}` }}>
                                {selected === '1v1' && (
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF3B30' }} />
                                )}
                            </div>
                        </div>
                    </button>

                    {/* 3v3 */}
                    <button onClick={() => setSelected('3v3')}
                        className="w-full rounded-2xl p-4 text-left transition-all"
                        style={{
                            background: '#1A1A1A',
                            border: selected === '3v3' ? '2px solid #FF3B30' : '2px solid transparent',
                        }}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: selected === '3v3' ? 'rgba(255,59,48,0.2)' : '#2A2A2A' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        stroke={selected === '3v3' ? '#FF3B30' : '#888'} strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm mb-1">Défi 3v3</p>
                                    <p className="text-[#888888] text-xs leading-relaxed">
                                        Tu choisis tes 3 combattants et les adversaires autorisés. Celui qui accepte choisit 3 combattants parmi ta liste.
                                    </p>
                                </div>
                            </div>
                            <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                                style={{ border: `2px solid ${selected === '3v3' ? '#FF3B30' : '#555'}` }}>
                                {selected === '3v3' && (
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF3B30' }} />
                                )}
                            </div>
                        </div>
                    </button>
                </div>

                <div className="flex-1" />

                {/* Button */}
                <div className="px-4" style={{ paddingBottom: '100px' }}>
                    <button
                        onClick={() => { sessionStorage.setItem('ch_type', selected); router.visit('/challenge/create/2'); }}
                        className="w-full rounded-2xl py-3 text-white font-bold text-sm flex items-center justify-center gap-2"
                        style={{ background: '#FF3B30' }}>
                        Continuer <span className="text-lg">→</span>
                    </button>
                </div>
            <BottomNav />
            </div>
        </div>
    );
}
