import { useEffect } from 'react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function ForgotPassword() {
    const { props, props: { auth } } = usePage();
    const { t } = useTranslation();
    const sent = props.flash?.status === true;

    useEffect(() => {
        if (auth?.user) router.replace('/battle');
    }, []);

    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <div className="flex justify-center min-h-screen" style={{ background: '#0D0D0D' }}>
            <div className="w-full max-w-[430px] min-h-screen flex flex-col px-5 py-8"
                style={{ background: '#0D0D0D' }}>

                {/* Header */}
                <div className="flex items-center justify-center mb-6">
                    <span className="text-[#FF3B30] font-black text-xl tracking-widest">RIVALBET</span>
                </div>

                {/* Back */}
                <Link href="/login" className="flex items-center gap-2 mb-6 w-fit">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="19" y1="12" x2="5" y2="12"/>
                        <polyline points="12 19 5 12 12 5"/>
                    </svg>
                    <span className="text-[#888888] text-sm">{t('common.back')}</span>
                </Link>

                {!sent ? (
                    <>
                        {/* Icon + Title */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                                style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8">
                                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                </svg>
                            </div>
                            <h1 className="text-[24px] font-bold text-white text-center">
                                {t('auth.forgot_password_title')}
                            </h1>
                            <p className="text-[#888888] text-sm text-center mt-2 leading-relaxed">
                                {t('auth.forgot_subtitle')}
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit}
                            className="rounded-2xl p-5 flex flex-col gap-4"
                            style={{ background: '#1A1A1A' }}>
                            <div>
                                <label className="text-[11px] font-semibold tracking-widest text-[#888888] mb-2 block">
                                    EMAIL
                                </label>
                                <input
                                    type="email"
                                    placeholder="nom@exemple.com"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="w-full rounded-xl px-4 py-3.5 text-white text-sm outline-none"
                                    style={{
                                        background: '#0D0D0D',
                                        border: `1px solid ${errors.email ? '#FF3B30' : '#2A2A2A'}`,
                                    }}
                                />
                                {errors.email && (
                                    <p className="text-[#FF3B30] text-xs mt-1">{errors.email}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-xl py-3 font-bold text-sm tracking-widest text-white text-center disabled:opacity-60"
                                style={{ background: '#FF3B30' }}>
                                {processing ? t('auth.sending') : t('auth.send_link_btn')}
                            </button>
                        </form>
                    </>
                ) : (
                    /* Success state */
                    <div className="flex flex-col items-center mt-10">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                            style={{ background: 'rgba(76, 217, 100, 0.1)', border: '2px solid #4CD964' }}>
                            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#4CD964" strokeWidth="2.5" strokeLinecap="round">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        </div>
                        <h2 className="text-white font-bold text-2xl text-center mb-3">{t('auth.email_sent')}</h2>
                        <p className="text-[#888888] text-sm text-center leading-relaxed px-4 mb-8">
                            {t('auth.email_sent_subtitle')}
                        </p>
                        <div className="w-full rounded-2xl p-4 mb-4"
                            style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                            <p className="text-[#888888] text-xs text-center">
                                {t('auth.no_email')}{' '}
                                <Link href="/forgot-password" className="text-[#FF3B30] font-semibold">
                                    {t('auth.resend')}
                                </Link>
                            </p>
                        </div>
                        <Link href="/login"
                            className="w-full rounded-xl py-3 font-bold text-sm tracking-widest text-white text-center"
                            style={{ background: '#FF3B30' }}>
                            {t('auth.back_to_login')}
                        </Link>
                    </div>
                )}

                {!sent && (
                    <p className="text-center text-sm text-[#888888] mt-6">
                        {t('auth.remember_password')}{' '}
                        <Link href="/login" className="text-[#FF3B30] font-semibold">{t('auth.login')}</Link>
                    </p>
                )}
            </div>
        </div>
    );
}
