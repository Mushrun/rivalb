import { useState } from 'react';
import { Link } from '@inertiajs/react';
import BottomNav from '../Components/BottomNav';

const SECTIONS = [
    {
        id: 'presentation',
        icon: '🏠',
        label: 'Présentation',
        content: {
            title: 'Présentation de RivalBet',
            intro: 'RivalBet est une plateforme de paris P2P (joueur contre joueur) sur les jeux de combat. Deux joueurs misent la même somme, s\'affrontent dans le jeu, et le gagnant remporte la cagnotte.',
            blocks: [
                {
                    heading: 'Comment ça marche ?',
                    items: [
                        { dot: '⚔️', text: 'Un joueur crée un défi et mise un montant (RB ou USDT).' },
                        { dot: '🎮', text: 'Un adversaire accepte le défi et mise la même somme.' },
                        { dot: '🏆', text: 'Les deux joueurs s\'affrontent dans le jeu et déclarent leur résultat.' },
                        { dot: '💰', text: 'Si les deux sont d\'accord, le gagnant reçoit 95% de la cagnotte (5% de commission plateforme).' },
                        { dot: '⚖️', text: 'En cas de désaccord, un litige est ouvert et un admin tranche.' },
                    ],
                },
                {
                    heading: 'Les statuts d\'un défi',
                    pills: [
                        { label: 'Ouvert', color: '#4CD964', bg: 'rgba(76,217,100,0.12)', desc: 'En attente d\'un adversaire' },
                        { label: 'En cours', color: '#FF9500', bg: 'rgba(255,149,0,0.12)', desc: 'Match en train de se jouer' },
                        { label: 'Terminé', color: '#888', bg: 'rgba(136,136,136,0.12)', desc: 'Résultat validé' },
                        { label: 'Annulé', color: '#FF3B30', bg: 'rgba(255,59,48,0.12)', desc: 'Annulé par le créateur' },
                    ],
                },
                {
                    heading: 'Commission plateforme',
                    text: '5% de la cagnotte totale sont prélevés à chaque match. Exemple : mise de 100 RB → cagnotte 200 RB → le gagnant reçoit 190 RB.',
                },
            ],
        },
    },
    {
        id: 'compte',
        icon: '👤',
        label: 'Créer un compte',
        content: {
            title: 'Créer un compte',
            intro: 'L\'inscription est gratuite et rapide. Deux méthodes sont disponibles.',
            blocks: [
                {
                    heading: 'Méthode 1 — Email & Mot de passe',
                    items: [
                        { dot: '1', text: 'Clique sur "S\'inscrire" depuis la page d\'accueil.' },
                        { dot: '2', text: 'Remplis ton username, email et mot de passe.' },
                        { dot: '3', text: 'Ton compte est créé instantanément.' },
                    ],
                },
                {
                    heading: 'Méthode 2 — MetaMask (Web3)',
                    items: [
                        { dot: '1', text: 'Installe l\'extension MetaMask sur ton navigateur ou l\'app mobile.' },
                        { dot: '2', text: 'Dans Paramètres → Connecter MetaMask.' },
                        { dot: '3', text: 'Signe le message de connexion dans MetaMask.' },
                        { dot: '4', text: 'Ton wallet est lié à ton compte RivalBet.' },
                    ],
                },
                {
                    heading: 'Code de parrainage',
                    text: 'Si quelqu\'un t\'a invité, entre son code de parrainage lors de l\'inscription pour bénéficier d\'un bonus de bienvenue.',
                },
            ],
        },
    },
    {
        id: 'devises',
        icon: '💰',
        label: 'Les devises',
        content: {
            title: 'Les devises — RB & USDT',
            intro: 'RivalBet fonctionne avec deux devises. Tu peux choisir l\'une ou l\'autre pour tes défis.',
            blocks: [
                {
                    heading: 'RB (RivalBet Coin)',
                    items: [
                        { dot: '•', text: 'Token interne de la plateforme.' },
                        { dot: '•', text: 'S\'achète en déposant des tokens RB (BSC BEP-20) depuis MetaMask.' },
                        { dot: '•', text: 'Utilisé pour les défis en RB.' },
                    ],
                },
                {
                    heading: 'USDT',
                    items: [
                        { dot: '•', text: 'Stablecoin (1 USDT = 1 $).' },
                        { dot: '•', text: 'S\'achète en déposant des USDT (BSC BEP-20) depuis MetaMask.' },
                        { dot: '•', text: 'Utilisé pour les défis en USDT.' },
                    ],
                },
                {
                    heading: 'Important',
                    warning: 'Les deux devises sont indépendantes. Un défi créé en RB ne peut être rejoint qu\'avec des RB, et vice versa pour l\'USDT.',
                },
            ],
        },
    },
    {
        id: 'depot',
        icon: '📥',
        label: 'Dépôt & Retrait',
        content: {
            title: 'Dépôt & Retrait',
            intro: 'Recharge ton solde RB ou USDT via MetaMask, et retire tes gains quand tu veux.',
            blocks: [
                {
                    heading: 'Faire un dépôt',
                    items: [
                        { dot: '1', text: 'Va dans Recharge (accessible depuis le profil).' },
                        { dot: '2', text: 'Choisis le montant à déposer (min 500 RB ou 1 USDT).' },
                        { dot: '3', text: 'Confirme la transaction dans MetaMask.' },
                        { dot: '4', text: 'Ton solde est crédité après vérification blockchain (quelques minutes).' },
                    ],
                },
                {
                    heading: 'Faire un retrait',
                    items: [
                        { dot: '1', text: 'Va dans Retrait.' },
                        { dot: '2', text: 'Entre le montant et l\'adresse wallet de destination.' },
                        { dot: '3', text: 'La demande est traitée par l\'équipe sous 24-48h.' },
                    ],
                },
                {
                    heading: 'Statuts des transactions',
                    pills: [
                        { label: 'En attente', color: '#FF9500', bg: 'rgba(255,149,0,0.12)', desc: 'En cours de vérification' },
                        { label: 'Validé', color: '#4CD964', bg: 'rgba(76,217,100,0.12)', desc: 'Crédité sur ton compte' },
                        { label: 'Refusé', color: '#FF3B30', bg: 'rgba(255,59,48,0.12)', desc: 'Non traité (voir motif)' },
                    ],
                },
            ],
        },
    },
    {
        id: 'creer-defi',
        icon: '➕',
        label: 'Créer un défi',
        content: {
            title: 'Créer un défi',
            intro: 'Crée un défi en 6 étapes. Chaque étape configure un paramètre du match.',
            blocks: [
                {
                    heading: 'Les 6 étapes',
                    steps: [
                        { num: '1', title: 'Type', desc: 'Choisis entre 1v1 ou 3v3.' },
                        { num: '2', title: 'Personnage', desc: 'Sélectionne ton/tes personnage(s) Shadow Fight.' },
                        { num: '3', title: 'Règles', desc: 'Définis les règles spéciales (combat, position, durée).' },
                        { num: '4', title: 'Jeu', desc: 'Choisis le jeu (Shadow Fight 4: Arena, etc.).' },
                        { num: '5', title: 'Mise', desc: 'Entre le montant à miser (RB ou USDT). Ton solde est vérifié.' },
                        { num: '6', title: 'Confirmation', desc: 'Récapitulatif avant de publier le défi.' },
                    ],
                },
                {
                    heading: 'Ce qui se passe après',
                    items: [
                        { dot: '•', text: 'Ton défi est publié et visible par tous les joueurs.' },
                        { dot: '•', text: 'Ta mise est prélevée de ton solde immédiatement.' },
                        { dot: '•', text: 'Tous les utilisateurs reçoivent une notification email.' },
                        { dot: '•', text: 'Tu peux annuler le défi et récupérer ta mise tant que personne n\'a rejoint.' },
                    ],
                },
                {
                    heading: 'Partager ton défi',
                    text: 'Dans "Mes Défis", un bouton Partager est disponible sur chaque défi ouvert. Il copie un lien direct vers ton défi pour l\'envoyer sur WhatsApp, Telegram, etc.',
                },
            ],
        },
    },
    {
        id: 'rejoindre',
        icon: '🎮',
        label: 'Rejoindre un défi',
        content: {
            title: 'Rejoindre un défi',
            intro: 'Parcours les défis disponibles dans la section Battle et rejoins celui de ton choix.',
            blocks: [
                {
                    heading: 'Comment rejoindre',
                    items: [
                        { dot: '1', text: 'Va dans la section "Battle" (Défis).' },
                        { dot: '2', text: 'Les défis des joueurs que tu suis apparaissent en premier.' },
                        { dot: '3', text: 'Clique sur un défi pour voir les détails.' },
                        { dot: '4', text: 'Clique sur "Rejoindre" — ta mise est prélevée.' },
                        { dot: '5', text: 'Le match démarre : tu es redirigé vers le chat du match.' },
                    ],
                },
                {
                    heading: 'Conditions',
                    items: [
                        { dot: '⚠️', text: 'Tu dois avoir le solde suffisant dans la devise du défi.' },
                        { dot: '⚠️', text: 'Tu ne peux pas rejoindre ton propre défi.' },
                        { dot: '⚠️', text: 'Le défi doit être en statut "Ouvert".' },
                    ],
                },
                {
                    heading: 'Quitter avant le début',
                    text: 'Si le match est en statut "En attente" (avant que les deux joueurs aient confirmé Prêt), tu peux quitter. Ta mise te sera remboursée et le défi repassera en "Ouvert".',
                },
            ],
        },
    },
    {
        id: 'match',
        icon: '⚔️',
        label: 'Le match',
        content: {
            title: 'Le match — Comment ça se passe',
            intro: 'Une fois les deux joueurs appariés, le match se déroule en plusieurs phases.',
            blocks: [
                {
                    heading: 'Phase 1 — En attente',
                    items: [
                        { dot: '•', text: 'Le créateur (Player 1) crée une salle dans Shadow Fight 4, copie l\'ID et le colle dans le chat.' },
                        { dot: '•', text: 'L\'adversaire (Player 2) rejoint la salle et clique "Prêt".' },
                        { dot: '•', text: 'Une fois les deux prêts → le match passe en "En cours".' },
                    ],
                },
                {
                    heading: 'Phase 2 — En cours',
                    items: [
                        { dot: '•', text: 'Les joueurs s\'affrontent dans le jeu.' },
                        { dot: '•', text: 'Chacun déclare son résultat : Victoire ou Défaite.' },
                        { dot: '•', text: 'Une capture d\'écran peut être jointe comme preuve.' },
                    ],
                },
                {
                    heading: 'Phase 3 — Validation',
                    items: [
                        { dot: '✅', text: 'Accord (Victoire + Défaite) → Le gagnant est payé automatiquement.' },
                        { dot: '❌', text: 'Désaccord (Victoire + Victoire) → Un litige est ouvert.' },
                    ],
                },
                {
                    heading: 'Après le match',
                    items: [
                        { dot: '⭐', text: 'Tu peux laisser un avis sur ton adversaire (Positif / Négatif).' },
                        { dot: '🏆', text: 'Si tu as gagné, partage ta victoire via ton lien de parrainage.' },
                    ],
                },
            ],
        },
    },
    {
        id: 'litiges',
        icon: '⚖️',
        label: 'Litiges',
        content: {
            title: 'Gestion des litiges',
            intro: 'Un litige est ouvert automatiquement quand les deux joueurs déclarent avoir gagné (ou perdu).',
            blocks: [
                {
                    heading: 'Comment se passe un litige',
                    steps: [
                        { num: '1', title: 'Ouverture automatique', desc: 'Quand les résultats sont contradictoires, le match passe en statut "Litige".' },
                        { num: '2', title: 'Upload de preuve', desc: 'Chaque joueur peut uploader une vidéo ou capture d\'écran comme preuve.' },
                        { num: '3', title: 'Vote Telegram', desc: 'Un sondage est envoyé dans le groupe communautaire Telegram pour un vote.' },
                        { num: '4', title: 'Décision admin', desc: 'Un administrateur examine les preuves et tranche en faveur d\'un joueur.' },
                        { num: '5', title: 'Paiement', desc: 'Le gagnant désigné reçoit 95% de la cagnotte.' },
                    ],
                },
                {
                    heading: 'Score de fiabilité',
                    text: 'Chaque litige perdu réduit ton score de fiabilité (visible sur ton profil). Un score bas indique aux autres joueurs que tu es un adversaire moins fiable. Joue fair-play pour maintenir un bon score !',
                },
                {
                    heading: 'Conseils',
                    items: [
                        { dot: '💡', text: 'Filme toujours ta session de jeu en cas de litige.' },
                        { dot: '💡', text: 'Prends une capture d\'écran du résultat final immédiatement.' },
                        { dot: '💡', text: 'Ne quitte pas le jeu avant que le résultat soit enregistré.' },
                    ],
                },
            ],
        },
    },
    {
        id: 'transfert',
        icon: '💸',
        label: 'Transfert',
        content: {
            title: 'Transfert entre joueurs',
            intro: 'Envoie des fonds (RB ou USDT) directement à un autre joueur via le chat.',
            blocks: [
                {
                    heading: 'Comment envoyer des fonds',
                    items: [
                        { dot: '1', text: 'Ouvre une conversation avec le joueur.' },
                        { dot: '2', text: 'Clique sur le bouton "Send" (vert) en haut à droite.' },
                        { dot: '3', text: 'Choisis la devise (RB ou USDT) et entre le montant.' },
                        { dot: '4', text: 'Confirme l\'envoi.' },
                    ],
                },
                {
                    heading: 'Conditions',
                    items: [
                        { dot: '⚠️', text: 'Tu dois suivre le joueur (follow) pour lui envoyer des fonds.' },
                        { dot: '⚠️', text: 'Solde suffisant requis.' },
                        { dot: '⚠️', text: 'Montant minimum : 1 unité.' },
                    ],
                },
                {
                    heading: 'Traçabilité',
                    text: 'Tous les transferts sont enregistrés dans ton Historique avec le signe + (reçu) ou − (envoyé) et le nom du destinataire/expéditeur.',
                },
            ],
        },
    },
    {
        id: 'parrainage',
        icon: '🎁',
        label: 'Parrainage',
        content: {
            title: 'Programme de parrainage',
            intro: 'Invite tes amis à rejoindre RivalBet et gagne des bonus pour chaque filleul actif.',
            blocks: [
                {
                    heading: 'Ton lien de parrainage',
                    items: [
                        { dot: '1', text: 'Va dans la section "Parrainage".' },
                        { dot: '2', text: 'Copie ton lien unique ou ton code de parrainage.' },
                        { dot: '3', text: 'Partage-le sur WhatsApp, Telegram, Instagram, etc.' },
                    ],
                },
                {
                    heading: 'Partager ta victoire',
                    text: 'Après chaque victoire, un bouton "Partager ma victoire" apparaît dans le chat. Il génère une carte de victoire (avec preview WhatsApp/Telegram) qui contient ton lien de parrainage — c\'est la meilleure façon de recruter !',
                },
                {
                    heading: 'Bonus filleul',
                    text: 'Chaque nouvel utilisateur inscrit via ton lien te rapporte un bonus. Le montant du bonus est visible dans la section Parrainage.',
                },
            ],
        },
    },
    {
        id: 'profil',
        icon: '📊',
        label: 'Mon profil',
        content: {
            title: 'Mon profil & Score de fiabilité',
            intro: 'Ton profil public affiche tes statistiques, tes défis récents et les avis que tu as reçus.',
            blocks: [
                {
                    heading: 'Score de fiabilité',
                    items: [
                        { dot: '🟢', text: '80-100% — Très fiable. Joueur de confiance.' },
                        { dot: '🟡', text: '50-79% — Fiabilité moyenne. Quelques litiges.' },
                        { dot: '🔴', text: '0-49% — Peu fiable. Plusieurs litiges perdus.' },
                    ],
                },
                {
                    heading: 'Modifier mon profil',
                    items: [
                        { dot: '•', text: 'Username — modifiable dans Paramètres.' },
                        { dot: '•', text: 'Photo de profil — modifiable dans Paramètres.' },
                        { dot: '•', text: 'Bio — courte description visible sur ton profil public.' },
                        { dot: '•', text: 'Langue — basculer entre Français et English.' },
                    ],
                },
                {
                    heading: 'Suivre d\'autres joueurs',
                    text: 'Suis des joueurs pour voir leurs défis en priorité dans la section Battle. C\'est aussi requis pour leur envoyer des fonds via le chat.',
                },
            ],
        },
    },
    {
        id: 'faq',
        icon: '❓',
        label: 'FAQ',
        content: {
            title: 'Questions fréquentes',
            intro: 'Retrouve ici les réponses aux questions les plus courantes.',
            blocks: [
                {
                    faq: [
                        {
                            q: 'Que se passe-t-il si mon adversaire ne se connecte jamais ?',
                            a: 'Si l\'adversaire ne répond pas, contacte le support. Un admin peut annuler le match et te rembourser.',
                        },
                        {
                            q: 'Je peux annuler un défi déjà rejoint ?',
                            a: 'Non. Une fois le défi rejoint (match créé), le créateur ne peut plus annuler. Seul l\'adversaire (player 2) peut quitter si le match est encore en phase "En attente" — et sera remboursé.',
                        },
                        {
                            q: 'Mon dépôt n\'est pas arrivé, que faire ?',
                            a: 'Vérifie que tu as envoyé sur le bon réseau (BSC BEP-20). Si la transaction est confirmée sur la blockchain, contacte le support avec le hash de transaction.',
                        },
                        {
                            q: 'Puis-je jouer sans MetaMask ?',
                            a: 'Oui. MetaMask n\'est nécessaire que pour les dépôts et retraits. Tu peux créer un compte email/mot de passe et recevoir des fonds via parrainage ou transfert entre joueurs.',
                        },
                        {
                            q: 'Comment contacter le support ?',
                            a: 'Via la page Support accessible depuis Paramètres, ou directement sur Telegram.',
                        },
                        {
                            q: 'Combien de temps prend un retrait ?',
                            a: 'Les retraits sont traités sous 24 à 48 heures ouvrées.',
                        },
                    ],
                },
            ],
        },
    },
];

function ContentBlock({ block }) {
    if (block.faq) {
        return (
            <div className="flex flex-col gap-3">
                {block.faq.map((item, i) => (
                    <div key={i} className="rounded-xl p-4" style={{ background: '#111118', border: '1px solid #1E1E2A' }}>
                        <p className="text-white font-bold text-sm mb-2">Q. {item.q}</p>
                        <p className="text-[#888] text-sm leading-relaxed">{item.a}</p>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="mb-5">
            {block.heading && (
                <p className="text-[#FF3B30] font-bold text-xs tracking-widest mb-3 uppercase">{block.heading}</p>
            )}
            {block.text && (
                <p className="text-[#AAA] text-sm leading-relaxed">{block.text}</p>
            )}
            {block.warning && (
                <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.2)' }}>
                    <span className="text-base flex-shrink-0">⚠️</span>
                    <p className="text-[#FF9500] text-sm leading-relaxed">{block.warning}</p>
                </div>
            )}
            {block.items && (
                <div className="flex flex-col gap-2">
                    {block.items.map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5"
                                style={{ background: '#1A1A2A', color: '#FF3B30' }}>
                                {item.dot}
                            </span>
                            <p className="text-[#CCC] text-sm leading-relaxed flex-1">{item.text}</p>
                        </div>
                    ))}
                </div>
            )}
            {block.steps && (
                <div className="flex flex-col gap-3">
                    {block.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-xl p-3" style={{ background: '#111118', border: '1px solid #1E1E2A' }}>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-sm"
                                style={{ background: '#FF3B30', color: '#FFF' }}>
                                {step.num}
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">{step.title}</p>
                                <p className="text-[#888] text-xs mt-0.5">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {block.pills && (
                <div className="flex flex-col gap-2">
                    {block.pills.map((pill, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0"
                                style={{ background: pill.bg, color: pill.color }}>
                                {pill.label}
                            </span>
                            <span className="text-[#888] text-xs">{pill.desc}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function SectionContent({ section }) {
    const { content } = section;
    return (
        <div>
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{section.icon}</span>
                    <h1 className="text-white font-black text-xl">{content.title}</h1>
                </div>
                <p className="text-[#888] text-sm leading-relaxed">{content.intro}</p>
            </div>

            <div style={{ height: '1px', background: '#1E1E2A', marginBottom: '20px' }} />

            {content.blocks.map((block, i) => (
                <ContentBlock key={i} block={block} />
            ))}
        </div>
    );
}

export default function Docs() {
    const [activeId,    setActiveId]    = useState(null);
    const [search,      setSearch]      = useState('');

    const filtered = search.trim()
        ? SECTIONS.filter(s =>
            s.label.toLowerCase().includes(search.toLowerCase()) ||
            s.content.title.toLowerCase().includes(search.toLowerCase())
          )
        : SECTIONS;

    const active = activeId ? SECTIONS.find(s => s.id === activeId) : null;

    return (
        <div className="flex justify-center" style={{ background: '#0A0A0F', minHeight: '100dvh' }}>
            <div className="w-full max-w-[430px] flex flex-col" style={{ background: '#0A0A0F', minHeight: '100dvh' }}>

                {/* Header */}
                <div className="flex items-center gap-3 px-4 pt-4 pb-3 flex-shrink-0"
                    style={{ borderBottom: '1px solid #1A1A1A' }}>
                    {active ? (
                        <button onClick={() => setActiveId(null)} className="p-1">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="19" y1="12" x2="5" y2="12"/>
                                <polyline points="12 19 5 12 12 5"/>
                            </svg>
                        </button>
                    ) : (
                        <Link href="/support" className="p-1">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="19" y1="12" x2="5" y2="12"/>
                                <polyline points="12 19 5 12 12 5"/>
                            </svg>
                        </Link>
                    )}
                    <div className="flex-1">
                        <h1 className="text-white font-black text-lg">
                            {active ? active.label : 'Documentation'}
                        </h1>
                        {!active && (
                            <p className="text-[#555] text-xs">Guide d\'utilisation RivalBet</p>
                        )}
                    </div>
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
                        style={{ background: '#FF3B30' }}>
                        <span className="text-white font-black text-sm">RB</span>
                    </div>
                </div>

                {/* Liste des sections */}
                {!active && (
                    <div className="flex-1 overflow-y-auto pb-24">
                        {/* Barre de recherche */}
                        <div className="px-4 pt-4 pb-3">
                            <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5"
                                style={{ background: '#111118', border: '1px solid #1E1E2A' }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round">
                                    <circle cx="11" cy="11" r="8"/>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                </svg>
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Rechercher..."
                                    className="flex-1 bg-transparent text-white text-sm outline-none"
                                    style={{ '::placeholder': { color: '#444' } }}
                                />
                                {search && (
                                    <button onClick={() => setSearch('')}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round">
                                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Version */}
                        <div className="px-4 mb-3">
                            <div className="rounded-2xl p-4 flex items-center gap-3"
                                style={{ background: 'rgba(255,59,48,0.06)', border: '1px solid rgba(255,59,48,0.15)' }}>
                                <span className="text-2xl">⚔️</span>
                                <div>
                                    <p className="text-white font-bold text-sm">RivalBet</p>
                                    <p className="text-[#666] text-xs">Plateforme de paris P2P · Shadow Fight Arena</p>
                                </div>
                            </div>
                        </div>

                        {/* Sections */}
                        <div className="px-4">
                            <p className="text-[#555] text-[10px] font-bold tracking-widest mb-2">SECTIONS</p>
                            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #1E1E2A' }}>
                                {filtered.map((section, i) => (
                                    <button key={section.id}
                                        onClick={() => setActiveId(section.id)}
                                        className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:opacity-70 transition-opacity"
                                        style={{ borderBottom: i < filtered.length - 1 ? '1px solid #1A1A1A' : 'none', background: '#111118' }}>
                                        <span className="text-xl w-8 flex-shrink-0 text-center">{section.icon}</span>
                                        <span className="flex-1 text-white font-semibold text-sm">{section.label}</span>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round">
                                            <polyline points="9 18 15 12 9 6"/>
                                        </svg>
                                    </button>
                                ))}
                            </div>

                            {filtered.length === 0 && (
                                <div className="flex flex-col items-center gap-2 py-10">
                                    <span className="text-3xl">🔍</span>
                                    <p className="text-[#555] text-sm">Aucun résultat pour "{search}"</p>
                                </div>
                            )}
                        </div>

                        <div className="px-4 mt-6 mb-4">
                            <Link href="/support"
                                className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 font-bold text-sm"
                                style={{ background: '#111118', color: '#888', border: '1px solid #1E1E2A' }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                                Contacter le support
                            </Link>
                        </div>

                        <p className="text-center text-[#333] text-[10px] pb-4">RivalBet · v1.0</p>
                    </div>
                )}

                {/* Contenu d'une section */}
                {active && (
                    <div className="flex-1 overflow-y-auto px-4 py-5 pb-24">
                        <SectionContent section={active} />

                        {/* Navigation entre sections */}
                        <div style={{ height: '1px', background: '#1E1E2A', margin: '24px 0' }} />
                        <p className="text-[#555] text-[10px] font-bold tracking-widest mb-3">AUTRES SECTIONS</p>
                        <div className="flex flex-col gap-2">
                            {SECTIONS.filter(s => s.id !== activeId).slice(0, 4).map(s => (
                                <button key={s.id}
                                    onClick={() => { setActiveId(s.id); window.scrollTo(0, 0); }}
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-left"
                                    style={{ background: '#111118', border: '1px solid #1E1E2A' }}>
                                    <span className="text-lg">{s.icon}</span>
                                    <span className="text-[#AAA] text-sm font-semibold flex-1">{s.label}</span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round">
                                        <polyline points="9 18 15 12 9 6"/>
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
