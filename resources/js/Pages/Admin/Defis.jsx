import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '../../Components/AdminLayout';

const statusColor = { ouvert: '#4CD964', 'en cours': '#FF9500', terminé: '#888', annulé: '#FF3B30' };
const statusBg    = { ouvert: 'rgba(76,217,100,0.12)', 'en cours': 'rgba(255,149,0,0.12)', terminé: 'rgba(136,136,136,0.12)', annulé: 'rgba(255,59,48,0.12)' };

export default function AdminDefis() {
    const { defis: initialDefis } = usePage().props;
    const [filter, setFilter] = useState('TOUS');

    const filtered = filter === 'TOUS'      ? initialDefis
        : filter === 'OUVERTS'   ? initialDefis.filter(d => d.status === 'ouvert')
        : filter === 'EN COURS'  ? initialDefis.filter(d => d.status === 'en_cours')
        : filter === 'TERMINÉS'  ? initialDefis.filter(d => d.status === 'termine')
        : initialDefis.filter(d => d.status === 'annule');

    const cancel = (id) => router.post(`/admin/defis/${id}/cancel`);

    return (
        <AdminLayout title="Défis">
            <div className="flex gap-3 mb-5">
                {[
                    { label: 'Ouverts',  value: initialDefis.filter(d => d.status === 'ouvert').length,   color: '#4CD964' },
                    { label: 'En cours', value: initialDefis.filter(d => d.status === 'en_cours').length, color: '#FF9500' },
                    { label: 'Terminés', value: initialDefis.filter(d => d.status === 'termine').length,  color: '#888' },
                    { label: 'Annulés',  value: initialDefis.filter(d => d.status === 'annule').length,   color: '#FF3B30' },
                ].map(s => (
                    <div key={s.label} className="flex-1 rounded-xl px-3 py-3 text-center" style={{ background: '#1A1A1A' }}>
                        <p className="font-black text-xl" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-[#666] text-[10px] mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
                {['TOUS', 'OUVERTS', 'EN COURS', 'TERMINÉS', 'ANNULÉS'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold"
                        style={{ background: filter === f ? '#FF3B30' : '#1A1A1A', color: filter === f ? '#FFF' : '#888' }}>
                        {f}
                    </button>
                ))}
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: '#1A1A1A' }}>
                <table className="w-full">
                    <thead>
                        <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                            {['ID', 'Créateur', 'Type', 'Mise', 'Statut', 'Date', 'Actions'].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-widest text-[#555]">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((d, i) => (
                            <tr key={d.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #1E1E1E' : 'none' }}>
                                <td className="px-4 py-3 text-[#555] text-sm">#{d.id}</td>
                                <td className="px-4 py-3 text-white font-semibold text-sm">{d.creator}</td>
                                <td className="px-4 py-3">
                                    <span className="text-xs font-bold px-2 py-1 rounded"
                                        style={{ background: 'rgba(255,59,48,0.1)', color: '#FF3B30' }}>{d.type}</span>
                                </td>
                                <td className="px-4 py-3 text-[#FFAA88] font-bold text-sm">{d.bet} RB</td>
                                <td className="px-4 py-3">
                                    <span className="text-xs font-bold px-2 py-1 rounded-lg"
                                        style={{ background: statusBg[d.status], color: statusColor[d.status] }}>
                                        {d.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-[#666] text-xs">{d.date}</td>
                                <td className="px-4 py-3">
                                    {d.status === 'ouvert' && (
                                        <button onClick={() => cancel(d.id)}
                                            className="px-2 py-1 rounded-lg text-[10px] font-semibold"
                                            style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}>
                                            Annuler
                                        </button>
                                    )}
                                    {d.status === 'en cours' && (
                                        <span className="text-[#FF9500] text-[10px] font-semibold">Match actif</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
