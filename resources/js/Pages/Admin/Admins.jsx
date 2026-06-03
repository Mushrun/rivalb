import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '../../Components/AdminLayout';

const roleLabel = { super_admin: 'Super Admin', moderator: 'Modérateur', support: 'Support' };
const roleColor = { super_admin: '#FF3B30', moderator: '#FF9500', support: '#4CD964' };
const roleBg    = { super_admin: 'rgba(255,59,48,0.12)', moderator: 'rgba(255,149,0,0.12)', support: 'rgba(76,217,100,0.12)' };

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

export default function AdminAdmins() {
    const { admins: initialAdmins } = usePage().props;
    const admins = initialAdmins ?? [];

    const [showAdd, setShowAdd]     = useState(false);
    const [confirmId, setConfirmId] = useState(null);
    const [showPwd, setShowPwd]     = useState(false);
    const [form, setForm]           = useState({ name: '', email: '', password: '', role: 'moderator' });
    const [errors, setErrors]       = useState({});

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Nom requis';
        if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide';
        if (form.password.length < 8) e.password = 'Minimum 8 caractères';
        return e;
    };

    const addAdmin = () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        router.post('/admin/admins', form, {
            onSuccess: () => { setShowAdd(false); setForm({ name: '', email: '', password: '', role: 'moderator' }); setErrors({}); },
            onError: (err) => setErrors(err),
        });
    };

    const toggle = (id) => {
        router.post(`/admin/admins/${id}/toggle`, {}, { preserveScroll: true });
    };

    const remove = (id) => {
        router.delete(`/admin/admins/${id}`, { preserveScroll: true });
        setConfirmId(null);
    };

    const toDelete = admins.find(a => a.id === confirmId);

    return (
        <AdminLayout title="Administrateurs">

            {/* Stats */}
            <div className="flex gap-3 mb-5">
                {[
                    { label: 'Total',       value: admins.length,                                        color: '#FFF' },
                    { label: 'Actifs',      value: admins.filter(a => a.is_active).length,               color: '#4CD964' },
                    { label: 'Modérateurs', value: admins.filter(a => a.role === 'moderator').length,    color: '#FF9500' },
                    { label: 'Support',     value: admins.filter(a => a.role === 'support').length,      color: '#4CD964' },
                ].map(s => (
                    <div key={s.label} className="flex-1 rounded-xl px-3 py-3 text-center" style={{ background: '#1A1A1A' }}>
                        <p className="font-black text-xl" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-[#666] text-[10px] mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-[#555] text-xs">{admins.length} administrateur{admins.length > 1 ? 's' : ''}</p>
                <button onClick={() => { setShowAdd(true); setErrors({}); setForm({ name: '', email: '', password: '', role: 'moderator' }); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                    style={{ background: '#FF3B30', color: '#FFF' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Ajouter un admin
                </button>
            </div>

            {/* Liste */}
            <div className="flex flex-col gap-3">
                {admins.map(a => (
                    <div key={a.id} className="rounded-2xl p-4 flex items-center gap-3"
                        style={{ background: '#1A1A1A', opacity: a.is_active ? 1 : 0.55 }}>

                        <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0"
                            style={{ background: (roleBg[a.role] ?? roleBg.support), color: (roleColor[a.role] ?? roleColor.support) }}>
                            {a.name[0]}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <p className="text-white font-bold text-sm">{a.name}</p>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded"
                                    style={{ background: roleBg[a.role] ?? roleBg.support, color: roleColor[a.role] ?? roleColor.support }}>
                                    {roleLabel[a.role] ?? a.role}
                                </span>
                                {!a.is_active && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded"
                                        style={{ background: 'rgba(136,136,136,0.12)', color: '#555' }}>
                                        INACTIF
                                    </span>
                                )}
                            </div>
                            <p className="text-[#555] text-xs truncate">{a.email}</p>
                            <p className="text-[#444] text-[10px] mt-0.5">Ajouté le {a.created_at}</p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                            {a.role !== 'super_admin' ? (
                                <>
                                    <button onClick={() => toggle(a.id)}
                                        className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
                                        style={{ background: a.is_active ? '#4CD964' : '#2A2A2A' }}>
                                        <span className="absolute top-0.5 w-4 h-4 rounded-full"
                                            style={{
                                                background: '#FFF',
                                                left: a.is_active ? '22px' : '2px',
                                                transition: 'left 0.15s',
                                                position: 'absolute',
                                            }} />
                                    </button>
                                    <button onClick={() => setConfirmId(a.id)}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                                        style={{ background: 'rgba(255,59,48,0.1)' }}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round">
                                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                                            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                                        </svg>
                                    </button>
                                </>
                            ) : (
                                <span className="text-[#333] text-[10px] font-semibold">Protégé</span>
                            )}
                        </div>
                    </div>
                ))}
                {admins.length === 0 && (
                    <p className="text-center text-[#555] text-sm py-8">Aucun administrateur.</p>
                )}
            </div>

            {/* Modal ajout */}
            {showAdd && (
                <Modal title="Ajouter un administrateur" onClose={() => setShowAdd(false)}>
                    <div className="flex flex-col gap-4">

                        <div>
                            <label className="text-[#888] text-xs font-semibold tracking-wider block mb-2">NOM COMPLET</label>
                            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                placeholder="Ex : Jean Dupont"
                                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                                style={{ background: '#0D0D0D', border: `1px solid ${errors.name ? '#FF3B30' : '#2A2A2A'}` }} />
                            {errors.name && <p className="text-[#FF3B30] text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="text-[#888] text-xs font-semibold tracking-wider block mb-2">EMAIL</label>
                            <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                placeholder="admin@rivalbet.com" type="email"
                                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                                style={{ background: '#0D0D0D', border: `1px solid ${errors.email ? '#FF3B30' : '#2A2A2A'}` }} />
                            {errors.email && <p className="text-[#FF3B30] text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="text-[#888] text-xs font-semibold tracking-wider block mb-2">MOT DE PASSE</label>
                            <div className="relative">
                                <input value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    placeholder="••••••••" type={showPwd ? 'text' : 'password'}
                                    className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none pr-11"
                                    style={{ background: '#0D0D0D', border: `1px solid ${errors.password ? '#FF3B30' : '#2A2A2A'}` }} />
                                <button type="button" onClick={() => setShowPwd(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round">
                                        {showPwd
                                            ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                                            : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                                        }
                                    </svg>
                                </button>
                            </div>
                            {errors.password && <p className="text-[#FF3B30] text-xs mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="text-[#888] text-xs font-semibold tracking-wider block mb-2">RÔLE</label>
                            <div className="flex gap-2">
                                {['moderator', 'support'].map(r => (
                                    <button key={r} onClick={() => setForm(p => ({ ...p, role: r }))}
                                        className="flex-1 py-2.5 rounded-xl text-xs font-bold"
                                        style={{
                                            background: form.role === r ? roleBg[r] : '#0D0D0D',
                                            color: form.role === r ? roleColor[r] : '#555',
                                            border: `1px solid ${form.role === r ? roleColor[r] + '44' : '#2A2A2A'}`,
                                        }}>
                                        {roleLabel[r]}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[#444] text-[10px] mt-2">
                                {form.role === 'moderator' ? 'Accès complet sauf gestion des admins.' : 'Accès litiges et support uniquement.'}
                            </p>
                        </div>

                        <div className="flex gap-3 mt-1">
                            <button onClick={() => setShowAdd(false)}
                                className="flex-1 py-3 rounded-xl font-bold text-sm"
                                style={{ background: '#2A2A2A', color: '#888' }}>
                                Annuler
                            </button>
                            <button onClick={addAdmin}
                                className="flex-1 py-3 rounded-xl font-bold text-sm"
                                style={{ background: '#FF3B30', color: '#FFF' }}>
                                Créer l'admin
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal confirmation suppression */}
            {confirmId && toDelete && (
                <Modal title="Supprimer cet administrateur ?" onClose={() => setConfirmId(null)}>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#0D0D0D' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base"
                                style={{ background: roleBg[toDelete.role] ?? roleBg.support, color: roleColor[toDelete.role] ?? roleColor.support }}>
                                {toDelete.name[0]}
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">{toDelete.name}</p>
                                <p className="text-[#555] text-xs">{toDelete.email}</p>
                            </div>
                        </div>
                        <p className="text-[#888] text-sm">Cet administrateur perdra immédiatement l'accès au backoffice.</p>
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
