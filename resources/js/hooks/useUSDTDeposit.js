import { useState } from 'react';

const USDT_TOKEN   = import.meta.env.VITE_USDT_TOKEN_ADDRESS || '';
const PLATFORM     = import.meta.env.VITE_PLATFORM_WALLET    || '';
const BSC_CHAIN_ID = '0x38';

function encodeTransfer(to, amountWei) {
    const selector      = 'a9059cbb';
    const paddedAddress = to.replace('0x', '').toLowerCase().padStart(64, '0');
    const paddedAmount  = BigInt(amountWei).toString(16).padStart(64, '0');
    return '0x' + selector + paddedAddress + paddedAmount;
}

export function useUSDTDeposit() {
    const [status, setStatus] = useState('idle');
    const [txHash, setTxHash] = useState(null);
    const [error,  setError]  = useState('');

    const deposit = async (amountUSDT) => {
        setError('');
        setTxHash(null);
        setStatus('pending');

        try {
            if (!USDT_TOKEN || !PLATFORM) {
                throw new Error('Configuration USDT manquante. Contacte le support.');
            }
            if (!window.ethereum) {
                throw new Error("MetaMask non détecté. Installe l'extension.");
            }

            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const from = accounts[0];

            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId !== BSC_CHAIN_ID) {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: BSC_CHAIN_ID }],
                });
            }

            // USDT BSC a 18 décimales
            const amountWei = (BigInt(Math.floor(amountUSDT)) * 10n ** 18n).toString();
            const data      = encodeTransfer(PLATFORM, amountWei);

            const hash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [{ from, to: USDT_TOKEN, data, gas: '0x186A0' }],
            });

            setTxHash(hash);
            setStatus('submitted');
            return { hash, from, amountUSDT };

        } catch (err) {
            const msg = err.code === 4001
                ? 'Transaction annulée par l\'utilisateur.'
                : err.code === 4902
                ? 'Réseau BSC non trouvé dans MetaMask. Ajoute-le manuellement.'
                : (err.message ?? 'Erreur MetaMask.');
            setError(msg);
            setStatus('error');
            return null;
        }
    };

    const reset = () => { setStatus('idle'); setTxHash(null); setError(''); };

    return { deposit, reset, status, txHash, error };
}
