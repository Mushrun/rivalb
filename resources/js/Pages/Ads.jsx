import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '../Components/AppLayout';
import TopBar from '../Components/TopBar';

const statusLabel = {
    ouvert:    { label: 'EN ATTENTE',  color: '#FF3B30' },
    en_cours:  { label: 'EN COURS',    color: '#FF9500' },
    termine:   { label: 'TERMINÉ',     color: '#4CD964' },
    annule:    { label: 'ANNULÉ',      color: '#555555' },
};

export default function Ads() {
    const { myDefis = [] } = usePage().props;
    const [toDelete, setToDelete] = useState(null);

    const activeCount = myDefis.filter(d => d.status === 'ouvert').length;

    const handleCancel = (id) => {
        router.post(`/challenges/${id}/cancel`);
    };

    const handleReactivate = (id) => {
        router.post(`/challenges/${id}/reactivate`);
    };

    const handleDelete = (id) => {
        router.delete(`/challenges/${id}`, {}, {
            onSuccess: () => setToDelete(null),
        });
    };

    return (
        <AppLayout>
            <TopBar />

            <div className="px-4 mt-3">
                <div className="flex items-center justify-between mb-1">
                    <h1 className="text-white font-bold text-2xl">Mes Défis</h1>
                    <span className="text-[#888888] text-sm">{activeCount} ACTIFS</span>
                </div>
                <p className="text-[#555555] text-xs mb-4">Défis que tu as publiés et qui attendent un adversaire</p>

                <div className="flex flex-col gap-3">
                    {myDefis.length === 0 ? (
                        <div className="rounded-2xl p-8 flex flex-col items-center gap-2" style={{ background: '#1A1A1A' }}>
                            <p className="text-[#555] text-sm text-center">Tu n'as pas encore créé de défi.</p>
                        </div>
                    ) : (
                        myDefis.map(ad => {
                            const s = statusLabel[ad.status] ?? { label: ad.status, color: '#888' };
                            return (
                                <div key={ad.id} className="rounded-2xl p-4"
                                    style={{ background: '#1A1A1A', opacity: ad.status === 'annule' ? 0.7 : 1 }}>

                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="text-[#888888] text-[10px] tracking-wider font-semibold mb-1">DATE DU DÉFI</p>
                                            <div className="flex items-center gap-2">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                                </svg>
                                                <span className="text-white font-semibold text-sm">{ad.created_at}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[#888888] text-[10px] tracking-wider font-semibold mb-1">STATUT</p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                                                <span className="text-xs font-semibold" style={{ color: s.color }}>{s.label}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[#888888] text-[10px] tracking-wider font-semibold mb-0.5">MISE TOTALE</p>
                                            <p className="font-black text-2xl" style={{ color: ad.status === 'annule' ? '#888888' : '#FF3B30' }}>
                                                {ad.bet_amount} RB
                                            </p>
                                        </div>

                                        {ad.status === 'annule' ? (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleReactivate(ad.id)}
                                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs tracking-wider"
                                                    style={{ background: 'rgba(76,217,100,0.1)', color: '#4CD964', border: '1px solid rgba(76,217,100,0.25)' }}>
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                        <polyline points="23 4 23 10 17 10"/>
                                                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                                                    </svg>
                                                    RÉACTIVER
                                                </button>
                                                <button onClick={() => setToDelete(ad.id)}
                                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs tracking-wider"
                                                    style={{ background: 'rgba(255,59,48,0.1)', color: '#FF3B30', border: '1px solid rgba(255,59,48,0.25)' }}>
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                        <polyline points="3 6 5 6 21 6"/>
                                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                                    </svg>
                                                    SUPPRIMER
                                                </button>
                                            </div>
                                        ) : ad.can_cancel ? (
                                            <button onClick={() => handleCancel(ad.id)}
                                                className="px-4 py-2 rounded-xl text-white font-semibold text-xs tracking-wider"
                                                style={{ border: '1px solid #3A3A3A', background: 'transparent' }}>
                                                ANNULER
                                            </button>
                                        ) : ad.status === 'en_cours' && ad.match_id ? (
                                            <Link href={`/match/${ad.match_id}`}
                                                className="px-4 py-2 rounded-xl font-semibold text-xs tracking-wider flex items-center gap-1.5"
                                                style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30', border: '1px solid rgba(255,59,48,0.3)' }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                    <polygon points="5 3 19 12 5 21 5 3"/>
                                                </svg>
                                                MATCH
                                            </Link>
                                        ) : (
                                            <Link href={`/defis/${ad.id}`}
                                                className="px-4 py-2 rounded-xl font-semibold text-xs tracking-wider"
                                                style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30', border: '1px solid rgba(255,59,48,0.3)' }}>
                                                VOIR
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* FAB */}
            <Link href="/challenge/create/1"
                className="fixed bottom-24 right-1/2 translate-x-[175px] w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-40"
                style={{ background: '#FF3B30' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
            </Link>

            {/* Modal suppression */}
            {toDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ background: 'rgba(0,0,0,0.75)' }}
                    onClick={() => setToDelete(null)}>
                    <div className="w-full max-w-[430px] rounded-2xl p-6 flex flex-col gap-4"
                        style={{ background: '#1A1A1A' }}
                        onClick={e => e.stopPropagation()}>
                        <div className="flex justify-center">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center"
                                style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)' }}>
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                </svg>
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-white font-bold text-lg mb-1">Supprimer le défi ?</h3>
                            <p className="text-[#888888] text-sm leading-relaxed">
                                Le défi sera définitivement supprimé de ton historique.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setToDelete(null)}
                                className="flex-1 py-2.5 rounded-xl font-semibold text-xs text-white"
                                style={{ border: '1px solid #3A3A3A', background: 'transparent' }}>
                                Annuler
                            </button>
                            <button onClick={() => handleDelete(toDelete)}
                                className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white"
                                style={{ background: '#FF3B30' }}>
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
