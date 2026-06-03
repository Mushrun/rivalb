import { useState } from 'react';

const RB_TOKEN       = import.meta.env.VITE_RB_TOKEN_ADDRESS   || '';
const PLATFORM       = import.meta.env.VITE_PLATFORM_WALLET    || '';
const BSC_CHAIN_ID   = '0x38'; // 56 en hex = BSC Mainnet

// Encode ERC-20 transfer(address,uint256) sans dépendance externe
function encodeTransfer(to, amountWei) {
    const selector      = 'a9059cbb';
    const paddedAddress = to.replace('0x', '').toLowerCase().padStart(64, '0');
    const paddedAmount  = BigInt(amountWei).toString(16).padStart(64, '0');
    return '0x' + selector + paddedAddress + paddedAmount;
}

export function useRBDeposit() {
    const [status,  setStatus]  = useState('idle');
    const [txHash,  setTxHash]  = useState(null);
    const [error,   setError]   = useState('');

    const deposit = async (amountRB) => {
        setError('');
        setTxHash(null);
        setStatus('pending');

        try {
            if (!RB_TOKEN || !PLATFORM) {
                throw new Error('Configuration du contrat RB manquante. Contacte le support.');
            }

            if (!window.ethereum) {
                throw new Error('MetaMask non détecté. Installe l\'extension.');
            }

            // Demander accès au wallet
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const from = accounts[0];

            // Vérifier qu'on est sur BSC Mainnet
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId !== BSC_CHAIN_ID) {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: BSC_CHAIN_ID }],
                });
            }

            // Convertir montant en wei (18 décimales)
            const amountWei = (BigInt(amountRB) * 10n ** 18n).toString();
            const data      = encodeTransfer(PLATFORM, amountWei);

            // Envoyer la transaction ERC-20 transfer()
            const hash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from,
                    to:   RB_TOKEN,
                    data,
                    gas:  '0x186A0', // 100 000 gas
                }],
            });

            setTxHash(hash);
            setStatus('submitted');
            return { hash, from, amountRB };

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
