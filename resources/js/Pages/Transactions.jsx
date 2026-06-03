import { useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../Components/AppLayout';

const transactions = [
    { id: 1, type: 'recharge', label: 'Recharge', date: '12 Mars, 14:05', amount: '+200 RB', method: 'Mobile Money' },
    { id: 2, type: 'retrait',  label: 'Retrait',  date: '11 Mars, 18:30', amount: '-150 RB', method: 'Mobile Money' },
    { id: 3, type: 'recharge', label: 'Recharge', date: '10 Mars, 09:12', amount: '+500 RB', method: 'Mobile Money' },
    { id: 4, type: 'retrait',  label: 'Retrait',  date: '08 Mars, 21:45', amount: '-80 RB',  method: 'Mobile Money' },
    { id: 5, type: 'recharge', label: 'Recharge', date: '05 Mars, 11:00', amount: '+100 RB', method: 'Mobile Money' },
    { id: 6, type: 'retrait',  label: 'Retrait',  date: '02 Mars, 16:20', amount: '-50 RB',  method: 'Mobile Money' },
];

export default function Transactions() {
    const [filter, setFilter] = useState('TOUT');

    const filtered = filter === 'TOUT' ? transactions
        : filter === 'RECHARGES' ? transactions.filter(t => t.type === 'recharge')
        : transactions.filter(t => t.type === 'retrait');

    const totalRB = transactions.reduce((sum, t) => {
        const val = parseInt(t.amount.replace(/[^0-9-]/g, ''));
        return sum + val;
    }, 0);

    return (
        <AppLayout>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                <Link href="/profil">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="19" y1="12" x2="5" y2="12"/>
                        <polyline points="12 19 5 12 12 5"/>
                    </svg>
                </Link>
                <h1 className="text-white font-bold text-lg">Historique de transactions</h1>
            </div>

            {/* Solde actuel */}
            <div className="mx-4 mt-3 rounded-2xl p-4 flex items-center justify-between"
                style={{ background: '#1A1A1A' }}>
                <div>
                    <p className="text-[#888888] text-xs mb-1">Solde actuel</p>
                    <p className="text-white font-black text-2xl">{totalRB} RB</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/battle"
                        className="px-4 py-2 rounded-xl text-white font-semibold text-xs"
                        style={{ background: '#FF3B30' }}>
                        RECHARGER
                    </Link>
                    <button className="px-4 py-2 rounded-xl text-white font-semibold text-xs"
                        style={{ border: '1px solid #2A2A2A', background: 'transparent' }}>
                        RETIRER
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 px-4 mt-4 mb-3">
                {['TOUT', 'RECHARGES', 'RETRAITS'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
                        style={filter === f
                            ? { background: '#FF3B30', color: '#FFF' }
                            : { background: '#1A1A1A', color: '#888888', border: '1px solid #2A2A2A' }}>
                        {f}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="flex flex-col gap-2 px-4">
                {filtered.map(tx => (
                    <div key={tx.id}
                        className="flex items-center gap-3 rounded-2xl p-4"
                        style={{ background: '#1A1A1A' }}>

                        {/* Icon */}
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: tx.type === 'recharge' ? 'rgba(76,217,100,0.1)' : 'rgba(255,59,48,0.1)' }}>
                            {tx.type === 'recharge' ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4CD964" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="12" y1="19" x2="12" y2="5"/>
                                    <polyline points="5 12 12 5 19 12"/>
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                    <polyline points="19 12 12 19 5 12"/>
                                </svg>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <p className="text-white font-semibold text-sm">{tx.label}</p>
                            <p className="text-[#666666] text-xs mt-0.5">{tx.method} · {tx.date}</p>
                        </div>

                        {/* Amount */}
                        <span className="font-bold text-sm"
                            style={{ color: tx.type === 'recharge' ? '#4CD964' : '#FF3B30' }}>
                            {tx.amount}
                        </span>
                    </div>
                ))}
            </div>
        </AppLayout>
    );
}
