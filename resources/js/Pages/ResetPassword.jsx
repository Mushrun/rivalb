import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function ResetPassword({ token, email }) {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm,  setShowConfirm]  = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        token,
        email,
        password:              '',
        password_confirmation: '',
    });

    const rules = [
        { label: t('auth.rule_8chars'),   met: data.password.length >= 8 },
        { label: t('auth.rule_uppercase'), met: /[A-Z]/.test(data.password) },
        { label: t('auth.rule_number'),    met: /[0-9]/.test(data.password) },
    ];

    const strength = rules.filter(r => r.met).length;
    const strengthLabel = [t('auth.strength_weak'), t('auth.strength_weak'), t('auth.strength_medium'), t('auth.strength_strong')][strength];
    const strengthColor = ['#FF3B30', '#FF3B30', '#FF9500', '#4CD964'][strength];

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/reset-password');
    };

    return (
        <div className="flex justify-center min-h-screen" style={{ background: '#0D0D0D' }}>
            <div className="w-full max-w-[430px] min-h-screen flex flex-col px-5 py-8"
                style={{ background: '#0D0D0D' }}>

                {/* Header */}
                <div className="flex items-center justify-center mb-6">
                    <span className="text-[#FF3B30] font-black text-xl tracking-widest">RIVALBET</span>
                </div>

                {/* Icon + Title */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                        style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                    </div>
                    <h1 className="text-[24px] font-bold text-white text-center">
                        {t('auth.new_password_title')}
                    </h1>
                    <p className="text-[#888888] text-sm text-center mt-2 leading-relaxed">
                        {t('auth.new_password_subtitle')}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}
                    className="rounded-2xl p-5 flex flex-col gap-4"
                    style={{ background: '#1A1A1A' }}>

                    {/* Erreur globale (token expiré, email invalide, etc.) */}
                    {errors.email && (
                        <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)' }}>
                            <p className="text-[#FF3B30] text-sm font-semibold">{errors.email}</p>
                        </div>
                    )}
                    {errors.token && (
                        <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)' }}>
                            <p className="text-[#FF3B30] text-sm font-semibold">{errors.token}</p>
                        </div>
                    )}

                    {/* Password */}
                    <div>
                        <label className="text-[11px] font-semibold tracking-widest text-[#888888] mb-2 block">
                            {t('auth.new_password_label')}
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
                        {/* Strength bar */}
                        <div className="flex gap-1 mt-2">
                            {[1,2,3].map(i => (
                                <div key={i} className="flex-1 h-1 rounded-full transition-colors"
                                    style={{ background: i <= strength ? strengthColor : '#2A2A2A' }} />
                            ))}
                        </div>
                        {data.password.length > 0 && (
                            <p className="text-[10px] mt-1" style={{ color: strengthColor }}>
                                {strengthLabel}{strength < 3 ? ` — ${t('auth.strength_hint')}` : ` — ${t('auth.strength_ok')}`}
                            </p>
                        )}
                    </div>

                    {/* Confirm */}
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

                    {/* Rules */}
                    <div className="rounded-xl p-3 flex flex-col gap-2" style={{ background: '#0D0D0D' }}>
                        {rules.map((rule, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                    stroke={rule.met ? '#4CD964' : '#555'} strokeWidth="2.5" strokeLinecap="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                <span className="text-xs" style={{ color: rule.met ? '#4CD964' : '#666' }}>{rule.label}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-xl py-3 font-bold text-sm tracking-widest text-white disabled:opacity-60"
                        style={{ background: '#FF3B30' }}>
                        {processing ? t('auth.reset_processing') : t('auth.reset_btn')}
                    </button>
                </form>
            </div>
        </div>
    );
}
