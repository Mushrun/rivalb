import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

const NAV_LINKS = [
    { label: 'Comment ça marche', href: '#how' },
    { label: 'Défis',             href: '#challenges' },
    { label: 'FAQ',               href: '#faq' },
];

const FAQS = [
    {
        q: 'Comment les résultats sont-ils validés ?',
        a: 'Chaque joueur soumet une capture d\'écran de son résultat. Si les deux résultats concordent, le match est validé automatiquement. Sinon, un arbitrage est ouvert.',
    },
    {
        q: 'Quand suis-je payé ?',
        a: 'Les gains sont crédités instantanément sur ton compte dès la validation du match. Tu peux retirer à tout moment.',
    },
    {
        q: 'Que se passe-t-il en cas de litige ?',
        a: 'Un système d\'arbitrage communautaire est activé. Les membres votent sur le résultat via un sondage Telegram. La décision est prise en moins de 24h.',
    },
    {
        q: 'Puis-je défier un ami ?',
        a: 'Oui. Crée un défi privé et partage le lien directement à ton ami. Seul lui pourra relever le défi.',
    },
    {
        q: 'Y a-t-il des frais ?',
        a: 'Une commission de 5% est prélevée sur les gains du vainqueur. Aucun frais caché. Les frais de retrait varient selon la méthode (RB : 6%, USDT : 10%).',
    },
    {
        q: 'Puis-je retirer mes gains quand je veux ?',
        a: 'Oui, à tout moment. Les retraits sont traités manuellement dans un délai de 24h ouvrées.',
    },
    {
        q: 'Combien de temps dure une validation ?',
        a: 'La validation automatique est quasi-instantanée. En cas de litige, le délai maximum est de 24h.',
    },
];

function Navbar({ isAuth }) {
    const [open, setOpen] = useState(false);
    return (
        <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1E1E1E' }}>
            <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-16">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#FF3B30' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/>
                            <line x1="13" y1="19" x2="19" y2="13"/>
                        </svg>
                    </div>
                    <span className="text-white font-black text-lg tracking-wider">RIVALBET</span>
                </div>

                <div className="hidden md:flex items-center gap-6">
                    {NAV_LINKS.map(l => (
                        <a key={l.href} href={l.href} className="text-[#888] text-sm font-semibold hover:text-white transition-colors">{l.label}</a>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {isAuth ? (
                        <Link href="/defis" className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: '#FF3B30' }}>
                            Jouer
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="text-[#888] text-sm font-semibold hover:text-white transition-colors hidden sm:block">
                                Connexion
                            </Link>
                            <Link href="/register" className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: '#FF3B30' }}>
                                S'inscrire
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

function FaqItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
            <button onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-left">
                <span className="text-white font-semibold text-sm">{q}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round"
                    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0, marginLeft: 12 }}>
                    <polyline points="6 9 12 15 18 9"/>
                </svg>
            </button>
            {open && (
                <div className="px-5 pb-4">
                    <p className="text-[#999] text-sm leading-relaxed">{a}</p>
                </div>
            )}
        </div>
    );
}

function ChallengeCard({ challenge, isAuth }) {
    const href = isAuth ? `/defis/${challenge.id}` : '/register';
    const initials = (challenge.creator.username ?? '?').slice(0, 2).toUpperCase();
    const isBotAvatar = !challenge.creator.avatar_path;

    return (
        <Link href={href}
            className="rounded-2xl p-4 flex flex-col gap-3 hover:scale-[1.02] transition-transform cursor-pointer"
            style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>

            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black px-2 py-1 rounded-lg tracking-wider"
                    style={challenge.currency === 'usdt'
                        ? { background: 'rgba(76,217,100,0.15)', color: '#4CD964' }
                        : { background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}>
                    {challenge.type}
                </span>
                <span className="text-[10px] text-[#555] font-semibold">{challenge.created_at}</span>
            </div>

            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                    style={{ background: isBotAvatar ? '#FF3B30' : 'transparent' }}>
                    {isBotAvatar
                        ? initials
                        : <img src={`/storage/${challenge.creator.avatar_path}`} className="w-10 h-10 rounded-xl object-cover" alt="" />
                    }
                </div>
                <div>
                    <p className="text-white font-bold text-sm">{challenge.creator.username}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4CD964' }} />
                        <span className="text-[#4CD964] text-[10px] font-semibold">Fiabilité {challenge.creator.reliability_score}%</span>
                    </div>
                </div>
            </div>

            <div className="rounded-xl px-3 py-2.5 flex items-center justify-between"
                style={{ background: '#111' }}>
                <span className="text-[#666] text-xs font-semibold">Mise</span>
                <span className="font-black text-base" style={{ color: challenge.currency === 'usdt' ? '#4CD964' : '#FF9500' }}>
                    {challenge.currency === 'usdt'
                        ? `${challenge.bet_amount} USDT`
                        : `${challenge.bet_amount.toLocaleString()} RB`}
                </span>
            </div>

            <div className="w-full py-2.5 rounded-xl text-center text-sm font-black text-white"
                style={{ background: 'linear-gradient(135deg, #FF3B30, #FF6B35)' }}>
                ⚔️ Relever le défi
            </div>
        </Link>
    );
}

export default function Welcome() {
    const { challenges = [], isAuth } = usePage().props;

    return (
        <div style={{ background: '#0A0A0A', minHeight: '100vh', color: 'white' }}>
            <Navbar isAuth={isAuth} />

            {/* ── HERO ── */}
            <section className="relative pt-32 pb-24 px-5 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,59,48,0.12) 0%, transparent 70%)' }} />

                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-bold tracking-wider"
                        style={{ background: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.3)', color: '#FF3B30' }}>
                        ⚡ SHADOW FIGHT · COMPÉTITION P2P
                    </div>

                    <h1 className="font-black leading-tight mb-6"
                        style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', letterSpacing: '-0.02em' }}>
                        Transforme tes victoires<br />
                        <span style={{ color: '#FF3B30' }}>Shadow Fight</span> en récompenses
                    </h1>

                    <p className="text-[#888] text-lg mb-3 font-medium">Affronte de vrais joueurs.</p>
                    <p className="text-[#888] text-lg mb-3 font-medium">Lance des défis.</p>
                    <p className="text-[#888] text-lg mb-3 font-medium">Remporte des compétitions.</p>
                    <p className="text-[#888] text-lg mb-8 font-medium">Retire tes gains.</p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                        <Link href="/register"
                            className="px-8 py-4 rounded-2xl font-black text-lg text-white w-full sm:w-auto text-center"
                            style={{ background: 'linear-gradient(135deg, #FF3B30, #FF6B35)', boxShadow: '0 8px 30px rgba(255,59,48,0.4)' }}>
                            🔥 Commencer maintenant
                        </Link>
                        <a href="#how"
                            className="px-8 py-4 rounded-2xl font-bold text-base text-white w-full sm:w-auto text-center"
                            style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                            ▶️ Voir comment ça fonctionne
                        </a>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                        {['Paiements rapides', 'Joueurs réels', 'Résultats vérifiés', 'Support disponible'].map(t => (
                            <div key={t} className="flex items-center gap-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4CD964" strokeWidth="2.5" strokeLinecap="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                <span className="text-[#888] text-sm font-semibold">{t}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── COMMENT ÇA MARCHE ── */}
            <section id="how" className="py-20 px-5" style={{ background: '#0D0D0D' }}>
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-[#FF3B30] text-xs font-black tracking-widest mb-3">FONCTIONNEMENT</p>
                        <h2 className="font-black text-3xl md:text-4xl">Gagner est plus simple<br />que tu ne le penses</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: '⚔️',
                                step: '01',
                                title: 'Choisis un défi',
                                desc: 'Sélectionne un défi 1v1 ou 3v3 selon ta mise et ton niveau. Lance le tien ou rejoins celui d\'un adversaire.',
                                tags: ['1v1', '3v3'],
                            },
                            {
                                icon: '🎮',
                                step: '02',
                                title: 'Joue ton match',
                                desc: 'Affronte ton adversaire sur Shadow Fight. Soumets une capture d\'écran de ton résultat pour validation.',
                                tags: null,
                            },
                            {
                                icon: '🏆',
                                step: '03',
                                title: 'Victoire = récompense',
                                desc: 'Le gagnant reçoit automatiquement les gains du défi. Retire en RB ou USDT quand tu veux.',
                                tags: null,
                            },
                        ].map((card, i) => (
                            <div key={i} className="rounded-2xl p-6 relative" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                                <span className="absolute top-4 right-4 font-black text-4xl" style={{ color: '#1E1E1E' }}>{card.step}</span>
                                <div className="text-4xl mb-4">{card.icon}</div>
                                <h3 className="text-white font-black text-xl mb-3">{card.title}</h3>
                                <p className="text-[#777] text-sm leading-relaxed mb-4">{card.desc}</p>
                                {card.tags && (
                                    <div className="flex gap-2">
                                        {card.tags.map(t => (
                                            <span key={t} className="px-3 py-1 rounded-lg text-xs font-bold"
                                                style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}>{t}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-10">
                        <Link href="/register"
                            className="inline-block px-8 py-4 rounded-2xl font-black text-base text-white"
                            style={{ background: '#FF3B30' }}>
                            ⚔️ Créer mon premier défi
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── DÉFIS DISPONIBLES ── */}
            <section id="challenges" className="py-20 px-5">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-[#FF3B30] text-xs font-black tracking-widest mb-3">EN DIRECT</p>
                        <h2 className="font-black text-3xl md:text-4xl">Défis disponibles<br />en ce moment</h2>
                        <p className="text-[#666] mt-3 text-sm">Rejoins un défi et commence à gagner</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {challenges.map(c => (
                            <ChallengeCard key={c.id} challenge={c} isAuth={isAuth} />
                        ))}
                        {challenges.length === 0 && (
                            <div className="col-span-4 text-center py-12 text-[#555]">
                                Aucun défi disponible pour le moment.
                            </div>
                        )}
                    </div>

                    {!isAuth && (
                        <div className="text-center mt-8">
                            <p className="text-[#666] text-sm mb-4">Connecte-toi pour relever un défi</p>
                            <Link href="/register"
                                className="inline-block px-8 py-4 rounded-2xl font-black text-base text-white"
                                style={{ background: '#FF3B30' }}>
                                Créer mon compte gratuitement
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* ── POURQUOI NOUS ── */}
            <section className="py-20 px-5" style={{ background: '#0D0D0D' }}>
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-[#FF3B30] text-xs font-black tracking-widest mb-3">AVANTAGES</p>
                        <h2 className="font-black text-3xl md:text-4xl">Pourquoi rejoindre<br />la compétition ?</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { icon: '🔥', title: 'Plus excitant',     desc: 'Chaque combat compte. Chaque victoire a une valeur réelle.' },
                            { icon: '🏆', title: 'Plus compétitif',   desc: 'Affronte des joueurs motivés qui jouent pour gagner.' },
                            { icon: '🎯', title: 'Plus stratégique',  desc: 'Chaque héros peut faire la différence. La stratégie prime.' },
                            { icon: '💰', title: 'Plus gratifiant',   desc: 'Tes victoires ont une vraie valeur. Retire tes gains en USDT.' },
                        ].map((b, i) => (
                            <div key={i} className="rounded-2xl p-6 text-center" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                                <div className="text-4xl mb-4">{b.icon}</div>
                                <h3 className="text-white font-black text-lg mb-2">{b.title}</h3>
                                <p className="text-[#777] text-sm leading-relaxed">{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── ANTI-TRICHE ── */}
            <section className="py-20 px-5">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <p className="text-[#FF3B30] text-xs font-black tracking-widest mb-4">CONFIANCE</p>
                            <h2 className="font-black text-3xl md:text-4xl mb-6">Une compétition<br />équitable</h2>
                            <p className="text-[#777] text-sm leading-relaxed mb-8">
                                Rivalbet garantit des matchs équitables grâce à un système de vérification rigoureux. Chaque résultat est vérifié, chaque litige est arbitré.
                            </p>

                            <div className="flex flex-col gap-4">
                                {[
                                    'Vérification des résultats par captures d\'écran',
                                    'Captures et vidéos acceptées comme preuves',
                                    'Arbitrage communautaire en cas de litige',
                                    'Historique public des matchs',
                                    'Protection contre la fraude et les bots',
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ background: 'rgba(76,217,100,0.15)' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4CD964" strokeWidth="3" strokeLinecap="round">
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                        </div>
                                        <span className="text-white text-sm font-semibold">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl p-6" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                            <p className="text-[#555] text-xs font-bold tracking-widest mb-4">INTERFACE DE VALIDATION</p>
                            <div className="flex flex-col gap-3">
                                {['Résultat soumis', 'Capture vérifiée', 'Match validé', 'Gains crédités'].map((step, i) => (
                                    <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3"
                                        style={{ background: '#111' }}>
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white"
                                            style={{ background: '#FF3B30' }}>{i + 1}</div>
                                        <span className="text-white font-semibold text-sm">{step}</span>
                                        <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4CD964" strokeWidth="3" strokeLinecap="round">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section id="faq" className="py-20 px-5" style={{ background: '#0D0D0D' }}>
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-[#FF3B30] text-xs font-black tracking-widest mb-3">FAQ</p>
                        <h2 className="font-black text-3xl md:text-4xl">Questions fréquentes</h2>
                    </div>
                    <div className="flex flex-col gap-3">
                        {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ── */}
            <section className="py-28 px-5 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 100% 80% at 50% 50%, rgba(255,59,48,0.15) 0%, transparent 70%)' }} />
                <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                <div className="max-w-2xl mx-auto text-center relative z-10">
                    <div className="text-6xl mb-6">⚔️</div>
                    <h2 className="font-black leading-tight mb-5"
                        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                        Prêt à entrer<br />dans l'arène ?
                    </h2>
                    <p className="text-[#777] text-lg mb-2">Des milliers de combats sont joués chaque jour.</p>
                    <p className="text-[#777] text-lg mb-10">Le prochain pourrait être le tien.</p>

                    <Link href="/register"
                        className="inline-block px-10 py-5 rounded-2xl font-black text-xl text-white"
                        style={{ background: 'linear-gradient(135deg, #FF3B30, #FF6B35)', boxShadow: '0 12px 40px rgba(255,59,48,0.5)' }}>
                        ⚔️ Commencer maintenant
                    </Link>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="py-8 px-5 text-center" style={{ background: '#0A0A0A', borderTop: '1px solid #1A1A1A' }}>
                <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: '#FF3B30' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/>
                            <line x1="13" y1="19" x2="19" y2="13"/>
                        </svg>
                    </div>
                    <span className="text-white font-black tracking-wider text-sm">RIVALBET</span>
                </div>
                <p className="text-[#444] text-xs">© 2026 Rivalbet · Tous droits réservés</p>
            </footer>
        </div>
    );
}
