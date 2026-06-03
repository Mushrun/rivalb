import { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function AdminLogin() {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        email:    '',
        password: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-5" style={{ background: '#0A0A0A' }}>
            <div className="w-full max-w-sm">

                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#FF3B30' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/>
                            <line x1="13" y1="19" x2="19" y2="13"/>
                        </svg>
                    </div>
                    <p className="text-white font-black text-xl tracking-wider">RIVALBET</p>
                    <p className="text-[#555] text-xs tracking-widest mt-0.5">ACCÈS ADMINISTRATEUR</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: '#1A1A1A' }}>

                    {errors.email && (
                        <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.3)' }}>
                            <p className="text-[#FF3B30] text-sm font-semibold">{errors.email}</p>
                        </div>
                    )}

                    <div>
                        <label className="text-[#888] text-xs font-semibold tracking-wider block mb-2">EMAIL</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            placeholder="admin@rivalbet.com"
                            required
                            className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                            style={{
                                background: '#0D0D0D',
                                border: `1px solid ${errors.email ? '#FF3B30' : '#2A2A2A'}`,
                            }}
                        />
                    </div>

                    <div>
                        <label className="text-[#888] text-xs font-semibold tracking-wider block mb-2">MOT DE PASSE</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 pr-12 rounded-xl text-white text-sm outline-none"
                                style={{
                                    background: '#0D0D0D',
                                    border: `1px solid ${errors.email ? '#FF3B30' : '#2A2A2A'}`,
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
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3 rounded-xl font-black text-sm tracking-wider mt-1 disabled:opacity-60"
                        style={{ background: '#FF3B30', color: '#FFF' }}>
                        {processing ? 'CONNEXION...' : 'SE CONNECTER'}
                    </button>
                </form>

                <p className="text-center text-[#333] text-xs mt-6">
                    Accès réservé aux administrateurs
                </p>
            </div>
        </div>
    );
}
