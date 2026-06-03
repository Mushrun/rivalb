import { useState, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '../../Components/AdminLayout';

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)' }} onClick={onClose}>
            <div className="w-full max-w-md rounded-2xl p-5" style={{ background: '#1A1A1A' }}
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-white font-bold text-base">{title}</h3>
                    <button onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

function Avatar({ name }) {
    return (
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #FF3B30, #FF6B30)' }}>
            {name[0]}
        </div>
    );
}

export default function AdminCombattants() {
    const { fighters: initialFighters } = usePage().props;
    const [filter, setFilter]       = useState('TOUS');
    const [search, setSearch]       = useState('');
    const [showAdd, setShowAdd]     = useState(false);
    const [newName, setNewName]     = useState('');
    const [newImage, setNewImage]   = useState(null);
    const [preview, setPreview]     = useState(null);
    const [confirmId, setConfirmId] = useState(null);
    const fileRef = useRef();

    const toggle = (id) => router.post(`/admin/combattants/${id}/toggle`);

    const remove = (id) => {
        router.delete(`/admin/combattants/${id}`);
        setConfirmId(null);
    };

    const handleImage = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setNewImage(f);
        setPreview(URL.createObjectURL(f));
    };

    const addFighter = () => {
        if (!newName.trim()) return;
        router.post('/admin/combattants', { name: newName.trim(), image: newImage }, {
            forceFormData: true,
            onSuccess: () => { setNewName(''); setNewImage(null); setPreview(null); setShowAdd(false); },
        });
    };

    const displayed = initialFighters.filter(f => {
        const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'TOUS' ? true : filter === 'ACTIFS' ? f.actif : !f.actif;
        return matchSearch && matchFilter;
    });

    const toDelete = initialFighters.find(f => f.id === confirmId);

    return (
        <AdminLayout title="Combattants">

            {/* Stats */}
            <div className="flex gap-3 mb-5">
                {[
                    { label: 'Total',    value: initialFighters.length,                       color: '#FFF' },
                    { label: 'Actifs',   value: initialFighters.filter(f => f.actif).length,  color: '#4CD964' },
                    { label: 'Inactifs', value: initialFighters.filter(f => !f.actif).length, color: '#FF3B30' },
                ].map(s => (
                    <div key={s.label} className="flex-1 rounded-xl px-3 py-3 text-center" style={{ background: '#1A1A1A' }}>
                        <p className="font-black text-xl" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-[#666] text-[10px] mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher un combattant..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-white text-sm outline-none"
                        style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }} />
                </div>
                <div className="flex gap-2 items-center">
                    {['TOUS', 'ACTIFS', 'INACTIFS'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className="px-3 py-2 rounded-xl text-xs font-semibold"
                            style={{ background: filter === f ? '#FF3B30' : '#1A1A1A', color: filter === f ? '#FFF' : '#888' }}>
                            {f}
                        </button>
                    ))}
                    <button onClick={() => setShowAdd(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                        style={{ background: '#FF3B30', color: '#FFF' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Ajouter
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {displayed.map(f => (
                    <div key={f.id} className="rounded-2xl p-4 flex items-center gap-3"
                        style={{ background: '#1A1A1A', opacity: f.actif ? 1 : 0.6 }}>
                        {f.image_path ? (
                            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                                <img src={f.image_path} alt={f.name} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <Avatar name={f.name} />
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-sm truncate">{f.name}</p>
                            <p className="text-[#555] text-xs truncate">{f.game}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Toggle switch */}
                            <button onClick={() => toggle(f.id)}
                                className="relative w-10 h-5 rounded-full transition-colors"
                                style={{ background: f.actif ? '#4CD964' : '#2A2A2A' }}>
                                <span className="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
                                    style={{
                                        background: '#FFF',
                                        left: f.actif ? '22px' : '2px',
                                        transition: 'left 0.15s',
                                    }} />
                            </button>
                            {/* Delete */}
                            <button onClick={() => setConfirmId(f.id)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center"
                                style={{ background: 'rgba(255,59,48,0.1)' }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round">
                                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}

                {displayed.length === 0 && (
                    <div className="col-span-3 text-center py-12 text-[#555] text-sm">
                        Aucun combattant trouvé
                    </div>
                )}
            </div>

            {/* Modal ajout */}
            {showAdd && (
                <Modal title="Ajouter un combattant" onClose={() => { setShowAdd(false); setNewName(''); setNewImage(null); setPreview(null); }}>
                    <div className="flex flex-col gap-4">
                        {/* Image upload */}
                        <div>
                            <label className="text-[#888] text-xs font-semibold tracking-wider block mb-2">IMAGE</label>
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                            <button onClick={() => fileRef.current.click()}
                                className="w-full rounded-xl overflow-hidden flex items-center justify-center"
                                style={{ background: '#0D0D0D', border: '1px solid #2A2A2A', height: '120px' }}>
                                {preview ? (
                                    <img src={preview} alt="preview" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5">
                                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                                            <circle cx="8.5" cy="8.5" r="1.5"/>
                                            <polyline points="21 15 16 10 5 21"/>
                                        </svg>
                                        <span className="text-[#555] text-xs">Cliquer pour ajouter une image</span>
                                    </div>
                                )}
                            </button>
                        </div>
                        <div>
                            <label className="text-[#888] text-xs font-semibold tracking-wider block mb-2">NOM DU COMBATTANT</label>
                            <input value={newName} onChange={e => setNewName(e.target.value)}
                                placeholder="Ex : TITAN"
                                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                                style={{ background: '#0D0D0D', border: '1px solid #2A2A2A' }}
                                onKeyDown={e => e.key === 'Enter' && addFighter()} />
                        </div>
                        <div>
                            <label className="text-[#888] text-xs font-semibold tracking-wider block mb-2">JEU</label>
                            <div className="w-full px-4 py-3 rounded-xl text-[#888] text-sm"
                                style={{ background: '#0D0D0D', border: '1px solid #2A2A2A' }}>
                                Shadow Fight 4: Arena
                            </div>
                        </div>
                        <div className="flex gap-3 mt-1">
                            <button onClick={() => setShowAdd(false)}
                                className="flex-1 py-3 rounded-xl font-bold text-sm"
                                style={{ background: '#2A2A2A', color: '#888' }}>
                                Annuler
                            </button>
                            <button onClick={addFighter} disabled={!newName.trim()}
                                className="flex-1 py-3 rounded-xl font-bold text-sm"
                                style={{ background: newName.trim() ? '#FF3B30' : '#333', color: newName.trim() ? '#FFF' : '#555' }}>
                                Ajouter
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal confirmation suppression */}
            {confirmId && toDelete && (
                <Modal title="Supprimer ce combattant ?" onClose={() => setConfirmId(null)}>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#0D0D0D' }}>
                            <Avatar name={toDelete.name} />
                            <div>
                                <p className="text-white font-bold text-sm">{toDelete.name}</p>
                                <p className="text-[#555] text-xs">{toDelete.game}</p>
                            </div>
                        </div>
                        <p className="text-[#888] text-sm">
                            Ce combattant sera retiré de la liste et ne pourra plus être sélectionné dans les défis.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmId(null)}
                                className="flex-1 py-3 rounded-xl font-bold text-sm"
                                style={{ background: '#2A2A2A', color: '#888' }}>
                                Annuler
                            </button>
                            <button onClick={() => remove(confirmId)}
                                className="flex-1 py-3 rounded-xl font-bold text-sm"
                                style={{ background: '#FF3B30', color: '#FFF' }}>
                                Supprimer
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </AdminLayout>
    );
}
