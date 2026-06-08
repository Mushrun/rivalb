import { useState, useRef } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppLayout from '../Components/AppLayout';
import TopBar from '../Components/TopBar';
import { useMetaMask } from '../hooks/useMetaMask';
import { resolveMediaUrl } from '../utils/media';

function Section({ title, children }) {
    return (
        <div className="mb-5">
            <p className="text-[#555] text-[10px] font-bold tracking-widest px-4 mb-2">{title}</p>
            <div className="mx-4 rounded-2xl overflow-hidden" style={{ background: '#1A1A1A' }}>
                {children}
            </div>
        </div>
    );
}

function Row({ icon, label, value, onClick, danger, toggle, toggled, onToggle, last }) {
    return (
        <button onClick={toggle ? onToggle : onClick}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-opacity active:opacity-70"
            style={{ borderBottom: last ? 'none' : '1px solid #2A2A2A' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: danger ? 'rgba(255,59,48,0.1)' : '#2A2A2A' }}>
                {icon}
            </div>
            <span className="flex-1 text-sm font-medium" style={{ color: danger ? '#FF3B30' : '#FFFFFF' }}>
                {label}
            </span>
            {toggle ? (
                <div className="w-11 h-6 rounded-full relative transition-colors"
                    style={{ background: toggled ? '#FF3B30' : '#3A3A3A' }}>
                    <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                        style={{ left: toggled ? '24px' : '4px' }} />
                </div>
            ) : value ? (
                <span className="text-[#666] text-xs mr-1">{value}</span>
            ) : null}
            {!toggle && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6"/>
                </svg>
            )}
        </button>
    );
}

/* ── Modals ── */
function ModalPseudo({ currentUsername, onClose }) {
    const [value,   setValue]   = useState(currentUsername ?? '');
    const [saving,  setSaving]  = useState(false);
    const [error,   setError]   = useState('');

    const save = () => {
        if (!value.trim() || saving) return;
        setSaving(true);
        router.post('/profil/update', { username: value.trim() }, {
            onSuccess: () => onClose(),
            onError:   (errs) => { setError(errs.username ?? 'Erreur.'); setSaving(false); },
            onFinish:  () => setSaving(false),
        });
    };

    return (
        <Modal title="Changer de pseudo" onClose={onClose}>
            <input value={value} onChange={e => { setValue(e.target.value); setError(''); }}
                className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none mb-1"
                style={{ background: '#0D0D0D', border: `1px solid ${error ? '#FF3B30' : '#2A2A2A'}` }} />
            {error && <p className="text-[#FF3B30] text-xs mb-3">{error}</p>}
            {!error && <div className="mb-4" />}
            <button onClick={save} disabled={saving || !value.trim()}
                className="w-full rounded-xl py-3 font-bold text-sm"
                style={{ background: '#FF3B30', color: '#FFF', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'ENREGISTREMENT...' : 'ENREGISTRER'}
            </button>
        </Modal>
    );
}

function ModalPassword({ onClose }) {
    const [form,   setForm]   = useState({ current_password: '', password: '', password_confirmation: '' });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [done,   setDone]   = useState(false);

    const save = () => {
        if (saving) return;
        setSaving(true);
        router.post('/profil/password', form, {
            onSuccess: () => setDone(true),
            onError:   (errs) => { setErrors(errs); setSaving(false); },
            onFinish:  () => setSaving(false),
        });
    };

    if (done) return (
        <Modal title="Mot de passe" onClose={onClose}>
            <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(76,217,100,0.15)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4CD964" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </div>
                <p className="text-[#4CD964] font-bold">Mot de passe mis à jour !</p>
            </div>
        </Modal>
    );

    return (
        <Modal title="Changer le mot de passe" onClose={onClose}>
            {[
                { key: 'current_password',      label: 'Mot de passe actuel' },
                { key: 'password',              label: 'Nouveau mot de passe' },
                { key: 'password_confirmation', label: 'Confirmer le nouveau' },
            ].map(f => (
                <div key={f.key} className="mb-3">
                    <p className="text-[#666] text-xs mb-1">{f.label}</p>
                    <input type="password" value={form[f.key]}
                        onChange={e => { setForm(p => ({ ...p, [f.key]: e.target.value })); setErrors(p => ({ ...p, [f.key]: '' })); }}
                        className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none"
                        style={{ background: '#0D0D0D', border: `1px solid ${errors[f.key] ? '#FF3B30' : '#2A2A2A'}` }} />
                    {errors[f.key] && <p className="text-[#FF3B30] text-xs mt-0.5">{errors[f.key]}</p>}
                </div>
            ))}
            <button onClick={save} disabled={saving}
                className="w-full rounded-xl py-3 font-bold text-sm mt-2"
                style={{ background: '#FF3B30', color: '#FFF', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'MISE À JOUR...' : 'METTRE À JOUR'}
            </button>
        </Modal>
    );
}

function ModalBio({ currentBio, onClose }) {
    const [bio,    setBio]    = useState(currentBio ?? '');
    const [saving, setSaving] = useState(false);

    const save = () => {
        if (saving) return;
        setSaving(true);
        router.post('/profil/update', { bio }, {
            onSuccess: () => onClose(),
            onFinish:  () => setSaving(false),
        });
    };

    return (
        <Modal title="Ma bio" onClose={onClose}>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} maxLength={300}
                className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none resize-none mb-1"
                style={{ background: '#0D0D0D', border: '1px solid #2A2A2A' }} />
            <p className="text-[#555] text-xs text-right mb-4">{bio.length}/300</p>
            <button onClick={save} disabled={saving}
                className="w-full rounded-xl py-3 font-bold text-sm"
                style={{ background: '#FF3B30', color: '#FFF', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'ENREGISTREMENT...' : 'ENREGISTRER'}
            </button>
        </Modal>
    );
}

function ModalPhoto({ currentPath, onClose }) {
    const [file,    setFile]    = useState(null);
    const [preview, setPreview] = useState(currentPath ? resolveMediaUrl(currentPath) : null);
    const [saving,  setSaving]  = useState(false);
    const fileRef = useRef();

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const save = () => {
        if (!file || saving) return;
        setSaving(true);
        router.post('/profil/avatar', { avatar: file }, {
            forceFormData: true,
            onSuccess: () => onClose(),
            onFinish:  () => setSaving(false),
        });
    };

    return (
        <Modal title="Photo de profil" onClose={onClose}>
            <input ref={fileRef} type="file" accept="image/jpg,image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
            <div className="flex flex-col items-center gap-4 mb-5">
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center"
                    style={{ background: '#2A2A2A' }}>
                    {preview ? (
                        <img src={preview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <button onClick={() => fileRef.current.click()}
                    className="w-full rounded-xl py-3 font-bold text-sm"
                    style={{ background: '#2A2A2A', color: '#FFF' }}>
                    CHOISIR UNE PHOTO
                </button>
                <button onClick={save} disabled={!file || saving}
                    className="w-full rounded-xl py-3 font-bold text-sm transition-opacity"
                    style={{ background: '#FF3B30', color: '#FFF', opacity: file && !saving ? 1 : 0.35 }}>
                    {saving ? 'ENREGISTREMENT...' : 'ENREGISTRER'}
                </button>
            </div>
        </Modal>
    );
}

function ModalDelete({ onClose }) {
    const [confirm, setConfirm] = useState('');
    return (
        <Modal title="Supprimer le compte" onClose={onClose}>
            <div className="rounded-xl p-3 mb-4 flex items-start gap-2"
                style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <p className="text-[#FF3B30] text-xs">Cette action est irréversible. Ton solde RB et tout ton historique seront supprimés.</p>
            </div>
            <p className="text-[#888] text-xs mb-2">Tape <span className="text-white font-bold">SUPPRIMER</span> pour confirmer</p>
            <input value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="SUPPRIMER"
                className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none mb-4"
                style={{ background: '#0D0D0D', border: '1px solid #2A2A2A' }} />
            <button disabled={confirm !== 'SUPPRIMER'}
                className="w-full rounded-xl py-3 font-bold text-sm transition-opacity"
                style={{ background: '#FF3B30', color: '#FFF', opacity: confirm === 'SUPPRIMER' ? 1 : 0.35 }}>
                SUPPRIMER DÉFINITIVEMENT
            </button>
        </Modal>
    );
}

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.75)' }}
            onClick={onClose}>
            <div className="w-full max-w-[390px] rounded-2xl p-5"
                style={{ background: '#1A1A1A' }}
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

function ModalWallet({ currentAddress, onClose }) {
    const { connect, status, error, reset } = useMetaMask();
    const [serverError, setServerError] = useState('');
    const [linked, setLinked]           = useState(false);

    const handleConnect = async () => {
        setServerError('');
        const result = await connect();
        if (!result) return;

        const res = await fetch('/wallet/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
            },
            body: JSON.stringify({ address: result.address, signature: result.signature }),
        });

        const data = await res.json();
        if (data.error) {
            setServerError(data.error);
            reset();
        } else {
            setLinked(true);
            setTimeout(() => { onClose(); router.reload(); }, 1500);
        }
    };

    const handleUnlink = () => {
        router.post('/wallet/unlink', {}, { onSuccess: onClose });
    };

    if (linked) return (
        <Modal title="Wallet connecté" onClose={onClose}>
            <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(76,217,100,0.15)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4CD964" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </div>
                <p className="text-[#4CD964] font-bold text-base">Wallet lié avec succès !</p>
            </div>
        </Modal>
    );

    return (
        <Modal title="Connecter MetaMask" onClose={onClose}>
            {currentAddress ? (
                <div className="flex flex-col gap-4">
                    <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(76,217,100,0.08)', border: '1px solid rgba(76,217,100,0.2)' }}>
                        <p className="text-[#888] text-[10px] tracking-widest font-semibold mb-1">WALLET ACTUEL</p>
                        <p className="text-[#4CD964] font-mono text-xs break-all">{currentAddress}</p>
                    </div>
                    <button onClick={handleConnect}
                        className="w-full rounded-xl py-3 font-bold text-sm"
                        style={{ background: '#FF9500', color: '#0D0D0D' }}>
                        CHANGER DE WALLET
                    </button>
                    <button onClick={handleUnlink}
                        className="w-full rounded-xl py-3 font-bold text-sm"
                        style={{ background: 'rgba(255,59,48,0.1)', color: '#FF3B30', border: '1px solid rgba(255,59,48,0.3)' }}>
                        DÉLIER CE WALLET
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="rounded-xl p-4 flex items-start gap-3"
                        style={{ background: '#0D0D0D', border: '1px solid #2A2A2A' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                            <rect x="2" y="7" width="20" height="15" rx="2"/>
                            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                            <line x1="12" y1="12" x2="12" y2="16"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <p className="text-[#888] text-xs leading-relaxed">
                            Lie ton wallet MetaMask pour effectuer des dépôts et retraits en crypto directement depuis l'application.
                        </p>
                    </div>

                    {(error || serverError) && (
                        <div className="rounded-xl px-4 py-3"
                            style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)' }}>
                            <p className="text-[#FF3B30] text-xs">{serverError || error}</p>
                        </div>
                    )}

                    <button onClick={handleConnect}
                        disabled={status === 'connecting' || status === 'signing'}
                        className="w-full rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2"
                        style={{ background: '#FF9500', color: '#0D0D0D', opacity: (status === 'connecting' || status === 'signing') ? 0.7 : 1 }}>
                        {status === 'connecting' && (
                            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                            </svg>
                        )}
                        {status === 'signing' ? 'Signe dans MetaMask...' : status === 'connecting' ? 'Connexion...' : '🦊 CONNECTER METAMASK'}
                    </button>
                </div>
            )}
        </Modal>
    );
}

export default function Settings() {
    const { auth } = usePage().props;
    const { t, i18n } = useTranslation();
    const walletAddress = auth?.user?.wallet_address;
    const username      = auth?.user?.username ?? '';
    const bio           = auth?.user?.bio ?? '';

    const [modal, setModal]   = useState(null);
    const [notifs, setNotifs] = useState({ defis: true, resultats: true, litiges: true, promo: false });
    const [profil, setProfil] = useState({ public: true, solde: false });

    const currentLang = i18n.language?.startsWith('en') ? 'English' : 'Français';
    const toggleLang  = () => i18n.changeLanguage(currentLang === 'Français' ? 'en' : 'fr');

    const toggle = (key) => setNotifs(p => ({ ...p, [key]: !p[key] }));

    return (
        <AppLayout>
            <TopBar />

            {/* Header */}
            <div className="flex items-center gap-3 px-4 pt-2 pb-4">
                <Link href="/profil">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="19" y1="12" x2="5" y2="12"/>
                        <polyline points="12 19 5 12 12 5"/>
                    </svg>
                </Link>
                <h1 className="text-white font-black text-xl">{t('settings.title')}</h1>
            </div>

            {/* PROFIL */}
            <Section title="PROFIL">
                <Row icon={<UserIcon />} label="Pseudo" value={username}
                    onClick={() => setModal('pseudo')} />
                <Row icon={<EditIcon />} label="Ma bio" value={bio ? bio.slice(0, 20) + (bio.length > 20 ? '…' : '') : ''}
                    onClick={() => setModal('bio')} />
                <Row icon={<ImgIcon />} label="Photo de profil"
                    onClick={() => setModal('photo')} last />
            </Section>

            {/* WALLET */}
            <Section title="WALLET METAMASK">
                <Row
                    icon={<WalletIcon connected={!!walletAddress} />}
                    label={walletAddress ? 'Wallet lié' : 'Connecter MetaMask'}
                    value={walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : 'Non lié'}
                    onClick={() => setModal('wallet')}
                    last
                />
            </Section>

            {/* SÉCURITÉ */}
            <Section title="SÉCURITÉ">
                <Row icon={<LockIcon />} label="Changer le mot de passe"
                    onClick={() => setModal('password')} />
                <Row icon={<ShieldIcon />} label="Authentification 2 facteurs" value="Inactif"
                    onClick={() => {}} last />
            </Section>

            {/* NOTIFICATIONS */}
            <Section title="NOTIFICATIONS">
                <Row icon={<BellIcon color="#CCCCCC" />} label="Défis reçus"
                    toggle toggled={notifs.defis} onToggle={() => toggle('defis')} />
                <Row icon={<BellIcon color="#CCCCCC" />} label="Résultats de match"
                    toggle toggled={notifs.resultats} onToggle={() => toggle('resultats')} />
                <Row icon={<BellIcon color="#CCCCCC" />} label="Litiges & Support"
                    toggle toggled={notifs.litiges} onToggle={() => toggle('litiges')} />
                <Row icon={<BellIcon color="#CCCCCC" />} label="Promotions"
                    toggle toggled={notifs.promo} onToggle={() => toggle('promo')} last />
            </Section>

            {/* CONFIDENTIALITÉ */}
            <Section title="CONFIDENTIALITÉ">
                <Row icon={<EyeIcon />} label="Profil public"
                    toggle toggled={profil.public} onToggle={() => setProfil(p => ({ ...p, public: !p.public }))} />
                <Row icon={<EyeIcon />} label="Afficher mon solde RB"
                    toggle toggled={profil.solde} onToggle={() => setProfil(p => ({ ...p, solde: !p.solde }))} last />
            </Section>

            {/* LANGUE */}
            <Section title={t('settings.language').toUpperCase()}>
                <Row icon={<GlobeIcon />} label={t('settings.language')} value={currentLang}
                    onClick={toggleLang} last />
            </Section>

            {/* COMPTE */}
            <Section title="COMPTE">
                <Row icon={<TrashIcon />} label="Supprimer mon compte"
                    onClick={() => setModal('delete')} danger last />
            </Section>

            <div className="h-6" />

            {/* Modals */}
            {modal === 'pseudo'   && <ModalPseudo   currentUsername={username}                onClose={() => setModal(null)} />}
            {modal === 'bio'      && <ModalBio      currentBio={bio}                           onClose={() => setModal(null)} />}
            {modal === 'password' && <ModalPassword                                            onClose={() => setModal(null)} />}
            {modal === 'photo'    && <ModalPhoto    currentPath={auth?.user?.avatar_path}      onClose={() => setModal(null)} />}
            {modal === 'delete'   && <ModalDelete                                              onClose={() => setModal(null)} />}
            {modal === 'wallet'   && <ModalWallet   currentAddress={walletAddress}             onClose={() => setModal(null)} />}
        </AppLayout>
    );
}

/* ── Icons ── */
const s = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
const UserIcon  = () => <svg {...s} stroke="#CCCCCC"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const EditIcon  = () => <svg {...s} stroke="#CCCCCC"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const ImgIcon   = () => <svg {...s} stroke="#CCCCCC"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const LockIcon  = () => <svg {...s} stroke="#CCCCCC"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const ShieldIcon= () => <svg {...s} stroke="#CCCCCC"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const BellIcon  = ({color}) => <svg {...s} stroke={color}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const EyeIcon   = () => <svg {...s} stroke="#CCCCCC"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const GlobeIcon = () => <svg {...s} stroke="#CCCCCC"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const TrashIcon  = () => <svg {...s} stroke="#FF3B30"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const WalletIcon = ({ connected }) => <svg {...s} stroke={connected ? '#4CD964' : '#FF9500'}><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>{connected && <circle cx="17" cy="14" r="1" fill="#4CD964" stroke="none"/>}</svg>;
