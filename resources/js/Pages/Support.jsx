import { useState, useRef } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../Components/AppLayout';
import TopBar from '../Components/TopBar';

const faqs = [
    {
        q: 'Comment fonctionne le système de mise ?',
        a: 'Les deux joueurs misent le même montant en RB. La mise est placée en séquestre jusqu\'à la fin du match. Le gagnant récupère la totalité.',
    },
    {
        q: 'Que se passe-t-il en cas de litige ?',
        a: 'Si les deux joueurs soumettent des résultats contradictoires, un litige est ouvert. Un administrateur examine les captures d\'écran et tranche sous 24h.',
    },
    {
        q: 'Comment recharger mes RB ?',
        a: 'Va dans Historique → Transactions → RECHARGER. Tu peux utiliser Mobile Money ou d\'autres méthodes disponibles dans ta région.',
    },
    {
        q: 'Comment retirer mes RB ?',
        a: 'Va dans Historique → Transactions → RETIRER. Le minimum de retrait est de 50 RB. Le délai de traitement est de 24-48h.',
    },
    {
        q: 'Ma fiabilité a baissé, pourquoi ?',
        a: 'La fiabilité est calculée sur tes 50 derniers matchs. Elle baisse si tu annules des défis, abandonnes des matchs ou reçois des avis négatifs.',
    },
    {
        q: 'Comment signaler un joueur ?',
        a: 'Sur le profil du joueur, appuie sur les 3 points en haut à droite pour accéder à l\'option "Signaler".',
    },
];

function FAQItem({ item }) {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ borderBottom: '1px solid #2A2A2A' }}>
            <button onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-4 text-left">
                <span className="text-white text-sm font-medium pr-4">{item.q}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round"
                    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9"/>
                </svg>
            </button>
            {open && (
                <p className="text-[#888] text-sm px-4 pb-4 leading-relaxed">{item.a}</p>
            )}
        </div>
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
                <div className="flex items-center justify-between mb-4">
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

function ModalFeedback({ onClose }) {
    const [type, setType] = useState('bug');
    const [msg, setMsg]   = useState('');
    const [sent, setSent] = useState(false);

    if (sent) return (
        <Modal title="Feedback envoyé" onClose={onClose}>
            <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(76,217,100,0.15)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4CD964" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </div>
                <p className="text-white font-bold text-base">Merci !</p>
                <p className="text-[#888] text-xs text-center">Ton message a été transmis à l'équipe. On te répondra par email si nécessaire.</p>
                <button onClick={onClose}
                    className="w-full rounded-xl py-3 font-bold text-sm mt-2"
                    style={{ background: '#FF3B30', color: '#FFF' }}>
                    FERMER
                </button>
            </div>
        </Modal>
    );

    return (
        <Modal title="Envoyer un feedback" onClose={onClose}>
            <p className="text-[#888] text-xs mb-3">Type de retour</p>
            <div className="flex gap-2 mb-4">
                {[
                    { key: 'bug',       label: '🐛 Bug' },
                    { key: 'suggestion',label: '💡 Idée' },
                    { key: 'autre',     label: '💬 Autre' },
                ].map(t => (
                    <button key={t.key} onClick={() => setType(t.key)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={{
                            background: type === t.key ? '#FF3B30' : '#2A2A2A',
                            color: type === t.key ? '#FFF' : '#888',
                        }}>
                        {t.label}
                    </button>
                ))}
            </div>
            <textarea value={msg} onChange={e => setMsg(e.target.value)}
                placeholder="Décris ton problème ou ton idée..."
                rows={4}
                className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none resize-none mb-4"
                style={{ background: '#0D0D0D', border: '1px solid #2A2A2A' }} />
            <button onClick={() => msg.trim() && setSent(true)}
                disabled={!msg.trim()}
                className="w-full rounded-xl py-3 font-bold text-sm transition-opacity"
                style={{ background: '#FF3B30', color: '#FFF', opacity: msg.trim() ? 1 : 0.4 }}>
                ENVOYER
            </button>
        </Modal>
    );
}

function ModalContact({ onClose }) {
    return (
        <Modal title="Contacter le support" onClose={onClose}>
            <p className="text-[#888] text-xs mb-4">Choisis ton canal de contact préféré.</p>
            <div className="flex flex-col gap-2">
                {[
                    { icon: '✉️', label: 'Email', value: 'support@rivalbet.com', action: 'mailto:support@rivalbet.com' },
                    { icon: '💬', label: 'Discord', value: 'discord.gg/rivalbet', action: '#' },
                    { icon: '📸', label: 'Instagram', value: '@rivalbet.off', action: '#' },
                ].map(c => (
                    <a key={c.label} href={c.action}
                        className="flex items-center gap-3 rounded-xl px-4 py-3"
                        style={{ background: '#0D0D0D', border: '1px solid #2A2A2A' }}>
                        <span className="text-lg">{c.icon}</span>
                        <div className="flex-1">
                            <p className="text-white font-semibold text-sm">{c.label}</p>
                            <p className="text-[#666] text-xs">{c.value}</p>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </a>
                ))}
            </div>
            <button onClick={onClose}
                className="w-full rounded-xl py-3 font-bold text-sm mt-4"
                style={{ background: '#2A2A2A', color: '#CCC' }}>
                FERMER
            </button>
        </Modal>
    );
}

export default function Support() {
    const [modal, setModal] = useState(null);

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
                <h1 className="text-white font-black text-xl">Aide & Support</h1>
            </div>

            {/* Actions rapides */}
            <div className="flex gap-3 px-4 mb-5">
                <button onClick={() => setModal('feedback')}
                    className="flex-1 rounded-2xl p-4 flex flex-col items-center gap-2"
                    style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,59,48,0.1)' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </div>
                    <span className="text-white font-semibold text-xs text-center">Donner un feedback</span>
                </button>
                <button onClick={() => setModal('contact')}
                    className="flex-1 rounded-2xl p-4 flex flex-col items-center gap-2"
                    style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(76,217,100,0.1)' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4CD964" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                    </div>
                    <span className="text-white font-semibold text-xs text-center">Contacter le support</span>
                </button>
            </div>

            {/* FAQ */}
            <div className="px-4 mb-2">
                <p className="text-[#555] text-[10px] font-bold tracking-widest mb-2">QUESTIONS FRÉQUENTES</p>
            </div>
            <div className="mx-4 rounded-2xl overflow-hidden" style={{ background: '#1A1A1A' }}>
                {faqs.map((item, i) => (
                    <FAQItem key={i} item={item} />
                ))}
            </div>

            {/* Version */}
            <p className="text-center text-[#333] text-xs mt-6 mb-4">RIVALBET v1.0.0 — Tous droits réservés</p>

            {modal === 'feedback' && <ModalFeedback onClose={() => setModal(null)} />}
            {modal === 'contact'  && <ModalContact  onClose={() => setModal(null)} />}
        </AppLayout>
    );
}
