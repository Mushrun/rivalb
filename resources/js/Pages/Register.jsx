import { useEffect, useState } from 'react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function Register() {
    const { auth } = usePage().props;
    const { t } = useTranslation();
    useEffect(() => {
        if (auth?.user) router.replace('/battle');
    }, []);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm,  setShowConfirm]  = useState(false);

    const refCode = new URLSearchParams(window.location.search).get('ref') ?? '';

    const { data, setData, post, processing, errors } = useForm({
        username:              '',
        email:                 '',
        password:              '',
        password_confirmation: '',
        referral_code:         refCode,
    });

    const handleRegister = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <div className="flex justify-center min-h-screen" style={{ background: '#0D0D0D' }}>
            <div className="w-full max-w-[430px] min-h-screen flex flex-col px-5 py-8"
                style={{ background: '#0D0D0D' }}>

                {/* Header */}
                <div className="flex items-center justify-center mb-6">
                    <span className="text-[#FF3B30] font-black text-xl tracking-widest">RIVALBET</span>
                </div>

                {/* Logo + Title */}
                <div className="flex flex-col items-center mt-2 mb-7">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 glow-red"
                        style={{ background: '#1A1A1A', border: '1px solid #FF3B30' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/>
                            <line x1="13" y1="19" x2="19" y2="13"/>
                            <line x1="16" y1="16" x2="20" y2="20"/>
                            <line x1="19" y1="21" x2="21" y2="19"/>
                            <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/>
                            <line x1="5" y1="14" x2="8" y2="17"/>
                            <line x1="3" y1="21" x2="5" y2="19"/>
                        </svg>
                    </div>
                    <h1 className="text-[26px] font-bold text-white text-center leading-tight">
                        {t('auth.register_title')}
                    </h1>
                    <p className="text-[#888888] text-sm text-center mt-2">
                        {t('auth.register_subtitle')}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleRegister}
                    className="rounded-2xl p-5 flex flex-col gap-4"
                    style={{ background: '#1A1A1A' }}>

                    {/* Pseudo */}
                    <div>
                        <label className="text-[11px] font-semibold tracking-widest text-[#888888] mb-2 block">
                            {t('auth.pseudo')}
                        </label>
                        <input
                            type="text"
                            placeholder="KevGamer_BJ"
                            value={data.username}
                            onChange={e => setData('username', e.target.value)}
                            className="w-full rounded-xl px-4 py-3.5 text-white text-sm outline-none"
                            style={{
                                background: '#0D0D0D',
                                border: `1px solid ${errors.username ? '#FF3B30' : '#2A2A2A'}`,
                            }}
                        />
                        {errors.username && (
                            <p className="text-[#FF3B30] text-xs mt-1">{errors.username}</p>
                        )}
                    </div>

                    {/* Email */}
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

                    {/* Password */}
                    <div>
                        <label className="text-[11px] font-semibold tracking-widest text-[#888888] mb-2 block">
                            {t('auth.password_label')}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder={t('auth.new_password_placeholder')}
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                className="w-full rounded-xl px-4 py-3.5 pr-12 text-white text-sm outline-none"
                                style={{
                                    background: '#0D0D0D',
                                    border: `1px solid ${errors.password ? '#FF3B30' : '#2A2A2A'}`,
                                }}
                            />
                            <button type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2"
                                onClick={() => setShowPassword(!showPassword)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                                    {showPassword
                                        ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                                        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                                    }
                                </svg>
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-[#FF3B30] text-xs mt-1">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirm password */}
                    <div>
                        <label className="text-[11px] font-semibold tracking-widest text-[#888888] mb-2 block">
                            {t('auth.confirm_password_label')}
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                placeholder={t('auth.repeat_password')}
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                className="w-full rounded-xl px-4 py-3.5 pr-12 text-white text-sm outline-none"
                                style={{
                                    background: '#0D0D0D',
                                    border: `1px solid ${errors.password ? '#FF3B30' : '#2A2A2A'}`,
                                }}
                            />
                            <button type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2"
                                onClick={() => setShowConfirm(!showConfirm)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                                    {showConfirm
                                        ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                                        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                                    }
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Code de parrainage */}
                    <div>
                        <label className="text-[11px] font-semibold tracking-widest text-[#888888] mb-2 block">
                            {t('auth.referral_code_label')} <span className="text-[#555] normal-case font-normal">{t('auth.referral_code_optional')}</span>
                        </label>
                        <input
                            type="text"
                            placeholder="EX: AB12CD34"
                            value={data.referral_code}
                            onChange={e => setData('referral_code', e.target.value.toUpperCase())}
                            maxLength={10}
                            className="w-full rounded-xl px-4 py-3.5 text-white text-sm outline-none font-mono tracking-widest"
                            style={{
                                background: '#0D0D0D',
                                border: `1px solid ${data.referral_code ? '#FF3B30' : '#2A2A2A'}`,
                            }}
                        />
                        {errors.referral_code && (
                            <p className="text-[#FF3B30] text-xs mt-1">{errors.referral_code}</p>
                        )}
                    </div>

                    {/* CGU */}
                    <div className="flex items-start gap-3 pt-1">
                        <div className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center mt-0.5"
                            style={{ border: '2px solid #FF3B30', background: 'rgba(255,59,48,0.15)' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="3.5" strokeLinecap="round">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        </div>
                        <p className="text-[#888888] text-xs leading-relaxed">
                            {t('auth.cgu_accept')}{' '}
                            <span className="text-[#FF3B30]">{t('auth.cgu_terms')}</span>
                            {' '}{t('auth.cgu_and')}{' '}
                            <span className="text-[#FF3B30]">{t('auth.cgu_privacy')}</span>
                        </p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-xl py-3 font-bold text-sm tracking-widest text-white text-center mt-1 disabled:opacity-60"
                        style={{ background: '#FF3B30' }}>
                        {processing ? t('auth.register_processing') : t('auth.register_btn')}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px" style={{ background: '#2A2A2A' }}/>
                        <span className="text-[#555] text-xs">{t('auth.or')}</span>
                        <div className="flex-1 h-px" style={{ background: '#2A2A2A' }}/>
                    </div>

                    {/* MetaMask */}
                    <button type="button"
                        className="w-full rounded-xl py-3 font-semibold text-sm tracking-wider text-white flex items-center justify-center gap-3"
                        style={{ border: '1px solid #2A2A2A', background: 'transparent' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                            <line x1="8" y1="21" x2="16" y2="21"/>
                            <line x1="12" y1="17" x2="12" y2="21"/>
                        </svg>
                        {t('auth.register_metamask')}
                    </button>
                </form>

                {/* Login link */}
                <p className="text-center text-sm text-[#888888] mt-5">
                    {t('auth.already_account')}{' '}
                    <Link href="/login" className="text-[#FF3B30] font-semibold">{t('auth.login')}</Link>
                </p>
            </div>
        </div>
    );
}
