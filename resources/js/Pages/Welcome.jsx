import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

function Navbar({ isAuth }) {
    const { t } = useTranslation();
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
                    <a href="#how"        className="text-[#888] text-sm font-semibold hover:text-white transition-colors">{t('landing.nav_how')}</a>
                    <a href="#challenges" className="text-[#888] text-sm font-semibold hover:text-white transition-colors">{t('landing.nav_challenges')}</a>
                    <a href="#faq"        className="text-[#888] text-sm font-semibold hover:text-white transition-colors">{t('landing.nav_faq')}</a>
                </div>

                <div className="flex items-center gap-3">
                    {isAuth ? (
                        <Link href="/defis" className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: '#FF3B30' }}>
                            {t('landing.nav_play')}
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="text-[#888] text-sm font-semibold hover:text-white transition-colors hidden sm:block">
                                {t('landing.nav_login')}
                            </Link>
                            <Link href="/register" className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: '#FF3B30' }}>
                                {t('landing.nav_register')}
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
    const { t } = useTranslation();
    const href = isAuth ? `/defis/${challenge.id}` : '/register';
    const initials = (challenge.creator.username ?? '?').slice(0, 2).toUpperCase();

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
                    style={{ background: challenge.creator.avatar_path ? 'transparent' : '#FF3B30' }}>
                    {challenge.creator.avatar_path
                        ? <img src={`/storage/${challenge.creator.avatar_path}`} className="w-10 h-10 rounded-xl object-cover" alt="" />
                        : initials}
                </div>
                <div>
                    <p className="text-white font-bold text-sm">{challenge.creator.username}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4CD964' }} />
                        <span className="text-[#4CD964] text-[10px] font-semibold">{t('landing.challenge_reliability')} {challenge.creator.reliability_score}%</span>
                    </div>
                </div>
            </div>

            <div className="rounded-xl px-3 py-2.5 flex items-center justify-between" style={{ background: '#111' }}>
                <span className="text-[#666] text-xs font-semibold">{t('landing.challenge_bet')}</span>
                <span className="font-black text-base" style={{ color: challenge.currency === 'usdt' ? '#4CD964' : '#FF9500' }}>
                    {challenge.currency === 'usdt'
                        ? `${challenge.bet_amount} USDT`
                        : `${challenge.bet_amount.toLocaleString()} RB`}
                </span>
            </div>

            <div className="w-full py-2.5 rounded-xl text-center text-sm font-black text-white"
                style={{ background: 'linear-gradient(135deg, #FF3B30, #FF6B35)' }}>
                {t('landing.challenge_cta')}
            </div>
        </Link>
    );
}

export default function Welcome() {
    const { challenges = [], isAuth } = usePage().props;
    const { t } = useTranslation();

    const faqs = [
        { q: t('landing.faq1_q'), a: t('landing.faq1_a') },
        { q: t('landing.faq2_q'), a: t('landing.faq2_a') },
        { q: t('landing.faq3_q'), a: t('landing.faq3_a') },
        { q: t('landing.faq4_q'), a: t('landing.faq4_a') },
        { q: t('landing.faq5_q'), a: t('landing.faq5_a') },
        { q: t('landing.faq6_q'), a: t('landing.faq6_a') },
        { q: t('landing.faq7_q'), a: t('landing.faq7_a') },
    ];

    return (
        <div style={{ background: '#0A0A0A', minHeight: '100vh', color: 'white' }}>
            <Navbar isAuth={isAuth} />

            {/* ── HERO ── */}
            <section className="relative pt-24 pb-12 px-5 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,59,48,0.12) 0%, transparent 70%)' }} />

                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-bold tracking-wider"
                        style={{ background: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.3)', color: '#FF3B30' }}>
                        ⚡ {t('landing.badge')}
                    </div>

                    <h1 className="font-black leading-tight mb-5"
                        style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', letterSpacing: '-0.02em' }}>
                        {t('landing.hero_title1')}<br />
                        <span style={{ color: '#FF3B30' }}>Shadow Fight</span> {t('landing.hero_title2')}
                    </h1>

                    <p className="text-[#888] text-lg mb-2 font-medium">{t('landing.hero_sub1')}</p>
                    <p className="text-[#888] text-lg mb-2 font-medium">{t('landing.hero_sub2')}</p>
                    <p className="text-[#888] text-lg mb-2 font-medium">{t('landing.hero_sub3')}</p>
                    <p className="text-[#888] text-lg mb-5 font-medium">{t('landing.hero_sub4')}</p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5">
                        <Link href="/register"
                            className="px-8 py-4 rounded-2xl font-black text-lg text-white w-full sm:w-auto text-center"
                            style={{ background: 'linear-gradient(135deg, #FF3B30, #FF6B35)', boxShadow: '0 8px 30px rgba(255,59,48,0.4)' }}>
                            {t('landing.cta_start')}
                        </Link>
                        <a href="#how"
                            className="px-8 py-4 rounded-2xl font-bold text-base text-white w-full sm:w-auto text-center"
                            style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                            {t('landing.cta_how')}
                        </a>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-5">
                        {[t('landing.trust_payments'), t('landing.trust_players'), t('landing.trust_results'), t('landing.trust_support')].map(text => (
                            <div key={text} className="flex items-center gap-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4CD964" strokeWidth="2.5" strokeLinecap="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                <span className="text-[#888] text-sm font-semibold">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── COMMENT ÇA MARCHE ── */}
            <section id="how" className="py-12 px-5" style={{ background: '#0D0D0D' }}>
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-8">
                        <p className="text-[#FF3B30] text-xs font-black tracking-widest mb-3">{t('landing.how_label')}</p>
                        <h2 className="font-black text-3xl md:text-4xl">{t('landing.how_title')}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: '⚔️', step: '01', title: t('landing.how_step1_title'), desc: t('landing.how_step1_desc'), tags: ['1v1', '3v3'] },
                            { icon: '🎮', step: '02', title: t('landing.how_step2_title'), desc: t('landing.how_step2_desc'), tags: null },
                            { icon: '🏆', step: '03', title: t('landing.how_step3_title'), desc: t('landing.how_step3_desc'), tags: null },
                        ].map((card, i) => (
                            <div key={i} className="rounded-2xl p-6 relative" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                                <span className="absolute top-4 right-4 font-black text-4xl" style={{ color: '#1E1E1E' }}>{card.step}</span>
                                <div className="text-4xl mb-4">{card.icon}</div>
                                <h3 className="text-white font-black text-xl mb-3">{card.title}</h3>
                                <p className="text-[#777] text-sm leading-relaxed mb-4">{card.desc}</p>
                                {card.tags && (
                                    <div className="flex gap-2">
                                        {card.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 rounded-lg text-xs font-bold"
                                                style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}>{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <Link href="/register"
                            className="inline-block px-8 py-4 rounded-2xl font-black text-base text-white"
                            style={{ background: '#FF3B30' }}>
                            {t('landing.how_cta')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── DÉFIS DISPONIBLES ── */}
            <section id="challenges" className="py-12 px-5">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <p className="text-[#FF3B30] text-xs font-black tracking-widest mb-3">{t('landing.challenges_label')}</p>
                        <h2 className="font-black text-3xl md:text-4xl">{t('landing.challenges_title')}</h2>
                        <p className="text-[#666] mt-3 text-sm">{t('landing.challenges_sub')}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {challenges.map(c => (
                            <ChallengeCard key={c.id} challenge={c} isAuth={isAuth} />
                        ))}
                    </div>

                    {!isAuth && (
                        <div className="text-center mt-8">
                            <p className="text-[#666] text-sm mb-4">{t('landing.challenge_login_hint')}</p>
                            <Link href="/register"
                                className="inline-block px-8 py-4 rounded-2xl font-black text-base text-white"
                                style={{ background: '#FF3B30' }}>
                                {t('landing.challenge_register_cta')}
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* ── POURQUOI NOUS ── */}
            <section className="py-12 px-5" style={{ background: '#0D0D0D' }}>
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-8">
                        <p className="text-[#FF3B30] text-xs font-black tracking-widest mb-3">{t('landing.why_label')}</p>
                        <h2 className="font-black text-3xl md:text-4xl">{t('landing.why_title')}</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { icon: '🔥', title: t('landing.why1_title'), desc: t('landing.why1_desc') },
                            { icon: '🏆', title: t('landing.why2_title'), desc: t('landing.why2_desc') },
                            { icon: '🎯', title: t('landing.why3_title'), desc: t('landing.why3_desc') },
                            { icon: '💰', title: t('landing.why4_title'), desc: t('landing.why4_desc') },
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
            <section className="py-12 px-5">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <p className="text-[#FF3B30] text-xs font-black tracking-widest mb-4">{t('landing.trust_label')}</p>
                            <h2 className="font-black text-3xl md:text-4xl mb-5">{t('landing.trust_title')}</h2>
                            <p className="text-[#777] text-sm leading-relaxed mb-6">{t('landing.trust_desc')}</p>

                            <div className="flex flex-col gap-4">
                                {[
                                    t('landing.trust_point1'),
                                    t('landing.trust_point2'),
                                    t('landing.trust_point3'),
                                    t('landing.trust_point4'),
                                    t('landing.trust_point5'),
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
                            <p className="text-[#555] text-xs font-bold tracking-widest mb-4">{t('landing.validation_label')}</p>
                            <div className="flex flex-col gap-3">
                                {[
                                    t('landing.validation_step1'),
                                    t('landing.validation_step2'),
                                    t('landing.validation_step3'),
                                    t('landing.validation_step4'),
                                ].map((step, i) => (
                                    <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: '#111' }}>
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
            <section id="faq" className="py-12 px-5" style={{ background: '#0D0D0D' }}>
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-8">
                        <p className="text-[#FF3B30] text-xs font-black tracking-widest mb-3">{t('landing.faq_label')}</p>
                        <h2 className="font-black text-3xl md:text-4xl">{t('landing.faq_title')}</h2>
                    </div>
                    <div className="flex flex-col gap-3">
                        {faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ── */}
            <section className="py-16 px-5 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 100% 80% at 50% 50%, rgba(255,59,48,0.15) 0%, transparent 70%)' }} />
                <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                <div className="max-w-2xl mx-auto text-center relative z-10">
                    <div className="text-6xl mb-5">⚔️</div>
                    <h2 className="font-black leading-tight mb-4"
                        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                        {t('landing.final_title')}
                    </h2>
                    <p className="text-[#777] text-lg mb-1">{t('landing.final_sub1')}</p>
                    <p className="text-[#777] text-lg mb-8">{t('landing.final_sub2')}</p>

                    <Link href="/register"
                        className="inline-block px-10 py-5 rounded-2xl font-black text-xl text-white"
                        style={{ background: 'linear-gradient(135deg, #FF3B30, #FF6B35)', boxShadow: '0 12px 40px rgba(255,59,48,0.5)' }}>
                        {t('landing.final_cta')}
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
                <p className="text-[#444] text-xs">© 2026 Rivalbet · {t('landing.footer')}</p>
            </footer>
        </div>
    );
}
