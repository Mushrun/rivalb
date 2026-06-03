import { useState } from 'react';

export function useMetaMask() {
    const [status,  setStatus]  = useState('idle'); // idle | connecting | signing | success | error
    const [address, setAddress] = useState(null);
    const [error,   setError]   = useState('');

    const isAvailable = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';

    const connect = async () => {
        setError('');

        if (!isAvailable) {
            setError('MetaMask n\'est pas installé. Installe l\'extension MetaMask pour continuer.');
            setStatus('error');
            return null;
        }

        try {
            setStatus('connecting');

            // Request wallet access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account  = accounts[0].toLowerCase();
            setAddress(account);

            setStatus('signing');

            // Fetch nonce from backend
            const nonceRes = await fetch(`/wallet/nonce/${account}`, {
                headers: { 'Accept': 'application/json' },
            });
            const { nonce } = await nonceRes.json();

            // Sign the nonce
            const message   = `Connexion RIVALBET — nonce: ${nonce}`;
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, account],
            });

            setStatus('success');
            return { address: account, signature, message: nonce };
        } catch (err) {
            if (err.code === 4001) {
                setError('Signature refusée. Tu dois signer le message pour continuer.');
            } else {
                setError(err.message ?? 'Erreur MetaMask.');
            }
            setStatus('error');
            return null;
        }
    };

    const reset = () => { setStatus('idle'); setError(''); setAddress(null); };

    return { connect, reset, status, address, error, isAvailable };
}
