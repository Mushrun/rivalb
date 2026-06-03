import { useEffect, useState } from 'react';
import { Link, router, useForm, usePage } from '@inertiajs/react';

export default function Login() {
    const { auth } = usePage().props;
    useEffect(() => {
        if (auth?.user) router.replace('/battle');
    }, []);
    const [showPassword,  setShowPassword]  = useState(false);
    const [metaMaskState, setMetaMaskState] = useState('idle'); // idle | loading | error
    const [metaMaskError, setMetaMaskError] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const handleLogin = (e) => {
        e.preventDefault();
        post('/login');
    };

    const handleMetaMask = async () => {
        setMetaMaskError('');

        if (typeof window.ethereum === 'undefined') {
            setMetaMaskError('MetaMask n\'est pas installé. Installe l\'extension sur ton navigateur.');
            setMetaMaskState('error');
            return;
        }

        try {
            setMetaMaskState('loading');

            // 1. Demander l'accès aux comptes
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const address  = accounts[0];

            // 2. Récupérer le nonce depuis le serveur
            const nonceRes = await fetch(`/wallet/nonce/${address}`);
            const { nonce } = await nonceRes.json();

            // 3. Signer le nonce avec MetaMask
            const message   = `Connexion RIVALBET — nonce: ${nonce}`;
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, address],
            });

            // 4. Vérifier la signature côté serveur
            const verifyRes = await fetch('/wallet/verify', {
                method:  'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
                },
                body: JSON.stringify({ address, signature }),
            });

            const result = await verifyRes.json();

            if (!verifyRes.ok) {
                setMetaMaskError(result.error ?? 'Erreur de vérification.');
                setMetaMaskState('error');
                return;
            }

            // 5. Rediriger
            router.visit(result.redirect ?? '/battle');

        } catch (err) {
            if (err.code === 4001) {
                setMetaMaskError('Connexion annulée.');
            } else {
                setMetaMaskError('Erreur MetaMask : ' + (err.message ?? 'inconnue'));
            }
            setMetaMaskState('error');
        }
    };

    const emailError = errors.email;
    const isSuspended = emailError?.includes('suspendu');
    const isBanned    = emailError?.includes('banni');
    const isPending   = isSuspended || isBanned;

    return (
        <div className="flex justify-center min-h-screen" style={{ background: '#0D0D0D' }}>
            <div className="w-full max-w-[430px] min-h-screen flex flex-col px-5 py-8"
                style={{ background: '#0D0D0D' }}>

                {/* Header */}
                <div className="flex items-center justify-center mb-6">
                    <span className="text-[#FF3B30] font-black text-xl tracking-widest">RIVALBET</span>
                </div>

                {/* Logo + Title */}
                <div className="flex flex-col items-center mt-4 mb-8">
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
                    <h1 className="text-[28px] font-bold text-white text-center leading-tight">
                        Entre dans l'arène
                    </h1>
                    <p className="text-[#888888] text-sm text-center mt-2">
                        Affronte de vrais joueurs. Chaque combat compte.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin}
                    className="rounded-2xl p-5 flex flex-col gap-4"
                    style={{ background: '#1A1A1A' }}>

                    {/* Error */}
                    {emailError && !isPending && (
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                            style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <span className="text-[#FF3B30] text-xs">{emailError}</span>
                        </div>
                    )}

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
                                border: `1px solid ${emailError ? '#FF3B30' : '#2A2A2A'}`,
                                color: '#FFFFFF',
                            }}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-[11px] font-semibold tracking-widest text-[#888888]">
                                MOT DE PASSE
                            </label>
                            <Link href="/forgot-password" className="text-[12px] text-[#888888]">
                                Mot de passe oublié ?
                            </Link>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                className="w-full rounded-xl px-4 py-3.5 pr-12 text-white text-sm outline-none"
                                style={{
                                    background: '#0D0D0D',
                                    border: `1px solid ${emailError ? '#FF3B30' : '#2A2A2A'}`,
                                }}
                            />
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2"
                                onClick={() => setShowPassword(!showPassword)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                                    {showPassword ? (
                                        <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                                    ) : (
                                        <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Login button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-xl py-3 font-bold text-sm tracking-widest text-white text-center mt-1 disabled:opacity-60"
                        style={{ background: '#FF3B30' }}>
                        {processing ? 'CONNEXION...' : 'SE CONNECTER'}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px" style={{ background: '#2A2A2A' }}/>
                        <span className="text-[#555] text-xs">OU</span>
                        <div className="flex-1 h-px" style={{ background: '#2A2A2A' }}/>
                    </div>

                    {/* MetaMask */}
                    <button type="button"
                        onClick={handleMetaMask}
                        disabled={metaMaskState === 'loading'}
                        className="w-full rounded-xl py-3 font-semibold text-sm tracking-wider text-white flex items-center justify-center gap-3 disabled:opacity-60"
                        style={{ border: '1px solid #2A2A2A', background: 'transparent' }}>
                        {metaMaskState === 'loading' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" className="animate-spin">
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                                <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m4 4V7"/>
                            </svg>
                        )}
                        {metaMaskState === 'loading' ? 'CONNEXION...' : 'SE CONNECTER AVEC METAMASK'}
                    </button>

                    {/* MetaMask error */}
                    {metaMaskError && (
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                            style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <span className="text-[#FF3B30] text-xs">{metaMaskError}</span>
                        </div>
                    )}
                </form>

                {/* Sign up link */}
                <p className="text-center text-sm text-[#888888] mt-5">
                    Pas encore de compte ?{' '}
                    <Link href="/register" className="text-[#FF3B30] font-semibold">S'inscrire</Link>
                </p>

                {/* Compte suspendu / banni */}
                {isPending && (
                    <div className="mt-4 rounded-2xl p-4 flex flex-col gap-2"
                        style={{ background: '#1A0A0A', border: '1px solid #3A1A1A' }}>
                        <div className="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <span className="text-white font-semibold text-sm">Accès limité</span>
                        </div>
                        <p className="text-[#888888] text-xs leading-relaxed">{emailError}</p>
                        <Link href="/support"
                            className="w-full rounded-xl py-2 font-semibold text-xs tracking-wider text-[#CCCCCC] mt-1 text-center"
                            style={{ border: '1px solid #3A1A1A', background: 'transparent' }}>
                            CONTACTER LE SUPPORT
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
